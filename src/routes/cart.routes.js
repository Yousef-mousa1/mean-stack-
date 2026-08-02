// express lib
const express = require('express');

const router = express.Router();

// call func from controller
const { addToCart, getCart, removeFromCart } = require('../controllers/cart.controller');

// auth. , role
const { protect } = require('../middlewares/auth'); //  middleware ( check on function )

// protect routes from sign in 
router.use(protect);

// (POST /api/cart) add to cart
router.post('/', addToCart);

// (GET /api/cart)
router.get('/', getCart);

// (DELETE /api/cart/productId)
router.delete('/:productId', removeFromCart);

module.exports = router;