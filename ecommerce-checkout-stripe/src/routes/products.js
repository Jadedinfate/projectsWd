const express = require('express');
const db      = require('../db/connection');
const router  = express.Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const products = await db.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
