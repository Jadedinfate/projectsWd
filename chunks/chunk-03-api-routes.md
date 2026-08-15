# Chunk 03 — API Routes (Products, Orders, Checkout)

## Goal
Implement all REST API routes: `GET /api/products`, `GET /api/orders/:id`, `POST /api/orders/:id/refund`, and `POST /api/checkout`. Wire all routes into `app.js`.

---

## Prerequisites
- Chunk 01 + 02 complete
- `data/store.db` seeded
- Stripe keys in `.env`

---

## Standard Error Response Shape
All errors returned by the API must use this shape (handled by `errorHandler.js`):
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message.",
    "details": {}
  }
}
```

---

## Steps

### 1. `src/routes/products.js`
```js
const express = require('express');
const db = require('../db/connection');

const router = express.Router();

router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

module.exports = router;
```

### 2. `src/routes/orders.js`
```js
const express = require('express');
const db = require('../db/connection');
const stripe = require('../services/stripeClient');

const router = express.Router();

// GET /api/orders/:id — Look up order status
router.get('/:id', (req, res, next) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) {
    const err = new Error('Order not found.');
    err.code = 'ORDER_NOT_FOUND';
    err.statusCode = 404;
    return next(err);
  }
  res.json(order);
});

// POST /api/orders/:id/refund — Issue full or partial refund
router.post('/:id/refund', async (req, res, next) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) {
      const err = new Error('Order not found.');
      err.code = 'ORDER_NOT_FOUND';
      err.statusCode = 404;
      return next(err);
    }

    if (order.status !== 'PAID') {
      const err = new Error('Only PAID orders can be refunded.');
      err.code = 'INVALID_ORDER_STATUS';
      err.statusCode = 400;
      return next(err);
    }

    const { amountCents } = req.body;
    const refundParams = { payment_intent: order.stripe_payment_intent_id };
    if (amountCents) refundParams.amount = amountCents;

    const refund = await stripe.refunds.create(refundParams);

    db.prepare(`UPDATE orders SET status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(order.id);

    res.json({ refundId: refund.id, status: refund.status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### 3. `src/routes/checkout.js`
```js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/connection');
const stripe = require('../services/stripeClient');
const { recalculateTotal } = require('../services/pricing');
const { checkAvailability } = require('../services/inventory');
const { checkoutLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', checkoutLimiter, async (req, res, next) => {
  try {
    const { items, email } = req.body;

    // Basic validation
    if (!email || !Array.isArray(items) || items.length === 0) {
      const err = new Error('email and items[] are required.');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      return next(err);
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = new Error('Invalid email format.');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      return next(err);
    }

    // Server-side price authority
    const { lineItems, totalCents } = recalculateTotal(items);

    // Inventory check
    checkAvailability(lineItems);

    const orderId = uuidv4();
    const idempotencyKey = `checkout-${orderId}`;

    // Create PaymentIntent on Stripe
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalCents,
        currency: 'usd',
        metadata: { orderId, customerEmail: email },
        receipt_email: email,
      },
      { idempotencyKey }
    );

    // Persist order in PENDING state
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, stripe_payment_intent_id, amount_total_cents, status, customer_email, idempotency_key)
      VALUES (@id, @stripe_payment_intent_id, @amount_total_cents, 'PENDING', @customer_email, @idempotency_key)
    `);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
      VALUES (@order_id, @product_id, @quantity, @unit_price_cents)
    `);

    const createOrder = db.transaction(() => {
      insertOrder.run({
        id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        amount_total_cents: totalCents,
        customer_email: email,
        idempotency_key: idempotencyKey,
      });

      for (const { product, quantity } of lineItems) {
        insertItem.run({
          order_id: orderId,
          product_id: product.id,
          quantity,
          unit_price_cents: product.price_cents,
        });
      }
    });

    createOrder();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      totalAmountCents: totalCents,
    });
  } catch (err) {
    // Stripe API errors
    if (err.type && err.type.startsWith('Stripe')) {
      err.statusCode = 502;
      err.code = 'STRIPE_ERROR';
    }
    next(err);
  }
});

module.exports = router;
```

### 4. Mount all routes in `src/app.js`
```js
const productRoutes  = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes    = require('./routes/orders');
const webhookRoutes  = require('./routes/webhooks'); // wired in Chunk 07

// Webhook MUST use raw body — mount BEFORE express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// JSON body parsing for all other routes
app.use(express.json());

app.use('/api/products',  productRoutes);
app.use('/api/checkout',  checkoutRoutes);
app.use('/api/orders',    orderRoutes);

app.use(errorHandler);
```
> **Important**: the webhook route must be registered *before* `express.json()` parses the body, otherwise Stripe's signature check will fail.

---

## Verification (manual with curl / Postman)

```bash
# 1. List products
curl http://localhost:3000/api/products
# Expected: array of 3 products

# 2. Create a checkout (replace IDs with real ones from the GET above)
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","items":[{"id":"<product-id>","quantity":1}]}'
# Expected: { clientSecret, orderId, totalAmountCents }

# 3. Look up order
curl http://localhost:3000/api/orders/<orderId>
# Expected: order in PENDING status
```

---

## Output / Deliverables
- All 5 REST endpoints functional
- Idempotency key assigned to each checkout
- Orders persisted to SQLite in PENDING state
- Ready for Chunk 04 (Stripe Elements frontend wiring) and Chunk 07 (webhooks)
