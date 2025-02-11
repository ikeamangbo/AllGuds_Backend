const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, addToCart, removeFromCart, getCart } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, createProduct);
router.get('/', getProducts);
router.get('/:id', authenticate, getProductById);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.get('/cart', authenticate, getCart);
router.post('/cart/:productId', authenticate, addToCart);
router.delete('/cart/:productId', authenticate, removeFromCart);

module.exports = router;

 