const express            = require('express');
const stripe             = require('../services/stripeClient');
const db                 = require('../db/connection');
const { decrementStock } = require('../services/inventory');

const router = express.Router();

// POST /api/webhooks  — raw body required for signature verification
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // If no webhook secret is configured, skip signature verification (dev mode)
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_...') {
    console.warn('[Webhook] ⚠️  No STRIPE_WEBHOOK_SECRET set — skipping signature check (DEV MODE)');
    try {
      event = JSON.parse(req.body.toString());
    } catch (err) {
      return res.status(400).json({ error: { code: 'INVALID_BODY', message: 'Could not parse webhook body.' } });
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`[Webhook] Signature verification failed: ${err.message}`);
      return res.status(400).json({
        error: { code: 'INVALID_SIGNATURE', message: err.message },
      });
    }
  }

  console.log(`[Webhook] Event received: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'charge.refunded':
      await handleRefunded(event.data.object);
      break;

    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

// ── Event handlers ────────────────────────────────────────────────────────

async function handlePaymentSucceeded(paymentIntent) {
  const order = await db.getOrderByPaymentIntentId(paymentIntent.id);

  if (!order) {
    console.warn(`[Webhook] payment_intent.succeeded — unknown PI: ${paymentIntent.id}`);
    return;
  }

  // Idempotency guard — only process once
  if (order.status === 'PAID') {
    console.log(`[Webhook] Order ${order.id} already PAID — skipping.`);
    return;
  }

  // Decrement inventory (non-blocking — log error but don't fail fulfillment)
  const items = await db.getOrderItems(order.id);
  const lineItems = [];
  for (const item of items) {
    const product = await db.getProductById(item.product_id);
    if (product) lineItems.push({ product, quantity: item.quantity });
  }

  try {
    await decrementStock(lineItems);
  } catch (err) {
    console.error(
      `[Webhook] Inventory decrement failed for order ${order.id}: ${err.message}`
    );
  }

  await db.updateOrderStatus(order.id, 'PAID');
  console.log(`[Webhook] ✅ Order ${order.id} marked PAID.`);
}

async function handlePaymentFailed(paymentIntent) {
  const order = await db.getOrderByPaymentIntentId(paymentIntent.id);

  if (!order) {
    console.warn(`[Webhook] payment_intent.payment_failed — unknown PI: ${paymentIntent.id}`);
    return;
  }

  await db.updateOrderStatus(order.id, 'FAILED');
  console.log(`[Webhook] ❌ Order ${order.id} marked FAILED.`);
}

async function handleRefunded(charge) {
  const order = await db.getOrderByPaymentIntentId(charge.payment_intent);

  if (!order) {
    console.warn(`[Webhook] charge.refunded — unknown PI: ${charge.payment_intent}`);
    return;
  }

  await db.updateOrderStatus(order.id, 'REFUNDED');
  console.log(`[Webhook] 💸 Order ${order.id} marked REFUNDED.`);
}

module.exports = router;
