const express    = require('express');
const rateLimit  = require('express-rate-limit');
const xApi       = require('../services/xApiService');
const { calcActivityScore, calcSignalLevel } = require('../services/nexusEngine');
const { analyzeIdentity, fallbackIdentity }  = require('../services/aiService');
const db         = require('../services/dbService');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15*60*1000, max: 20 });

function validUsername(u) {
  return typeof u === 'string' && /^[a-zA-Z0-9_]{1,50}$/.test(u);
}

router.post('/', limiter, async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!validUsername(username)) return res.status(400).json({ error: 'Invalid username' });
    const key = username.toLowerCase();

    // Cek cache (1 jam)
    const cached = await db.getResult(key);
    if (cached && isFresh(cached.last_fetched_at)) {
      return res.json({ ...cached, source: 'cache' });
    }

    // Fetch X API
    let xProfile, timeline;
    try {
      xProfile = await xApi.fetchUserProfile(username);
      timeline = await xApi.fetchTimeline(xProfile.id);
    } catch (err) {
      if (cached) return res.json({ ...cached, source: 'db_stale' });
      throw new Error('X API error: ' + err.message);
    }

    const metrics     = xProfile.public_metrics;
    const dist        = xApi.calcDistribution(timeline);
    const engRate     = xApi.calcEngagementRate(timeline, metrics.followers_count);
    const activityScore = calcActivityScore({
      followersCount: metrics.followers_count,
      tweetCount:     metrics.tweet_count,
      engagementRate: engRate,
      joinedAt:       xProfile.created_at
    });
    const signalLevel = calcSignalLevel(activityScore);

    // AI analisis konten tweet + bio → Aura, Tribe, Narrative
    let aiResult;
    try {
      aiResult = await analyzeIdentity({
        username:       key,
        displayName:    xProfile.name,
        bio:            xProfile.description || '',
        recentTweets:   timeline,
        followersCount: metrics.followers_count,
        engagementRate: engRate,
        signalLevel
      });
    } catch (err) {
      console.error('[AI] analyzeIdentity failed:', err.message);
      aiResult = fallbackIdentity(key, signalLevel);
    }

    const record = {
      username:           key,
      display_name:       xProfile.name,
      bio:                xProfile.description || '',
      profile_image:      xProfile.profile_image_url || '',
      followers_count:    metrics.followers_count,
      following_count:    metrics.following_count,
      tweet_count:        metrics.tweet_count,
      engagement_rate:    engRate,
      activity_score:     activityScore,
      original_tweet_pct: dist.original,
      joined_at:          xProfile.created_at || null,
      aura_index:         aiResult.auraIndex,
      tribe_index:        aiResult.tribeIndex,
      signal_level:       signalLevel,
      ai_narrative:       aiResult.narrative,
      last_fetched_at:    new Date().toISOString()
    };

    await db.upsertResult(record);
    return res.json({ ...record, source: 'fresh' });

  } catch (err) { next(err); }
});

router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!validUsername(username)) return res.status(400).json({ error: 'Invalid username' });
    const result = await db.getResult(username.toLowerCase());
    if (!result) return res.status(404).json({ error: 'Not found' });
    return res.json(result);
  } catch (err) { next(err); }
});

function isFresh(ts) {
  if (!ts) return false;
  return (Date.now() - new Date(ts).getTime()) < 3600 * 1000;
}

module.exports = router;
