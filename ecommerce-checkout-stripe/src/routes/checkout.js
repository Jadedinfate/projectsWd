const express                       = require('express');
const { v4: uuidv4 }                = require('uuid');
const db                            = require('../db/connection');
const stripe                        = require('../services/stripeClient');
const { recalculateTotal }          = require('../services/pricing');
const { checkAvailability }         = require('../services/inventory');
const { checkoutLimiter }           = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/checkout
router.post('/', checkoutLimiter, async (req, res, next) => {
  try {
    const { items, email } = req.body;

    // ── Validation ─────────────────────────────────────────────────────────
    if (!email || !Array.isArray(items) || items.length === 0) {
      const err = new Error('email and items[] are required.');
      err.code       = 'VALIDATION_ERROR';
      err.statusCode = 400;
      return next(err);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new Error('Invalid email format.');
      err.code       = 'VALIDATION_ERROR';
      err.statusCode = 400;
      return next(err);
    }

    // ── Server-side price authority ────────────────────────────────────────
    const { lineItems, totalCents } = await recalculateTotal(items);

    // ── Inventory check ────────────────────────────────────────────────────
    checkAvailability(lineItems);

    // ── Create idempotent PaymentIntent on Stripe ─────────────────────────
    const orderId        = uuidv4();
    const idempotencyKey = `checkout-${orderId}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount:        totalCents,
        currency:      'usd',
        receipt_email: email,
        metadata:      { orderId, customerEmail: email },
      },
      { idempotencyKey }
    );

    // ── Persist order + line items ─────────────────────────────────────────
    await db.createOrderWithItems({
      id:                       orderId,
      stripe_payment_intent_id: paymentIntent.id,
      amount_total_cents:       totalCents,
      customer_email:           email,
      idempotency_key:          idempotencyKey,
      lineItems
    });

    res.json({
      clientSecret:      paymentIntent.client_secret,
      orderId,
      totalAmountCents:  totalCents,
    });
  } catch (err) {
    // Map Stripe API errors to 502
    if (err.type && err.type.startsWith('Stripe')) {
      err.statusCode = 502;
      err.code       = 'STRIPE_ERROR';
    }
    next(err);
  }
});

module.exports = router;
