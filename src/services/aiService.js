const Anthropic = require('@anthropic-ai/sdk');

const AURAS  = ['CRIMSON','SAPPHIRE','EMERALD','GOLD','VIOLET','SILVER'];
const ASUBS  = ['Passionate & Bold','Intellectual & Analytical','Creative & Expressive','Influential & Inspiring','Mysterious & Niche','Balanced & Versatile'];
const TRIBES = ['THE WARRIOR','THE SCHOLAR','THE CREATOR','THE JESTER','THE ORACLE','THE ELDER'];
const TSUBS  = ['Debater & Challenger','Educator & Analyst','Artist & Storyteller','Entertainer & Satirist','Visionary & Predictor','Veteran & Connector'];
const SIGS   = ['STATIC','NOISE','WAVE','PULSE','BROADCAST','NEXUS'];

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyzeIdentity({ username, displayName, bio, recentTweets, followersCount, engagementRate, signalLevel }) {
  const tweetSample = recentTweets.slice(0, 20).map(t => t.text).join('\n---\n');

  const prompt = `You are a digital identity analyst. Analyze this X (Twitter) user and return ONLY a JSON object.

User: @${username} (${displayName})
Bio: ${bio || 'No bio'}
Followers: ${followersCount.toLocaleString()}
Engagement Rate: ${engagementRate}%
Signal Level: ${signalLevel}/6 (${SIGS[signalLevel-1]})

Recent tweets sample:
${tweetSample || 'No tweets available'}

Based on the bio and tweets content, determine:
1. AURA: which color best represents their energy? Choose index 0-5:
   0=CRIMSON (passionate, aggressive, emotional, controversial)
   1=SAPPHIRE (intellectual, analytical, data-driven, educational)  
   2=EMERALD (creative, artistic, storytelling, expressive)
   3=GOLD (inspirational, motivational, leadership, influential)
   4=VIOLET (mysterious, niche, esoteric, underground)
   5=SILVER (balanced, versatile, diplomatic, neutral)

2. TRIBE: what role do they play? Choose index 0-5:
   0=THE WARRIOR (debater, challenger, confrontational)
   1=THE SCHOLAR (educator, analyst, researcher)
   2=THE CREATOR (artist, builder, storyteller)
   3=THE JESTER (entertainer, meme-lord, satirist)
   4=THE ORACLE (visionary, predictor, thought-leader)
   5=THE ELDER (connector, veteran, community-builder)

3. NARRATIVE: write 2-3 sentences about their digital identity. Cyberpunk oracle style, 2nd person "you", mystical yet data-driven. Max 60 words.

Return ONLY this JSON, no other text:
{
  "auraIndex": <0-5>,
  "tribeIndex": <0-5>,
  "narrative": "<narrative text>"
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  const raw = msg.content[0]?.text || '';
  const clean = raw.replace(/```json|```/g, '').trim();
  const result = JSON.parse(clean);

  return {
    auraIndex:  Math.max(0, Math.min(5, result.auraIndex)),
    tribeIndex: Math.max(0, Math.min(5, result.tribeIndex)),
    narrative:  result.narrative || ''
  };
}

// Fallback jika AI gagal
function fallbackIdentity(username, signalLevel) {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = Math.imul(31, h) + username.charCodeAt(i) | 0;
  const rand = () => { h = Math.imul(h ^ h>>>16, 0x45d9f3b); h ^= h>>>16; return (h>>>0)/0xffffffff; };
  return {
    auraIndex:  Math.floor(rand() * 6),
    tribeIndex: Math.floor(rand() * 6),
    narrative:  `Your digital signal pulses at ${SIGS[signalLevel-1]} frequency through the network. The grid recognizes your presence.`
  };
}

module.exports = { analyzeIdentity, fallbackIdentity, AURAS, ASUBS, TRIBES, TSUBS, SIGS };
