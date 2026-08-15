# Chunk 05 — Frontend: Product Listing & Cart (Brutalist Motion Design)

## Goal
Build `public/index.html` and `public/js/cart.js` — a brutalist product grid that fetches from `GET /api/products`, allows users to add/remove items, and persists the cart to `localStorage`. Styled and animated per `skill.md`.

---

## Prerequisites
- Chunk 01–04 complete
- Server running at `http://localhost:3000`
- At least 3 products seeded in the database

---

## npm / CDN Requirements

| Library | How to load |
|---|---|
| Stripe.js | NOT needed on this page |
| Motion (Framer Motion) | Via CDN (ESM build): `https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js` or via `npm install motion` if using a bundler. For this plain-HTML build, use the CDN. |
| React Bits | **NOT used on this page** — no React; plain JS + CSS only |
| Google Fonts | Via `<link>` in `<head>` |

> Since this project uses plain HTML/JS (not React), React Bits components cannot be directly used. Apply the brutalist design principles from `skill.md` using vanilla CSS and the Motion CDN animation library.

---

## Design Tokens (from `skill.md`)

Add to `public/css/tokens.css` (create this file):

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500;700&display=swap');

:root {
  --ink:          #111111;
  --paper:        #FAFAF7;
  --accent-blue:  #2B2FF0;
  --accent-red:   #FF3E1F;
  --accent-lime:  #C9FF3D;

  --font-display: 'Space Grotesk', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --shadow-hard:  4px 4px 0 var(--ink);
  --border:       2px solid var(--ink);
  --radius:       0px;

  /* Type scale */
  --size-xs:  14px;
  --size-sm:  16px;
  --size-md:  20px;
  --size-lg:  32px;
  --size-xl:  56px;
  --size-2xl: 96px;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  margin: 0;
}

/* Utility */
.mono { font-family: var(--font-mono); }
.display { font-family: var(--font-display); }
```

---

## `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RAW STORE — Brutalist Commerce</title>
  <meta name="description" content="Bold, honest, minimal clothing. No noise. Just product." />
  <link rel="stylesheet" href="/css/tokens.css" />
  <link rel="stylesheet" href="/css/store.css" />
</head>
<body>

  <!-- HEADER -->
  <header class="site-header">
    <span class="site-logo display">RAW STORE</span>
    <button id="cart-toggle" class="cart-btn" aria-label="Open cart">
      CART <span id="cart-count" class="mono">0</span>
    </button>
  </header>

  <!-- HERO STRIPE -->
  <section class="hero-stripe">
    <h1 class="display">NO NOISE.<br/>JUST PRODUCT.</h1>
    <p class="hero-sub">Structural. Honest. Limited.</p>
  </section>

  <!-- PRODUCT GRID -->
  <main id="product-grid" class="product-grid" role="list">
    <!-- Injected by cart.js -->
    <div class="loading-state mono">LOADING CATALOG...</div>
  </main>

  <!-- CART DRAWER -->
  <aside id="cart-drawer" class="cart-drawer" aria-hidden="true">
    <div class="cart-header">
      <span class="display">CART</span>
      <button id="cart-close" class="close-btn" aria-label="Close cart">×</button>
    </div>
    <ul id="cart-items" class="cart-items"></ul>
    <div class="cart-footer">
      <div class="cart-total">
        <span>TOTAL</span>
        <span id="cart-total" class="mono">$0.00</span>
      </div>
      <a href="/checkout.html" id="checkout-link" class="btn-primary">CHECKOUT →</a>
    </div>
  </aside>

  <!-- CART OVERLAY -->
  <div id="cart-overlay" class="cart-overlay" aria-hidden="true"></div>

  <script type="module" src="/js/cart.js"></script>
</body>
</html>
```

---

## `public/css/store.css`

Key brutalist rules (implement fully — abbreviated here for clarity):

```css
/* HEADER */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: var(--border);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 100;
}

.site-logo {
  font-size: var(--size-lg);
  font-weight: 900;
  letter-spacing: -0.02em;
}

.cart-btn {
  font-family: var(--font-mono);
  font-size: var(--size-xs);
  background: var(--ink);
  color: var(--paper);
  border: var(--border);
  padding: 8px 16px;
  cursor: pointer;
  box-shadow: var(--shadow-hard);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.cart-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}

.cart-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--ink);
}

/* HERO */
.hero-stripe {
  border-bottom: var(--border);
  padding: 64px 24px;
  background: var(--ink);
  color: var(--paper);
}

.hero-stripe h1 {
  font-size: clamp(var(--size-xl), 8vw, var(--size-2xl));
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 0 0 16px;
}

.hero-sub {
  font-family: var(--font-mono);
  font-size: var(--size-sm);
  opacity: 0.6;
  margin: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* PRODUCT GRID */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0;
  border-left: var(--border);
}

.product-card {
  border-right: var(--border);
  border-bottom: var(--border);
  padding: 0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: var(--paper);
  transition: background 0.12s ease;
}

.product-card:hover { background: var(--accent-lime); }

.product-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-bottom: var(--border);
  display: block;
}

.product-card-body { padding: 16px; }

.product-name {
  font-family: var(--font-display);
  font-size: var(--size-md);
  font-weight: 700;
  margin: 0 0 8px;
}

.product-price {
  font-family: var(--font-mono);
  font-size: var(--size-sm);
  font-weight: 700;
  color: var(--accent-blue);
}

.product-stock {
  font-family: var(--font-mono);
  font-size: var(--size-xs);
  opacity: 0.5;
  margin-top: 4px;
}

.add-to-cart {
  margin-top: 16px;
  background: var(--ink);
  color: var(--paper);
  border: var(--border);
  box-shadow: var(--shadow-hard);
  font-family: var(--font-mono);
  font-size: var(--size-xs);
  padding: 10px 0;
  width: 100%;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.08em;
  transition: transform 0.1s, box-shadow 0.1s;
}

.add-to-cart:hover {
  background: var(--accent-blue);
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}

/* CART DRAWER */
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  max-width: 100vw;
  height: 100vh;
  background: var(--paper);
  border-left: var(--border);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  /* Motion JS handles transition */
}

/* Overlay */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 199;
  opacity: 0;
  pointer-events: none;
}

/* Focus rings */
:focus-visible {
  outline: 3px solid var(--accent-lime);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; }
}
```

---

## `public/js/cart.js`

```js
import { animate } from 'https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js';

// ── State ──────────────────────────────────────────────────────────────────
let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ── DOM refs ────────────────────────────────────────────────────────────────
const grid        = document.getElementById('product-grid');
const cartDrawer  = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItems   = document.getElementById('cart-items');
const cartTotal   = document.getElementById('cart-total');
const cartCount   = document.getElementById('cart-count');

// ── Fetch products ───────────────────────────────────────────────────────────
async function loadProducts() {
  const res  = await fetch('/api/products');
  products   = await res.json();
  renderGrid();
}

// ── Render grid ──────────────────────────────────────────────────────────────
function renderGrid() {
  grid.innerHTML = '';
  products.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <img src="${p.image_url || '/images/placeholder.png'}" alt="${p.name}" loading="lazy" />
      <div class="product-card-body">
        <h2 class="product-name">${p.name}</h2>
        <p class="product-desc">${p.description || ''}</p>
        <p class="product-price mono">$${(p.price_cents / 100).toFixed(2)}</p>
        <p class="product-stock mono">${p.stock_qty} in stock</p>
        <button class="add-to-cart" data-id="${p.id}" id="add-${p.id}">ADD TO CART</button>
      </div>
    `;
    grid.appendChild(card);

    // Staggered entrance animation — decisive, not springy
    animate(card, { opacity: [0, 1], y: [12, 0] }, {
      delay: i * 0.06,
      duration: 0.2,
      easing: [0.2, 0, 0, 1],
    });
  });

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
}

// ── Cart logic ────────────────────────────────────────────────────────────────
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, product.stock_qty);
  } else {
    cart.push({ id: productId, name: product.name, price_cents: product.price_cents, quantity: 1 });
  }
  persistCart();
  renderCartDrawer();
  openCart();

  // Quick button feedback animation
  const btn = document.getElementById(`add-${productId}`);
  animate(btn, { scale: [1, 0.93, 1] }, { duration: 0.2, easing: 'ease-out' });
}

function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function renderCartDrawer() {
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price_cents * item.quantity;
    const li = document.createElement('li');
    li.className = 'cart-line';
    li.innerHTML = `
      <span>${item.name}</span>
      <span class="mono">×${item.quantity}</span>
      <span class="mono">$${(item.price_cents * item.quantity / 100).toFixed(2)}</span>
      <button data-id="${item.id}" class="remove-item" aria-label="Remove ${item.name}">✕</button>
    `;
    cartItems.appendChild(li);
  });
  cartTotal.textContent = '$' + (total / 100).toFixed(2);

  cartItems.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  persistCart();
  renderCartDrawer();
}

// ── Drawer open / close ───────────────────────────────────────────────────────
function openCart() {
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.style.pointerEvents = 'auto';

  animate(cartDrawer, { x: [cartDrawer.offsetWidth, 0] }, {
    duration: 0.22, easing: [0.2, 0, 0, 1]
  });
  animate(cartOverlay, { opacity: [0, 1] }, { duration: 0.22 });
}

function closeCart() {
  animate(cartDrawer, { x: [0, cartDrawer.offsetWidth] }, {
    duration: 0.18, easing: [0.4, 0, 1, 1]
  }).finished.then(() => {
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartOverlay.style.pointerEvents = 'none';
  });
  animate(cartOverlay, { opacity: [1, 0] }, { duration: 0.18 });
}

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── Init ──────────────────────────────────────────────────────────────────────
loadProducts();
persistCart();  // restore count from localStorage
renderCartDrawer();
```

---

## Verification
1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Confirm:
   - Product grid loads 3 cards with staggered entrance animation
   - "ADD TO CART" button animates on press
   - Cart drawer slides in from right
   - Cart count updates in header
   - Cart persists on page refresh (localStorage)
   - Focus outlines are visible and lime-colored
   - Check `prefers-reduced-motion: reduce` in browser DevTools — animations must be suppressed

---

## Output / Deliverables
- `public/index.html` — product listing page
- `public/css/tokens.css` — design token system
- `public/css/store.css` — brutalist component styles
- `public/js/cart.js` — product fetch, cart state, drawer animations
- Ready for Chunk 06 (checkout page + Stripe Elements mount)
