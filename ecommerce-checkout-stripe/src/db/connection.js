require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;

let isNeon = false;
let sql = null;
let sqliteDb = null;

if (connectionString) {
  isNeon = true;
  sql = neon(connectionString);
  console.log('⚡ Connected to Neon PostgreSQL Database via HTTP driver!');
} else {
  let Database;
  try {
    const dynamicReq = eval('require');
    Database = dynamicReq('better-sqlite3');
  } catch (e) {
    console.warn('SQLite not loaded (running in serverless mode):', e.message);
  }
  const isVercel = Boolean(process.env.VERCEL);
  const DB_PATH = isVercel
    ? path.join('/tmp', 'store.db')
    : path.join(__dirname, '../../data/store.db');

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (Database) {
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    sqliteDb.exec(schema);
    console.log('📁 Using local SQLite database:', DB_PATH);
  }
}

// ── Unified Async Database API ──────────────────────────────────────────────

async function initSchema() {
  if (!isNeon) return;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price_cents INTEGER NOT NULL,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      stripe_payment_intent_id TEXT UNIQUE NOT NULL,
      amount_total_cents INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
      customer_email TEXT,
      idempotency_key TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL
    );
  `;
  console.log('✅ Neon PostgreSQL schema verified.');
}

async function getAllProducts() {
  if (isNeon) {
    await initSchema();
    const rows = await sql`SELECT * FROM products ORDER BY name ASC`;
    return rows;
  } else {
    return sqliteDb.prepare('SELECT * FROM products ORDER BY name ASC').all();
  }
}

async function getProductById(id) {
  if (isNeon) {
    const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
    return rows[0] || null;
  } else {
    return sqliteDb.prepare('SELECT * FROM products WHERE id = ?').get(id) || null;
  }
}

async function createOrderWithItems({ id, stripe_payment_intent_id, amount_total_cents, customer_email, idempotency_key, lineItems }) {
  if (isNeon) {
    await sql`
      INSERT INTO orders (id, stripe_payment_intent_id, amount_total_cents, status, customer_email, idempotency_key)
      VALUES (${id}, ${stripe_payment_intent_id}, ${amount_total_cents}, 'PENDING', ${customer_email}, ${idempotency_key})
    `;

    for (const item of lineItems) {
      const itemId = uuidv4();
      await sql`
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_cents)
        VALUES (${itemId}, ${id}, ${item.product.id}, ${item.quantity}, ${item.product.price_cents})
      `;
    }
  } else {
    const insertOrder = sqliteDb.prepare(`
      INSERT INTO orders (id, stripe_payment_intent_id, amount_total_cents, status, customer_email, idempotency_key)
      VALUES (@id, @stripe_payment_intent_id, @amount_total_cents, 'PENDING', @customer_email, @idempotency_key)
    `);
    const insertItem = sqliteDb.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_cents)
      VALUES (@id, @order_id, @product_id, @quantity, @unit_price_cents)
    `);

    sqliteDb.transaction(() => {
      insertOrder.run({ id, stripe_payment_intent_id, amount_total_cents, customer_email, idempotency_key });
      for (const item of lineItems) {
        insertItem.run({
          id: uuidv4(),
          order_id: id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price_cents: item.product.price_cents
        });
      }
    })();
  }
}

async function getOrderById(id) {
  if (isNeon) {
    const orderRes = await sql`SELECT * FROM orders WHERE id = ${id}`;
    const order = orderRes[0];
    if (!order) return null;
    const itemsRes = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;
    return { ...order, items: itemsRes };
  } else {
    const order = sqliteDb.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return null;
    const items = sqliteDb.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
    return { ...order, items };
  }
}

async function getOrderByPaymentIntentId(piId) {
  if (isNeon) {
    const rows = await sql`SELECT * FROM orders WHERE stripe_payment_intent_id = ${piId}`;
    return rows[0] || null;
  } else {
    return sqliteDb.prepare('SELECT * FROM orders WHERE stripe_payment_intent_id = ?').get(piId) || null;
  }
}

async function updateOrderStatus(id, status) {
  if (isNeon) {
    await sql`UPDATE orders SET status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
  } else {
    sqliteDb.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
  }
}

async function getOrderItems(orderId) {
  if (isNeon) {
    const rows = await sql`SELECT * FROM order_items WHERE order_id = ${orderId}`;
    return rows;
  } else {
    return sqliteDb.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  }
}

async function decrementStock(lineItems) {
  if (isNeon) {
    for (const { product, quantity } of lineItems) {
      await sql`UPDATE products SET stock_qty = stock_qty - ${quantity} WHERE id = ${product.id}`;
    }
  } else {
    const stmt = sqliteDb.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?');
    sqliteDb.transaction(() => {
      for (const { product, quantity } of lineItems) {
        stmt.run(quantity, product.id);
      }
    })();
  }
}

async function seedProducts(products) {
  if (isNeon) {
    await initSchema();
    await sql`DELETE FROM order_items`;
    await sql`DELETE FROM orders`;
    await sql`DELETE FROM products`;

    for (const p of products) {
      const prodId = p.id || uuidv4();
      await sql`
        INSERT INTO products (id, name, description, price_cents, stock_qty, image_url)
        VALUES (${prodId}, ${p.name}, ${p.description}, ${p.price_cents}, ${p.stock_qty}, ${p.image_url})
      `;
    }
    console.log(`✅ Seeded ${products.length} products to Neon PostgreSQL!`);
  } else {
    sqliteDb.prepare('DELETE FROM order_items').run();
    sqliteDb.prepare('DELETE FROM orders').run();
    sqliteDb.prepare('DELETE FROM products').run();

    const insert = sqliteDb.prepare(`
      INSERT INTO products (id, name, description, price_cents, stock_qty, image_url)
      VALUES (@id, @name, @description, @price_cents, @stock_qty, @image_url)
    `);

    sqliteDb.transaction((items) => {
      for (const item of items) {
        insert.run({ id: item.id || uuidv4(), ...item });
      }
    })(products);
    console.log(`✅ Seeded ${products.length} products to SQLite!`);
  }
}

module.exports = {
  isNeon,
  initSchema,
  getAllProducts,
  getProductById,
  createOrderWithItems,
  getOrderById,
  getOrderByPaymentIntentId,
  updateOrderStatus,
  getOrderItems,
  decrementStock,
  seedProducts
};
