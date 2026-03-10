const Anthropic = require('@anthropic-ai/sdk');

const AURAS  = ['CRIMSON','SAPPHIRE','EMERALD','GOLD','VIOLET','SILVER'];
const ASUBS  = ['Passionate & Bold','Intellectual & Analytical','Creative & Expressive','Influential & Inspiring','Mysterious & Niche','Balanced & Versatile'];
const TRIBES = ['THE WARRIOR','THE SCHOLAR','THE CREATOR','THE JESTER','THE ORACLE','THE ELDER'];
const TSUBS  = ['Debater & Challenger','Educator & Analyst','Artist & Storyteller','Entertainer & Satirist','Visionary & Predictor','Veteran & Connector'];
const SIGS   = ['STATIC','NOISE','WAVE','PULSE','BROADCAST','NEXUS'];

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateNarrative({ username, displayName, auraIndex, tribeIndex, signalLevel, engagementRate, followersCount }) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a 2-3 sentence digital identity profile for X user @${username} (${displayName}).
Identity: ${AURAS[auraIndex]} Aura (${ASUBS[auraIndex]}), ${TRIBES[tribeIndex]} (${TSUBS[tribeIndex]}), Signal: ${SIGS[signalLevel-1]} Level ${signalLevel}/6.
Stats: ${followersCount.toLocaleString()} followers, ${engagementRate}% engagement.
Style: cyberpunk oracle, mystical yet data-driven, 2nd person "you". No hashtags. Max 60 words.`
    }]
  });
  return msg.content[0]?.text || '';
}

module.exports = { generateNarrative };
