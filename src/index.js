require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const analyzeRouter = require('./routes/analyze');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use('/api/analyze', analyzeRouter);

app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'NEXUS ID API', ts: new Date().toISOString()
}));

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`[NEXUS ID] API running on port ${PORT}`));
