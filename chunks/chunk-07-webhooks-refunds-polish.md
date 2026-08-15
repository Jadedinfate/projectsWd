# Chunk 07 — Webhooks, Refunds & Final Polish

## Goal
Implement the `POST /api/webhooks` route (Stripe signature verification + event handling), complete the inventory decrement on payment success, wire up the refund endpoint, and perform a final end-to-end test with the Stripe CLI.

---

## Prerequisites
- Chunks 01–06 complete
- Stripe CLI installed and authenticated (`stripe login`)
- `STRIPE_WEBHOOK_SECRET` set in `.env` (obtained from CLI in step below)

---

## Steps

### 1. `src/routes/webhooks.js`

> **Critical**: This route must use `express.raw()` parsing (not `express.json()`) — it must be mounted in `app.js` **before** the `express.json()` middleware. (Already noted in Chunk 03.)

```js
const express = require('express');
const stripe = require('../services/stripeClient');
const db = require('../db/connection');
const { decrementStock } = require('../services/inventory');
const { recalculateTotal } = require('../services/pricing');

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).json({
      error: { code: 'INVALID_SIGNATURE', message: err.message }
    });
  }

  console.log(`[Webhook] Received: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      handlePaymentSucceeded(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      handlePaymentFailed(event.data.object);
      break;

    case 'charge.refunded':
      handleRefunded(event.data.object);
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  // Acknowledge immediately — processing is synchronous here but in production
  // consider moving heavy work to a queue/worker for true async decoupling.
  res.json({ received: true });
});

// ── Handlers ─────────────────────────────────────────────────────────────────

function handlePaymentSucceeded(paymentIntent) {
  const order = db
    .prepare('SELECT * FROM orders WHERE stripe_payment_intent_id = ?')
    .get(paymentIntent.id);

  if (!order) {
    console.warn(`[Webhook] payment_intent.succeeded — unknown PI: ${paymentIntent.id}`);
    return;
  }

  // Idempotency guard — only process once
  if (order.status === 'PAID') {
    console.log(`[Webhook] Order ${order.id} already PAID, skipping.`);
    return;
  }

  // Decrement inventory
  const lineItems = db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(order.id)
    .map(item => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      return { product, quantity: item.quantity };
    });

  try {
    decrementStock(lineItems);
  } catch (err) {
    console.error(`[Webhook] Inventory decrement failed for order ${order.id}: ${err.message}`);
    // Do NOT block order fulfillment over stock tracking; log and continue
  }

  // Mark order as PAID
  db.prepare(`UPDATE orders SET status = 'PAID', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(order.id);

  console.log(`[Webhook] Order ${order.id} marked PAID.`);
}

function handlePaymentFailed(paymentIntent) {
  const order = db
    .prepare('SELECT * FROM orders WHERE stripe_payment_intent_id = ?')
    .get(paymentIntent.id);

  if (!order) {
    console.warn(`[Webhook] payment_intent.payment_failed — unknown PI: ${paymentIntent.id}`);
    return;
  }

  db.prepare(`UPDATE orders SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(order.id);

  console.log(`[Webhook] Order ${order.id} marked FAILED.`);
}

function handleRefunded(charge) {
  // charge.refunded fires when a PaymentIntent is fully refunded
  const order = db
    .prepare('SELECT * FROM orders WHERE stripe_payment_intent_id = ?')
    .get(charge.payment_intent);

  if (!order) {
    console.warn(`[Webhook] charge.refunded — unknown PI: ${charge.payment_intent}`);
    return;
  }

  db.prepare(`UPDATE orders SET status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(order.id);

  console.log(`[Webhook] Order ${order.id} marked REFUNDED via webhook.`);
}

module.exports = router;
```

---

### 2. Final `src/app.js` — complete assembled version

```js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const productRoutes  = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes    = require('./routes/orders');
const webhookRoutes  = require('./routes/webhooks');
const configRoutes   = require('./routes/config');
const errorHandler   = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Webhook MUST receive raw body — mount BEFORE express.json() ────────────
app.use('/api/webhooks', webhookRoutes);

// ── Standard middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/config',   configRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders',   orderRoutes);

// ── Global error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
```

---

### 3. Local Webhook Testing with Stripe CLI

```bash
# Step 1: Authenticate (one-time)
stripe login

# Step 2: Forward events to your server
stripe listen --forward-to localhost:3000/api/webhooks
# Copy the "webhook signing secret" printed: whsec_...
# Paste it into .env as STRIPE_WEBHOOK_SECRET=whsec_...
# Restart your dev server after updating .env

# Step 3: Trigger test events (in a separate terminal)
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

---

### 4. Test Cards Reference

| Card Number | Scenario |
|---|---|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0000 0000 0085` | ❌ Insufficient funds |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |

All test cards use: any future expiry date, any 3-digit CVC.

---

### 5. Final Polish Checklist

#### Backend
- [ ] All error responses use `{ error: { code, message, details } }` shape
- [ ] `STRIPE_WEBHOOK_SECRET` is set and signature verification works
- [ ] Idempotency guard prevents double-decrement if webhook fires twice
- [ ] Unknown PI logged as anomaly, not silently dropped
- [ ] Rate limiter active on `POST /api/checkout`

#### Frontend
- [ ] `prefers-reduced-motion` tested in DevTools → animations suppressed
- [ ] Focus outlines visible on all interactive elements (Tab through page)
- [ ] Mobile viewport tested (≤ 480px)
- [ ] 3DS test card completes successfully
- [ ] Cart clears after successful payment
- [ ] Declined card shows inline error, form stays usable

#### Security
- [ ] `.env` is gitignored
- [ ] `STRIPE_SECRET_KEY` never appears in public/ directory
- [ ] Webhook raw body route mounted before `express.json()`
- [ ] Server-side price recalculation verified (client prices discarded)

---

## End-to-End Verification Flow

```
1. seed:    node scripts/seed.js
2. server:  npm run dev
3. cli:     stripe listen --forward-to localhost:3000/api/webhooks
4. browser: http://localhost:3000
5.          Add 2 products to cart
6.          Checkout → enter email
7.          Card: 4242 4242 4242 4242 → PAY NOW
8.          ✅ Success state shown, cart cleared
9. verify:  curl http://localhost:3000/api/orders/<orderId>
            { status: "PAID" }        ← set by webhook
10. refund: curl -X POST http://localhost:3000/api/orders/<orderId>/refund
            { refundId: "re_...", status: "succeeded" }
11. verify: curl http://localhost:3000/api/orders/<orderId>
            { status: "REFUNDED" }
```

---

## Output / Deliverables
- `src/routes/webhooks.js` — signature-verified webhook handler
- `src/app.js` — fully assembled, production-ready server
- End-to-end verified payment flow: browse → cart → checkout → pay → PAID → refund
- Project complete ✅
