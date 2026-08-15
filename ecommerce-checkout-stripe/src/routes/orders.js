const express = require('express');
const db      = require('../db/connection');
const stripe  = require('../services/stripeClient');
const router  = express.Router();

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await db.getOrderById(req.params.id);

    if (!order) {
      const err = new Error('Order not found.');
      err.code       = 'ORDER_NOT_FOUND';
      err.statusCode = 404;
      return next(err);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/refund
router.post('/:id/refund', async (req, res, next) => {
  try {
    const order = await db.getOrderById(req.params.id);

    if (!order) {
      const err = new Error('Order not found.');
      err.code       = 'ORDER_NOT_FOUND';
      err.statusCode = 404;
      return next(err);
    }

    if (order.status !== 'PAID') {
      const err = new Error('Only PAID orders can be refunded.');
      err.code       = 'INVALID_ORDER_STATUS';
      err.statusCode = 400;
      return next(err);
    }

    const { amountCents } = req.body;
    const refundParams    = { payment_intent: order.stripe_payment_intent_id };
    if (amountCents) refundParams.amount = amountCents;

    const refund = await stripe.refunds.create(refundParams);

    await db.updateOrderStatus(order.id, 'REFUNDED');

    res.json({ refundId: refund.id, status: refund.status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
