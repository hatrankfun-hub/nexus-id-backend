const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` }
});

// Hanya fetch profile — tidak perlu timeline (hindari 402)
async function fetchUserProfile(username) {
  const { data } = await client.get(`/users/by/username/${username}`, {
    params: {
      'user.fields': 'public_metrics,created_at,description,profile_image_url'
    }
  });
  if (!data.data) throw new Error(`User @${username} not found`);
  return data.data;
}

// Return empty — X free tier tidak support timeline
async function fetchTimeline(userId) {
  return [];
}

function calcDistribution(tweets) {
  return { original: 0, reply: 0, retweet: 0, quote: 0 };
}

function calcEngagementRate(tweets, followersCount) {
  return 0;
}

module.exports = { fetchUserProfile, fetchTimeline, calcDistribution, calcEngagementRate };
