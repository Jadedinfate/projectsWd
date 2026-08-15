# Chunk 04 — Stripe Elements Integration (Backend Wiring + Configuration)

## Goal
Configure Stripe Elements on the server side: expose the publishable key to the frontend, finalize the PaymentIntent/clientSecret flow, and configure the Stripe `appearance` API tokens consistent with the Brutalist Motion Design skill.

> This chunk covers the **server-side configuration** necessary for Stripe Elements. The actual frontend HTML/JS is built in **Chunk 06**.

---

## Prerequisites
- Chunk 01 + 02 + 03 complete
- Stripe test-mode keys set in `.env`
- `STRIPE_PUBLISHABLE_KEY` must be passed safely to the client (it is public, but must not be hardcoded in source)

---

## Requirements
- **npm**: `stripe` (already installed in Chunk 01)
- **No additional packages** — Stripe.js loads from Stripe's CDN, not npm

---

## Steps

### 1. `GET /api/config` — Expose publishable key to frontend
Add a safe config endpoint in `src/app.js` (or a dedicated `src/routes/config.js`):

```js
// src/routes/config.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

module.exports = router;
```

Mount in `app.js`:
```js
const configRoutes = require('./routes/config');
app.use('/api/config', configRoutes);
```

> The publishable key is safe to send to the client but must not appear in source control — hence `.env`.

### 2. Confirm `POST /api/checkout` response contract
Verify the response from Chunk 03 matches exactly what Stripe Elements needs:

```json
{
  "clientSecret": "pi_..._secret_...",
  "orderId": "uuid-v4",
  "totalAmountCents": 4900
}
```
- `clientSecret` → passed directly to `stripe.confirmPayment()`
- `orderId` → stored client-side to poll `GET /api/orders/:id` after payment

### 3. Stripe `appearance` configuration object (to be consumed in `checkout.js`)
Define the appearance tokens that carry the Brutalist design language into the Stripe iframe. This object is used in Chunk 06; specify and document it here:

```js
// public/js/stripeAppearance.js  (or inline in checkout.js)
const stripeAppearance = {
  theme: 'none',  // full custom control
  variables: {
    colorPrimary: '#2B2FF0',        // --accent-blue
    colorBackground: '#FAFAF7',     // --paper
    colorText: '#111111',           // --ink
    colorDanger: '#FF3E1F',         // --accent-red
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSizeBase: '16px',
    borderRadius: '0px',            // brutalist: square corners
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '2px solid #111111',
      boxShadow: '4px 4px 0 #111111',   // hard offset shadow
      padding: '10px 12px',
    },
    '.Input:focus': {
      border: '2px solid #2B2FF0',
      boxShadow: '4px 4px 0 #2B2FF0',
      outline: '3px solid #C9FF3D',     // --accent-lime focus ring
      outlineOffset: '2px',
    },
    '.Label': {
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontSize: '11px',
      color: '#111111',
    },
    '.Error': {
      color: '#FF3E1F',
      fontFamily: '"Inter", sans-serif',
      fontSize: '13px',
    },
  },
};
```

> **Skill note**: Per `skill.md`, the card-entry step should be **calmer and lower-motion** than the rest — no shader backgrounds, no heavy animations in this iframe context. The `theme: 'none'` gives full styling control while keeping motion expectations low.

### 4. Idempotency key strategy (document for future reference)
- Each `POST /api/checkout` generates a UUID `orderId` and derives `idempotencyKey = 'checkout-' + orderId`
- This is passed as `{ idempotencyKey }` in the `stripe.paymentIntents.create()` options header
- Stripe deduplicates requests with the same key within 24 hours — protecting against double-clicks and network retries

### 5. Update `src/services/stripeClient.js` — ensure API version is pinned
```js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // pin to prevent surprise breaking changes on upgrade
});
module.exports = stripe;
```

---

## Verification

```bash
curl http://localhost:3000/api/config
# Expected: { "stripePublishableKey": "pk_test_51..." }
```

```bash
# End-to-end checkout intent creation
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","items":[{"id":"<product-id>","quantity":1}]}'
# Expected: { clientSecret: "pi_...secret_...", orderId, totalAmountCents }
```

- In Stripe Dashboard → Payments: a PaymentIntent in **Requires payment method** status must appear.

---

## Output / Deliverables
- `GET /api/config` endpoint live
- `stripeAppearance` object defined and documented
- Stripe SDK pinned to a specific API version
- Ready for Chunk 05 (product/cart frontend) and Chunk 06 (checkout frontend + Elements mount)
