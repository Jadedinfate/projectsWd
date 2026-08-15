require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Webhook route — raw body BEFORE express.json() ────────────────────────
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

// ── Standard middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/config',   require('./routes/config'));
app.use('/api/products', require('./routes/products'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/orders',   require('./routes/orders'));

// ── Catch-all static route fallback for SPA frontend (Express 5 compatible) ─
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});

// ── Global error handler (must be last) ──────────────────────────────────
app.use(require('./middleware/errorHandler'));

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀  Server running on http://localhost:${PORT}\n`);
  });
}

module.exports = app;
