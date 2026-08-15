# Chunk 01 — Project Setup & Scaffolding

## Goal
Bootstrap the full project folder structure, install all npm dependencies, configure environment variables, and verify the dev server starts without errors.

---

## Prerequisites
- Node.js ≥ 18.x installed
- npm ≥ 9.x installed
- A Stripe test-mode account (free)
- Stripe CLI installed (for later webhook testing)

---

## Steps

### 1. Create project root
```bash
mkdir ecommerce-checkout-stripe
cd ecommerce-checkout-stripe
npm init -y
```

### 2. Install runtime dependencies
```bash
npm install express stripe dotenv better-sqlite3 cors express-rate-limit
```

### 3. Install dev dependencies
```bash
npm install --save-dev nodemon
```

### 4. Create folder structure
```
ecommerce-checkout-stripe/
├── public/
│   ├── index.html          # Product listing page (stubbed)
│   ├── checkout.html       # Checkout page (stubbed)
│   └── js/
│       ├── cart.js         # (stubbed)
│       └── checkout.js     # (stubbed)
├── src/
│   ├── db/
│   │   ├── schema.sql
│   │   └── connection.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── checkout.js
│   │   ├── orders.js
│   │   └── webhooks.js
│   ├── services/
│   │   ├── pricing.js
│   │   ├── inventory.js
│   │   └── stripeClient.js
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   └── app.js
├── scripts/
│   └── seed.js
├── .env.example
├── .env                    # gitignored
└── package.json
```

### 5. Add npm scripts to `package.json`
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }
}
```

### 6. Create `.env.example`
```env
PORT=3000
NODE_ENV=development

STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

CHECKOUT_RATE_LIMIT_WINDOW_MS=60000
CHECKOUT_RATE_LIMIT_MAX=10
```

### 7. Create `.env` (copy from example)
```bash
cp .env.example .env
# Fill in real Stripe test-mode keys from https://dashboard.stripe.com/apikeys
```

### 8. Create `src/app.js` (skeleton)
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes will be mounted here in later chunks

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
```

### 9. Add `.gitignore`
```
node_modules/
.env
*.db
```

---

## Verification
- Run `npm run dev` → server logs `Server running on http://localhost:3000`
- `GET http://localhost:3000` → browser renders a blank page (no 404 on static root)
- No unhandled errors in console

---

## Output / Deliverables
- Full folder skeleton (empty stubs acceptable at this stage)
- Working Express server on port 3000
- `.env` configured with real Stripe test keys
- Ready for Chunk 02 (database + backend core)
