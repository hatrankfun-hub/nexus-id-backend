const axios = require('axios');

const supabase = axios.create({
  baseURL: `${process.env.SUPABASE_URL}/rest/v1`,
  headers: {
    'apikey':        process.env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation'
  }
});

async function getResult(username) {
  try {
    const { data } = await supabase.get('/nexus_results', {
      params: { username: `eq.${username}`, limit: 1 }
    });
    return data[0] || null;
  } catch { return null; }
}

async function upsertResult(record) {
  try {
    await supabase.post('/nexus_results', record, {
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' }
    });
  } catch (err) {
    console.error('[DB] Upsert failed:', err.message);
  }
}

module.exports = { getResult, upsertResult };
