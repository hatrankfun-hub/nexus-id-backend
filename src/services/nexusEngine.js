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

function calcSignalLevel(activityScore) {
  return Math.max(1, Math.min(6, Math.ceil(activityScore / 17)));
}

module.exports = { calcActivityScore, calcSignalLevel };
