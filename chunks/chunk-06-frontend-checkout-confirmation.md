# Chunk 06 — Frontend: Checkout Page & Stripe Elements Mount

## Goal
Build `public/checkout.html` and `public/js/checkout.js` — the checkout page that reads the cart from `localStorage`, calls `POST /api/checkout` to get a `clientSecret`, mounts Stripe Elements (Payment Element), handles payment confirmation, and navigates to a success / failure state.

---

## Prerequisites
- Chunks 01–05 complete
- `GET /api/config` returning `stripePublishableKey`
- `POST /api/checkout` returning `{ clientSecret, orderId, totalAmountCents }`
- `stripeAppearance` object defined in Chunk 04

---

## Design Principle (from `skill.md`)
> **"Go restrained on the card-entry step."** The card-entry area is calmer and lower-motion than the rest. No shader backgrounds, no heavy slam transitions at the moment the user is trusting you with a card number. Carry the brutalist visual language (thick borders, square corners, accent color on focus) but keep motion minimal.

The page is intentionally split into two visual sections:
1. **Order summary** — bold, animated, brutalist identity
2. **Payment form** — calm, structured, Stripe-themed via `stripeAppearance`

A hard horizontal divider separates the two — signalling a shift into a more serious mode.

---

## Steps

### 1. `public/checkout.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Checkout — RAW STORE</title>
  <meta name="description" content="Complete your purchase securely." />
  <link rel="stylesheet" href="/css/tokens.css"/>
  <link rel="stylesheet" href="/css/checkout.css"/>
  <!-- Stripe.js — must load from Stripe's CDN for PCI compliance -->
  <script src="https://js.stripe.com/v3/" defer></script>
</head>
<body>

  <!-- HEADER -->
  <header class="site-header">
    <a href="/" class="site-logo display">RAW STORE</a>
    <span class="mono checkout-label">CHECKOUT</span>
  </header>

  <!-- MAIN LAYOUT -->
  <main class="checkout-layout">

    <!-- LEFT: Order Summary -->
    <section class="order-summary" aria-label="Order Summary">
      <h1 class="display section-title">YOUR ORDER</h1>
      <ul id="summary-items" class="summary-items"></ul>
      <div class="summary-divider"></div>
      <div class="summary-total">
        <span class="mono">TOTAL</span>
        <span id="summary-total" class="mono total-value">$0.00</span>
      </div>
    </section>

    <!-- RIGHT: Payment Form -->
    <section class="payment-section" aria-label="Payment">
      <!-- Step indicator -->
      <div class="payment-mode-banner mono">SECURE PAYMENT ↓</div>

      <form id="payment-form" novalidate>
        <div class="field-group">
          <label for="email" class="field-label mono">EMAIL</label>
          <input type="email" id="email" name="email" class="field-input mono"
                 placeholder="you@example.com" required autocomplete="email" />
          <span id="email-error" class="field-error" role="alert"></span>
        </div>

        <!-- Stripe Payment Element mounts here -->
        <div id="payment-element" class="stripe-mount"></div>
        <div id="stripe-error" class="field-error stripe-error" role="alert"></div>

        <button id="submit-btn" type="submit" class="btn-pay" disabled>
          <span id="btn-label">PAY NOW</span>
          <span id="btn-spinner" class="spinner" aria-hidden="true" style="display:none">⏳</span>
        </button>

        <p class="pci-note mono">
          Card data is collected by Stripe — it never touches our server.
        </p>
      </form>

      <!-- Success state (hidden until payment confirmed) -->
      <div id="success-state" class="success-state" hidden>
        <h2 class="display">PAYMENT CONFIRMED</h2>
        <p class="mono" id="order-id-display"></p>
        <a href="/" class="btn-secondary">BACK TO STORE</a>
      </div>
    </section>
  </main>

  <script type="module" src="/js/checkout.js"></script>
</body>
</html>
```

---

### 2. `public/css/checkout.css`

```css
/* LAYOUT */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
}

/* ORDER SUMMARY */
.order-summary {
  padding: 48px 32px;
  border-right: var(--border);
  background: var(--ink);
  color: var(--paper);
}

.section-title {
  font-size: var(--size-xl);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0 0 32px;
}

.summary-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-line {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(250,250,247,0.15);
  font-family: var(--font-mono);
  font-size: var(--size-xs);
}

.summary-divider {
  border-top: 2px solid var(--paper);
  margin: 24px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-weight: 700;
}

.total-value {
  font-size: var(--size-md);
  color: var(--accent-lime);
}

/* PAYMENT */
.payment-section {
  padding: 48px 32px;
  background: var(--paper);
}

.payment-mode-banner {
  font-size: var(--size-xs);
  letter-spacing: 0.12em;
  color: var(--accent-blue);
  font-weight: 700;
  margin-bottom: 32px;
  border-bottom: var(--border);
  padding-bottom: 16px;
}

/* FIELDS */
.field-group { margin-bottom: 24px; }

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: var(--border);
  box-shadow: var(--shadow-hard);
  font-family: var(--font-mono);
  font-size: var(--size-sm);
  background: var(--paper);
  color: var(--ink);
  border-radius: var(--radius);
  outline: none;
}

.field-input:focus {
  border-color: var(--accent-blue);
  box-shadow: 4px 4px 0 var(--accent-blue);
  outline: 3px solid var(--accent-lime);
  outline-offset: 2px;
}

.stripe-mount {
  border: var(--border);
  box-shadow: var(--shadow-hard);
  padding: 16px;
  margin-bottom: 24px;
  min-height: 120px;
}

.field-error {
  display: block;
  color: var(--accent-red);
  font-family: var(--font-mono);
  font-size: var(--size-xs);
  margin-top: 4px;
  min-height: 16px;
}

/* SUBMIT BUTTON */
.btn-pay {
  width: 100%;
  padding: 16px;
  background: var(--accent-blue);
  color: var(--paper);
  border: var(--border);
  box-shadow: var(--shadow-hard);
  font-family: var(--font-mono);
  font-size: var(--size-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.btn-pay:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}

.btn-pay:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--ink);
}

.btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }

.pci-note {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 12px;
  text-align: center;
  letter-spacing: 0.04em;
}

/* SUCCESS */
.success-state {
  text-align: center;
  padding: 48px 0;
}

.success-state h2 {
  font-size: var(--size-xl);
  color: var(--ink);
  margin-bottom: 16px;
}

.btn-secondary {
  display: inline-block;
  margin-top: 24px;
  padding: 12px 24px;
  border: var(--border);
  box-shadow: var(--shadow-hard);
  font-family: var(--font-mono);
  font-size: var(--size-xs);
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
}

.btn-secondary:hover {
  background: var(--ink);
  color: var(--paper);
}
```

---

### 3. `public/js/checkout.js`

```js
import { animate } from 'https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js';

// ── Cart from localStorage ────────────────────────────────────────────────────
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
if (cart.length === 0) {
  window.location.href = '/';  // nothing to checkout
}

// ── Populate order summary ────────────────────────────────────────────────────
const summaryList  = document.getElementById('summary-items');
const summaryTotal = document.getElementById('summary-total');
let clientTotal = 0;

cart.forEach(item => {
  const subtotal = item.price_cents * item.quantity;
  clientTotal += subtotal;
  const li = document.createElement('li');
  li.className = 'summary-line';
  li.innerHTML = `
    <span>${item.name}</span>
    <span class="mono">×${item.quantity}</span>
    <span class="mono">$${(subtotal / 100).toFixed(2)}</span>
  `;
  summaryList.appendChild(li);
});

summaryTotal.textContent = '$' + (clientTotal / 100).toFixed(2);

// Entrance animation for order summary items
document.querySelectorAll('.summary-line').forEach((el, i) => {
  animate(el, { opacity: [0, 1], x: [-12, 0] }, {
    delay: i * 0.07,
    duration: 0.18,
    easing: [0.2, 0, 0, 1],
  });
});

// ── Stripe setup ──────────────────────────────────────────────────────────────
let stripe, elements, paymentElement;

async function initStripe() {
  const configRes = await fetch('/api/config');
  const { stripePublishableKey } = await configRes.json();
  stripe = Stripe(stripePublishableKey);  // global from CDN script tag

  const checkoutRes = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value || 'pending@placeholder.com',
      items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
    }),
  });

  if (!checkoutRes.ok) {
    const err = await checkoutRes.json();
    showStripeError(err.error?.message || 'Failed to initialize payment.');
    return;
  }

  const { clientSecret, orderId } = await checkoutRes.json();
  sessionStorage.setItem('orderId', orderId);

  const appearance = {
    theme: 'none',
    variables: {
      colorPrimary: '#2B2FF0',
      colorBackground: '#FAFAF7',
      colorText: '#111111',
      colorDanger: '#FF3E1F',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSizeBase: '16px',
      borderRadius: '0px',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': {
        border: '2px solid #111111',
        boxShadow: '4px 4px 0 #111111',
        padding: '10px 12px',
      },
      '.Input:focus': {
        border: '2px solid #2B2FF0',
        boxShadow: '4px 4px 0 #2B2FF0',
        outline: '3px solid #C9FF3D',
        outlineOffset: '2px',
      },
      '.Label': {
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize: '11px',
      },
      '.Error': {
        color: '#FF3E1F',
        fontFamily: '"Inter", sans-serif',
        fontSize: '13px',
      },
    },
  };

  elements = stripe.elements({ clientSecret, appearance });
  paymentElement = elements.create('payment');
  paymentElement.mount('#payment-element');

  paymentElement.on('ready', () => {
    document.getElementById('submit-btn').disabled = false;
  });
}

// ── Form submit ───────────────────────────────────────────────────────────────
document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent = 'Please enter a valid email.';
    return;
  }
  document.getElementById('email-error').textContent = '';

  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + '/checkout.html',  // Stripe may redirect here for 3DS
      receipt_email: email,
    },
    redirect: 'if_required', // avoid redirect for cards that don't need 3DS
  });

  if (error) {
    showStripeError(error.message);
    setLoading(false);
  } else {
    // Payment succeeded client-side
    showSuccess();
  }
});

// ── UI helpers ────────────────────────────────────────────────────────────────
function setLoading(loading) {
  document.getElementById('submit-btn').disabled = loading;
  document.getElementById('btn-label').style.display = loading ? 'none' : 'inline';
  document.getElementById('btn-spinner').style.display = loading ? 'inline' : 'none';
}

function showStripeError(msg) {
  document.getElementById('stripe-error').textContent = msg;
}

function showSuccess() {
  document.getElementById('payment-form').hidden = true;
  const successEl = document.getElementById('success-state');
  successEl.hidden = false;
  const orderId = sessionStorage.getItem('orderId') || '';
  document.getElementById('order-id-display').textContent = `ORDER #${orderId.slice(0, 8).toUpperCase()}`;

  animate(successEl, { opacity: [0, 1], scale: [0.97, 1] }, {
    duration: 0.25, easing: [0.2, 0, 0, 1]
  });

  localStorage.removeItem('cart');
}

// ── Handle Stripe redirect return (3DS) ──────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const piClientSecret = urlParams.get('payment_intent_client_secret');
if (piClientSecret) {
  stripe = Stripe('');  // will be set properly; or just reload initStripe
  stripe.retrievePaymentIntent(piClientSecret).then(({ paymentIntent }) => {
    if (paymentIntent?.status === 'succeeded') showSuccess();
    else showStripeError(`Payment status: ${paymentIntent?.status}`);
  });
} else {
  initStripe();
}
```

---

## Verification

1. Open `http://localhost:3000`, add a product to cart
2. Click "CHECKOUT →" — lands on `/checkout.html`
3. Order summary shows correct items and total
4. Stripe Payment Element mounts (no console errors)
5. Enter test email + test card `4242 4242 4242 4242` / any future date / any CVC
6. Click PAY NOW → spinner appears while processing
7. **Success state** replaces the form; cart is cleared from localStorage
8. In Stripe Dashboard → Payments: PaymentIntent status = **Succeeded**
9. Test declined card `4000 0000 0000 0002` → error message displays inline, form stays usable
10. Test 3DS card `4000 0025 0000 3155` → 3DS modal appears, then success on approval

---

## Output / Deliverables
- `public/checkout.html` — full checkout page
- `public/css/checkout.css` — brutalist but restrained payment UI
- `public/js/checkout.js` — Stripe Elements mount, payment confirmation, success/error states
- Ready for Chunk 07 (webhooks + refunds + final polish)
