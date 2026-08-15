const db = require('../db/connection');

/**
 * Check that every item in lineItems has sufficient stock.
 * Throws 409 INSUFFICIENT_STOCK if any product is under-stocked.
 *
 * @param {Array<{product: Object, quantity: number}>} lineItems
 */
function checkAvailability(lineItems) {
  for (const { product, quantity } of lineItems) {
    if (product.stock_qty < quantity) {
      const err = new Error(
        `Only ${product.stock_qty} units of '${product.id}' remain.`
      );
      err.code = 'INSUFFICIENT_STOCK';
      err.statusCode = 409;
      throw err;
    }
  }
}

/**
 * Decrement stock for all line items atomically.
 *
 * @param {Array<{product: Object, quantity: number}>} lineItems
 */
async function decrementStock(lineItems) {
  await db.decrementStock(lineItems);
}

module.exports = { checkAvailability, decrementStock };
