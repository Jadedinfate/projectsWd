// Motion via esm.sh — proper ESM, decisive brutalist micro-interactions
import { animate } from 'https://esm.sh/motion@11';

// ── State ──────────────────────────────────────────────────────────────────
let products = [];
let cart     = JSON.parse(localStorage.getItem('cart') || '[]');

// ── DOM refs ────────────────────────────────────────────────────────────────
const grid        = document.getElementById('product-grid');
const cartDrawer  = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItems   = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCount   = document.getElementById('cart-count');
const productCount = document.getElementById('product-count');

// ── Fetch & render products ──────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    products  = await res.json();
    productCount.textContent = `${products.length} items`;
    renderGrid();
  } catch (err) {
    grid.innerHTML = `<div class="loading-state mono">FAILED TO LOAD CATALOG :(</div>`;
    console.error(err);
  }
}

function renderGrid() {
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = '<div class="empty-grid mono">NO PRODUCTS FOUND</div>';
    return;
  }

  products.forEach((p, i) => {
    const inCart  = cart.some(c => c.id === p.id);
    const card    = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('role', 'listitem');
    card.id = `card-${p.id}`;

    card.innerHTML = `
      <div class="product-img-wrap">
        ${p.image_url
          ? `<img src="${p.image_url}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="product-placeholder mono" style="display:${p.image_url ? 'none' : 'flex'}">IMG</div>
      </div>
      <div class="product-card-body">
        <h2 class="product-name">${p.name}</h2>
        <p class="product-desc">${p.description || ''}</p>
        <div class="product-meta">
          <span class="product-price mono">$${(p.price_cents / 100).toFixed(2)}</span>
          <span class="product-stock mono">${p.stock_qty > 0 ? `${p.stock_qty} left` : 'SOLD OUT'}</span>
        </div>
        <button
          class="add-to-cart${inCart ? ' in-cart' : ''}"
          data-id="${p.id}"
          id="add-${p.id}"
          ${p.stock_qty === 0 ? 'disabled aria-disabled="true"' : ''}
        >${p.stock_qty === 0 ? 'SOLD OUT' : inCart ? 'IN CART ✓' : 'ADD TO CART'}</button>
      </div>
    `;

    grid.appendChild(card);

    // Staggered entrance — decisive, no bounce
    animate(card,
      { opacity: [0, 1], y: [12, 0] },
      { delay: i * 0.055, duration: 0.2, easing: [0.2, 0, 0, 1] }
    );
  });

  grid.querySelectorAll('.add-to-cart:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
}

// ── Cart CRUD ─────────────────────────────────────────────────────────────────
function addToCart(productId) {
  const product  = products.find(p => p.id === productId);
  if (!product || product.stock_qty === 0) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, product.stock_qty);
  } else {
    cart.push({
      id:          productId,
      name:        product.name,
      price_cents: product.price_cents,
      quantity:    1,
    });
  }

  persistCart();
  renderCartDrawer();
  openCart();

  // Button press feedback
  const btn = document.getElementById(`add-${productId}`);
  if (btn) {
    btn.textContent = 'IN CART ✓';
    btn.classList.add('in-cart');
    animate(btn, { scale: [1, 0.93, 1] }, { duration: 0.18, easing: 'ease-out' });
  }
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  persistCart();
  renderCartDrawer();

  // Reset button
  const btn = document.getElementById(`add-${productId}`);
  if (btn) {
    btn.textContent = 'ADD TO CART';
    btn.classList.remove('in-cart');
  }
}

function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCount.textContent = total;

  // Pulse cart count on change
  animate(cartCount, { scale: [1, 1.4, 1] }, { duration: 0.22, easing: 'ease-out' });
}

// ── Render cart drawer ────────────────────────────────────────────────────────
function renderCartDrawer() {
  cartItems.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<li class="cart-empty">YOUR CART IS EMPTY</li>';
    cartTotalEl.textContent = '$0.00';
    return;
  }

  cart.forEach(item => {
    total += item.price_cents * item.quantity;
    const li = document.createElement('li');
    li.className = 'cart-line';
    li.innerHTML = `
      <span class="cart-line-name">${item.name}</span>
      <span class="cart-line-qty mono">×${item.quantity}</span>
      <span class="cart-line-price mono">$${(item.price_cents * item.quantity / 100).toFixed(2)}</span>
      <button class="remove-item" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
    `;
    cartItems.appendChild(li);
  });

  cartTotalEl.textContent = '$' + (total / 100).toFixed(2);

  cartItems.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

// ── Drawer animations ─────────────────────────────────────────────────────────
function openCart() {
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.style.pointerEvents = 'auto';

  animate(cartDrawer,  { x: [cartDrawer.offsetWidth, 0] },
          { duration: 0.22, easing: [0.2, 0, 0, 1] });
  animate(cartOverlay, { opacity: [0, 1] },
          { duration: 0.22 });
}

function closeCart() {
  animate(cartDrawer,  { x: [0, cartDrawer.offsetWidth] },
          { duration: 0.18, easing: [0.4, 0, 1, 1] })
    .finished.then(() => {
      cartDrawer.setAttribute('aria-hidden', 'true');
      cartOverlay.style.pointerEvents = 'none';
    });
  animate(cartOverlay, { opacity: [1, 0] }, { duration: 0.18 });
}

// ── Events ────────────────────────────────────────────────────────────────────
document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Keyboard: Escape closes drawer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartDrawer.getAttribute('aria-hidden') === 'false') {
    closeCart();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
loadProducts();
persistCart();
renderCartDrawer();
