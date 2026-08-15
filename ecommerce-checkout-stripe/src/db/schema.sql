-- Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT,
    price_cents   INTEGER NOT NULL,
    stock_qty     INTEGER NOT NULL DEFAULT 0,
    image_url     TEXT
);

-- Customer Orders
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

-- Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id         TEXT NOT NULL,
    product_id       TEXT NOT NULL,
    quantity         INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
