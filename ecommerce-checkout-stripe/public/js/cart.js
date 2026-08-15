// Motion via esm.sh — proper ESM, decisive brutalist micro-interactions
let animate = null;
try {
  const motionModule = await import('https://esm.sh/motion@11');
  animate = motionModule.animate;
} catch (e) {
  console.warn('Motion library failed to load, falling back to CSS:', e.message);
}

function safeAnimate(el, keyframes, options) {
  try {
    if (animate && el) {
      return animate(el, keyframes, options);
    }
  } catch (e) {
    // silent fallback
  }
}

// ── State ──────────────────────────────────────────────────────────────────
let products = [];
let cart     = JSON.parse(localStorage.getItem('cart') || '[]');

// ── DOM refs ────────────────────────────────────────────────────────────────
let grid, cartDrawer, cartOverlay, cartItems, cartTotalEl, cartCount, productCount;

function initDOM() {
  grid        = document.getElementById('product-grid');
  cartDrawer  = document.getElementById('cart-drawer');
  cartOverlay = document.getElementById('cart-overlay');
  cartItems   = document.getElementById('cart-items');
  cartTotalEl = document.getElementById('cart-total');
  cartCount   = document.getElementById('cart-count');
  productCount = document.getElementById('product-count');
}

// ── Fetch & render products ──────────────────────────────────────────────────
async function loadProducts() {
  if (!grid) initDOM();
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    products  = await res.json();
    if (productCount) productCount.textContent = `${products.length} items`;
    renderGrid();
  } catch (err) {
    if (grid) grid.innerHTML = `<div class="loading-state mono">FAILED TO LOAD CATALOG (${err.message})</div>`;
    console.error('loadProducts error:', err);
  }
}

function renderGrid() {
  if (!grid) return;
  grid.innerHTML = '';

  if (!Array.isArray(products) || products.length === 0) {
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

    // Staggered entrance
    safeAnimate(card,
      { opacity: [0, 1], y: [12, 0] },
      { delay: i * 0.03, duration: 0.2, easing: [0.2, 0, 0, 1] }
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

  const btn = document.getElementById(`add-${productId}`);
  if (btn) {
    btn.textContent = 'IN CART ✓';
    btn.classList.add('in-cart');
    safeAnimate(btn, { scale: [1, 0.93, 1] }, { duration: 0.18, easing: 'ease-out' });
  }
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  persistCart();
  renderCartDrawer();

  const btn = document.getElementById(`add-${productId}`);
  if (btn) {
    btn.textContent = 'ADD TO CART';
    btn.classList.remove('in-cart');
  }
}

function persistCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (cartCount) cartCount.textContent = total;
  if (cartCount) safeAnimate(cartCount, { scale: [1, 1.4, 1] }, { duration: 0.22, easing: 'ease-out' });
}

function renderCartDrawer() {
  if (!cartItems || !cartTotalEl) return;
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

function openCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.style.pointerEvents = 'auto';

  safeAnimate(cartDrawer,  { x: [cartDrawer.offsetWidth || 320, 0] },
              { duration: 0.22, easing: [0.2, 0, 0, 1] });
  safeAnimate(cartOverlay, { opacity: [0, 1] },
              { duration: 0.22 });
}

function closeCart() {
  if (!cartDrawer || !cartOverlay) return;
  const finish = () => {
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartOverlay.style.pointerEvents = 'none';
  };

  const anim = safeAnimate(cartDrawer,  { x: [0, cartDrawer.offsetWidth || 320] },
                           { duration: 0.18, easing: [0.4, 0, 1, 1] });
  if (anim && anim.finished) {
    anim.finished.then(finish);
  } else {
    finish();
  }
  safeAnimate(cartOverlay, { opacity: [1, 0] }, { duration: 0.18 });
}

function animateHero() {
  const heroTitle = document.querySelector('.hero-stripe h1');
  const heroTag   = document.querySelector('.hero-tag');
  const heroSub   = document.querySelector('.hero-sub');
  
  if (heroTitle) safeAnimate(heroTitle, { opacity: [0, 1], y: [20, 0] }, { duration: 0.35, easing: [0.2, 0, 0, 1] });
  if (heroTag)   safeAnimate(heroTag,   { opacity: [0, 1], x: [-15, 0] }, { delay: 0.15, duration: 0.25 });
  if (heroSub)   safeAnimate(heroSub,   { opacity: [0, 0.5], y: [10, 0] }, { delay: 0.25, duration: 0.2 });
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  const toggleBtn = document.getElementById('cart-toggle');
  const closeBtn  = document.getElementById('cart-close');
  if (toggleBtn) toggleBtn.addEventListener('click', openCart);
  if (closeBtn)  closeBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  animateHero();
  loadProducts();
  persistCart();
  renderCartDrawer();
});

// Fallback init if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initDOM();
  animateHero();
  loadProducts();
  persistCart();
  renderCartDrawer();
}
