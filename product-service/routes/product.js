const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addToCart,
  removeFromCart,
  getCart
} = require('../controllers/productController');
const Cart = require('../models/Cart');

// Product routes
router.get('/api/products', getProducts);
router.get('/api/products/:id', getProductById);

// Protected routes - require authentication
router.post('/api/products', auth, createProduct);
router.put('/api/products/:id', auth, updateProduct);
router.delete('/api/products/:id', auth, deleteProduct);

// Cart routes
router.post('/api/cart/add', auth, addToCart);
router.post('/api/cart/remove', auth, removeFromCart);
router.get('/api/cart', auth, getCart);

// Add this route
router.delete('/api/cart/clear', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find and delete the cart
    await Cart.findOneAndDelete({ userId });
    
    // Also update product stock if needed
    // ... add stock update logic here if required
    
    res.status(200).json({ 
      success: true,
      message: 'Cart cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to clear cart',
      error: error.message 
    });
  }
});

module.exports = router;

 