const Anthropic = require('@anthropic-ai/sdk');

const AURAS  = ['CRIMSON','SAPPHIRE','EMERALD','GOLD','VIOLET','SILVER'];
const ASUBS  = ['Passionate & Bold','Intellectual & Analytical','Creative & Expressive','Influential & Inspiring','Mysterious & Niche','Balanced & Versatile'];
const TRIBES = ['THE WARRIOR','THE SCHOLAR','THE CREATOR','THE JESTER','THE ORACLE','THE ELDER'];
const TSUBS  = ['Debater & Challenger','Educator & Analyst','Artist & Storyteller','Entertainer & Satirist','Visionary & Predictor','Veteran & Connector'];
const SIGS   = ['STATIC','NOISE','WAVE','PULSE','BROADCAST','NEXUS'];

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function analyzeIdentity({ username, displayName, bio, followersCount, signalLevel }) {
  const prompt = `You are a digital identity analyst. Analyze this X (Twitter) user and return ONLY a JSON object.

User: @${username} (${displayName})
Bio: "${bio || 'No bio provided'}"
Followers: ${followersCount.toLocaleString()}
Signal Level: ${signalLevel}/6 (${SIGS[signalLevel-1]})

Based on the username, display name, and bio, determine:

1. AURA index 0-5:
   0=CRIMSON (passionate, bold, emotional, controversial)
   1=SAPPHIRE (intellectual, analytical, data-driven)
   2=EMERALD (creative, artistic, expressive)
   3=GOLD (inspirational, influential, motivational)
   4=VIOLET (mysterious, niche, underground)
   5=SILVER (balanced, versatile, neutral)

2. TRIBE index 0-5:
   0=THE WARRIOR (debater, challenger)
   1=THE SCHOLAR (educator, analyst)
   2=THE CREATOR (artist, builder)
   3=THE JESTER (entertainer, satirist)
   4=THE ORACLE (visionary, predictor)
   5=THE ELDER (connector, veteran)

3. NARRATIVE: 2-3 sentences. Cyberpunk oracle style, 2nd person "you", mystical + data-driven. Max 60 words.

Return ONLY this JSON:
{"auraIndex":<0-5>,"tribeIndex":<0-5>,"narrative":"<text>"}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  const raw   = msg.content[0]?.text || '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  const result = JSON.parse(clean);

  return {
    auraIndex:  Math.max(0, Math.min(5, result.auraIndex ?? 0)),
    tribeIndex: Math.max(0, Math.min(5, result.tribeIndex ?? 0)),
    narrative:  result.narrative || ''
  };
}

function fallbackIdentity(username, signalLevel) {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = Math.imul(31, h) + username.charCodeAt(i) | 0;
  const rand = () => { h = Math.imul(h ^ h>>>16, 0x45d9f3b); h ^= h>>>16; return (h>>>0)/0xffffffff; };
  return {
    auraIndex:  Math.floor(rand() * 6),
    tribeIndex: Math.floor(rand() * 6),
    narrative:  `Your digital signal pulses at ${SIGS[signalLevel-1]} frequency. The grid has logged your presence since you first connected.`
  };
}

module.exports = { analyzeIdentity, fallbackIdentity, SIGS };
