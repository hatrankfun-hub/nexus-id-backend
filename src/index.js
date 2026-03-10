require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const analyzeRouter = require('./routes/analyze');

const app  = express();
const PORT = process.env.PORT || 3000;

// Trust Railway proxy
app.set('trust proxy', 1);

app.use(cors({ origin: '*', methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.options('*', cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use('/api/analyze', analyzeRouter);

app.get('/health', (_, res) => res.json({
  status: 'ok', service: 'NEXUS ID API', ts: new Date().toISOString()
}));

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`[NEXUS ID] API running on port ${PORT}`));
