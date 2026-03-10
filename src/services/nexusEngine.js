function seededRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return function() {
    h = Math.imul(h ^ h >>> 16, 0x45d9f3b);
    h = Math.imul(h ^ h >>> 16, 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 0xffffffff;
  };
}

function calcActivityScore({ followersCount, tweetCount, engagementRate, joinedAt }) {
  const followerScore = Math.min(30, (Math.log10(Math.max(followersCount, 1)) / 7) * 30);
  const tweetScore    = Math.min(25, (Math.log10(Math.max(tweetCount, 1)) / 5) * 25);
  const engScore      = Math.min(25, (Math.min(engagementRate, 10) / 10) * 25);
  const years = joinedAt
    ? (Date.now() - new Date(joinedAt).getTime()) / (1000*60*60*24*365)
    : 0;
  const ageScore = Math.min(20, (years / 10) * 20);
  return Math.round(Math.min(100, Math.max(0, followerScore + tweetScore + engScore + ageScore)));
}

function calcIdentity({ username, followersCount, tweetCount, engagementRate, joinedAt }) {
  const rand          = seededRand(username.toLowerCase());
  const activityScore = calcActivityScore({ followersCount, tweetCount, engagementRate, joinedAt });
  const auraIndex     = Math.floor(rand() * 6);
  const tribeIndex    = Math.floor(rand() * 6);
  const signalLevel   = Math.max(1, Math.min(6, Math.ceil(activityScore / 17)));
  return { activityScore, auraIndex, tribeIndex, signalLevel };
}

module.exports = { calcIdentity, calcActivityScore };
