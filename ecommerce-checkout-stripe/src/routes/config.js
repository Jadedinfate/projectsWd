const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
  res.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

module.exports = router;
