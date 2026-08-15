# 🚀 Production Deployment Guide

This Brutalist Stripe Checkout storefront is built with **Node.js Express**, **SQLite** (`better-sqlite3`), **Vanilla JS / Motion**, and **Stripe Payment Element**.

---

## 📦 Option 1: Render.com (Recommended - 1-Click)

Render natively supports Node.js web services with persistent filesystem storage for SQLite.

1. Push your repository to GitHub / GitLab:
   ```bash
   git init
   git add .
   git commit -m "Brutalist Stripe Store initial release"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your GitHub repository. Render will automatically read `render.yaml`!
4. Fill in your environment variables:
   - `STRIPE_PUBLISHABLE_KEY`: `pk_test_...`
   - `STRIPE_SECRET_KEY`: `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...`
5. Click **Apply**. Render will automatically build, seed 24 DripDrop items, and deploy your live HTTPS site!

---

## 🐳 Option 2: Docker Container Deployment

You can deploy using the included `Dockerfile` to any container host (**Railway**, **Fly.io**, **Google Cloud Run**, **AWS App Runner**):

```bash
# Build Docker image
docker build -t brutalist-stripe-checkout .

# Run Docker container locally
docker run -p 3000:3000 --env-file .env brutalist-stripe-checkout
```

---

## ⚡ Option 3: Instant Live HTTPS Public Tunnel (Local Development)

To share a live working HTTPS link instantly from your machine:

```bash
npx localtunnel --port 3000
```
This gives you a public URL (e.g. `https://brutalist-store.loca.lt`) accessible from anywhere!

---

## 🔒 Post-Deployment Stripe Webhook Setup

1. In your [Stripe Dashboard](https://dashboard.stripe.com/webhooks), click **Add Endpoint**.
2. Set Endpoint URL to: `https://<YOUR_DEPLOYED_DOMAIN>/api/webhooks`.
3. Select event: `payment_intent.succeeded`.
4. Copy the webhook signing secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in your production environment settings.
