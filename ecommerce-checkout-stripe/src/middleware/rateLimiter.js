const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({
  windowMs: parseInt(process.env.CHECKOUT_RATE_LIMIT_WINDOW_MS) || 60_000,
  max:      parseInt(process.env.CHECKOUT_RATE_LIMIT_MAX)        || 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    error: {
      code:    'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      details: {},
    },
  },
});

module.exports = { checkoutLimiter };
