# Chunk 02 — Database, Middleware & Core Services

## Goal
Implement the SQLite schema, database connection module, seed script, shared middleware (rate limiter + error handler), and core services (pricing, inventory, Stripe client singleton).

---

## Prerequisites
- Chunk 01 complete (project scaffold + `.env` configured)

---

## Steps

### 1. `src/db/schema.sql`
```sql
CREATE TABLE IF NOT EXISTS products (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT,
    price_cents   INTEGER NOT NULL,
    stock_qty     INTEGER NOT NULL DEFAULT 0,
    image_url     TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id                        TEXT PRIMARY KEY,
    stripe_payment_intent_id  TEXT UNIQUE NOT NULL,
    amount_total_cents        INTEGER NOT NULL,
    status                    TEXT NOT NULL DEFAULT 'PENDING',
    customer_email            TEXT NOT NULL,
    idempotency_key           TEXT UNIQUE,
    created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id         TEXT NOT NULL,
    product_id       TEXT NOT NULL,
    quantity         INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 2. `src/db/connection.js`
```js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/store.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');  // better concurrency
db.pragma('foreign_keys = ON');

// Run schema on startup
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
```

### 3. `scripts/seed.js`
```js
require('dotenv').config();
const db = require('../src/db/connection');
const { v4: uuidv4 } = require('uuid');  // npm install uuid

const products = [
  {
    id: uuidv4(),
    name: 'Brutalist Cap',
    description: 'A raw, structural cap. No logo. All attitude.',
    price_cents: 3500,
    stock_qty: 25,
    image_url: '/images/cap.jpg',
  },
  {
    id: uuidv4(),
    name: 'Concrete Tee',
    description: 'Heavy cotton, minimal print, maximum presence.',
    price_cents: 4900,
    stock_qty: 40,
    image_url: '/images/tee.jpg',
  },
  {
    id: uuidv4(),
    name: 'Grid Hoodie',
    description: 'Oversized. Exposed seams. Grid print inside lining.',
    price_cents: 8900,
    stock_qty: 15,
    image_url: '/images/hoodie.jpg',
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, description, price_cents, stock_qty, image_url)
  VALUES (@id, @name, @description, @price_cents, @stock_qty, @image_url)
`);

const insertMany = db.transaction((items) => {
  for (const item of items) insert.run(item);
});

insertMany(products);
console.log(`Seeded ${products.length} products.`);
```
> **NOTE**: Run `npm install uuid` before running this script.

### 4. `src/services/stripeClient.js`
```js
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

module.exports = stripe;
```

### 5. `src/services/pricing.js`
```js
const db = require('../db/connection');

/**
 * Recalculate authoritative total from the database.
 * @param {Array<{id: string, quantity: number}>} items
 * @returns {{ lineItems: Array, totalCents: number }}
 */
function recalculateTotal(items) {
  const lineItems = [];
  let totalCents = 0;

  for (const { id, quantity } of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      const err = new Error(`Product not found: ${id}`);
      err.code = 'PRODUCT_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    const subtotal = product.price_cents * quantity;
    totalCents += subtotal;
    lineItems.push({ product, quantity, subtotal });
  }

  return { lineItems, totalCents };
}

module.exports = { recalculateTotal };
```

### 6. `src/services/inventory.js`
```js
const db = require('../db/connection');

/**
 * Check availability. Throws 409 if any item is under-stocked.
 */
function checkAvailability(lineItems) {
  for (const { product, quantity } of lineItems) {
    if (product.stock_qty < quantity) {
      const err = new Error(`Only ${product.stock_qty} units of '${product.id}' remain.`);
      err.code = 'INSUFFICIENT_STOCK';
      err.statusCode = 409;
      throw err;
    }
  }
}

/**
 * Decrement stock atomically inside a transaction.
 */
const decrementStock = db.transaction((lineItems) => {
  const stmt = db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?');
  for (const { product, quantity } of lineItems) {
    stmt.run(quantity, product.id);
  }
});

module.exports = { checkAvailability, decrementStock };
```

### 7. `src/middleware/errorHandler.js`
```js
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[${code}] ${err.message}`);

  res.status(statusCode).json({
    error: {
      code,
      message: err.message,
      details: err.details || {},
    },
  });
}

module.exports = errorHandler;
```

### 8. `src/middleware/rateLimiter.js`
```js
const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({
  windowMs: parseInt(process.env.CHECKOUT_RATE_LIMIT_WINDOW_MS) || 60_000,
  max: parseInt(process.env.CHECKOUT_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

module.exports = { checkoutLimiter };
```

### 9. Mount error handler in `src/app.js`
```js
const errorHandler = require('./middleware/errorHandler');
// After all route mounts:
app.use(errorHandler);
```

---

## Verification
```bash
node scripts/seed.js
# Expected output: "Seeded 3 products."

npm run dev
# Expected: Server running on http://localhost:3000
# No DB connection errors in console
```

---

## Output / Deliverables
- `data/store.db` created with 3 products seeded
- Pricing + inventory services testable in isolation
- Error handler + rate limiter middleware registered
- Ready for Chunk 03 (API routes)
