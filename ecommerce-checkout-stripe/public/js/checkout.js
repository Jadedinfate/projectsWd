import { animate } from 'https://esm.sh/motion@11';

// ── Redirect if cart is empty ─────────────────────────────────────────────
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
if (cart.length === 0) {
  window.location.href = '/';
}

// ── Populate order summary ────────────────────────────────────────────────
const summaryList  = document.getElementById('summary-items');
const summaryTotal = document.getElementById('summary-total');
let clientTotal = 0;

cart.forEach((item, i) => {
  const subtotal = item.price_cents * item.quantity;
  clientTotal += subtotal;

  const li = document.createElement('li');
  li.className = 'summary-line';
  li.innerHTML = `
    <span class="summary-line-name">${item.name}</span>
    <span class="summary-line-qty mono">×${item.quantity}</span>
    <span class="summary-line-price mono">$${(subtotal / 100).toFixed(2)}</span>
  `;
  summaryList.appendChild(li);

  // Staggered entrance from left
  animate(li,
    { opacity: [0, 1], x: [-14, 0] },
    { delay: i * 0.07, duration: 0.2, easing: [0.2, 0, 0, 1] }
  );
});

summaryTotal.textContent = '$' + (clientTotal / 100).toFixed(2);

// ── Stripe setup ──────────────────────────────────────────────────────────
let stripe, elements;

async function initStripe() {
  // 1. Fetch publishable key
  const configRes = await fetch('/api/config');
  if (!configRes.ok) {
    showStripeError('Could not load payment configuration.');
    return;
  }
  const { stripePublishableKey } = await configRes.json();

  // Stripe.js loaded from CDN via <script> tag
  stripe = window.Stripe(stripePublishableKey);

  // 2. Create PaymentIntent on our server
  const checkoutRes = await fetch('/api/checkout', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      email: document.getElementById('email').value || 'pending@placeholder.com',
      items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
    }),
  });

  if (!checkoutRes.ok) {
    const errData = await checkoutRes.json().catch(() => ({}));
    showStripeError(errData.error?.message || 'Failed to initialize payment.');
    return;
  }

  const { clientSecret, orderId } = await checkoutRes.json();
  sessionStorage.setItem('pendingOrderId', orderId);

  // 3. Mount Payment Element with brutalist appearance tokens
  const appearance = {
    theme: 'none',
    variables: {
      colorPrimary:    '#2B2FF0',
      colorBackground: '#FAFAF7',
      colorText:       '#111111',
      colorDanger:     '#FF3E1F',
      fontFamily:      '"Inter", system-ui, sans-serif',
      fontSizeBase:    '16px',
      borderRadius:    '0px',
      spacingUnit:     '4px',
    },
    rules: {
      '.Input': {
        border:    '2px solid #111111',
        boxShadow: '4px 4px 0 #111111',
        padding:   '10px 12px',
      },
      '.Input:focus': {
        border:    '2px solid #2B2FF0',
        boxShadow: '4px 4px 0 #2B2FF0',
        outline:   '3px solid #C9FF3D',
        outlineOffset: '2px',
      },
      '.Label': {
        fontFamily:    '"JetBrains Mono", monospace',
        fontWeight:    '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize:      '11px',
        color:         '#111111',
      },
      '.Error': {
        color:      '#FF3E1F',
        fontFamily: '"Inter", sans-serif',
        fontSize:   '13px',
      },
    },
  };

  elements = stripe.elements({ clientSecret, appearance });
  const paymentEl = elements.create('payment');
  paymentEl.mount('#payment-element');

  paymentEl.on('ready', () => {
    document.getElementById('payment-element').innerHTML = ''; // clear loading text
    document.getElementById('submit-btn').disabled = false;
  });

  paymentEl.on('change', (e) => {
    document.getElementById('stripe-error').textContent =
      e.error ? e.error.message : '';
  });
}

// ── Re-init with real email when user blurs the field ────────────────────
let stripeInitialized = false;
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', () => {
  if (!stripeInitialized && emailInput.value) {
    stripeInitialized = true;
    initStripe();
  }
});

// Also initialize immediately (with placeholder email) so Elements preloads
initStripe();
stripeInitialized = true;

// ── Form submit ───────────────────────────────────────────────────────────
document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email-error').textContent =
      'Please enter a valid email.';
    emailInput.focus();
    return;
  }
  document.getElementById('email-error').textContent = '';

  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url:    window.location.href,
      receipt_email: email,
    },
    redirect: 'if_required',
  });

  if (error) {
    showStripeError(error.message);
    setLoading(false);
  } else {
    showSuccess();
  }
});

// ── Handle Stripe 3DS redirect return ────────────────────────────────────
const urlParams       = new URLSearchParams(window.location.search);
const returnSecret    = urlParams.get('payment_intent_client_secret');

if (returnSecret && window.Stripe) {
  const configRes = await fetch('/api/config');
  const { stripePublishableKey } = await configRes.json();
  const stripeTemp = window.Stripe(stripePublishableKey);

  const { paymentIntent } = await stripeTemp.retrievePaymentIntent(returnSecret);
  if (paymentIntent?.status === 'succeeded') {
    showSuccess();
  } else {
    showStripeError(`Payment status: ${paymentIntent?.status || 'unknown'}`);
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────
function setLoading(on) {
  document.getElementById('submit-btn').disabled = on;
  document.getElementById('btn-label').style.display   = on ? 'none'   : 'inline';
  document.getElementById('btn-spinner').style.display = on ? 'inline' : 'none';
}

function showStripeError(msg) {
  document.getElementById('stripe-error').textContent = msg;
}

function showSuccess() {
  document.getElementById('payment-form').hidden = true;
  const el = document.getElementById('success-state');
  el.hidden = false;

  const orderId = sessionStorage.getItem('pendingOrderId') || '';
  document.getElementById('order-id-display').textContent =
    `ORDER #${orderId.slice(0, 8).toUpperCase()}`;

  animate(el,
    { opacity: [0, 1], scale: [0.96, 1] },
    { duration: 0.28, easing: [0.2, 0, 0, 1] }
  );

  localStorage.removeItem('cart');
  sessionStorage.removeItem('pendingOrderId');
}
