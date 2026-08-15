const db = require('../db/connection');

/**
 * Recalculate authoritative total from the database.
 * Client-submitted prices are DISCARDED — totals always come from DB.
 *
 * @param {Array<{id: string, quantity: number}>} items
 * @returns {Promise<{ lineItems: Array, totalCents: number }>}
 */
async function recalculateTotal(items) {
  const lineItems = [];
  let totalCents = 0;

  for (const { id, quantity } of items) {
    const product = await db.getProductById(id);

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
