// express lib
const express = require('express');

const router = express.Router();

// call func from controller
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');

// auth middleware (check on function)
const { protect } = require('../middlewares/auth');

// protect routes from sign in
router.use(protect);

// (POST /api/wishlist) add to wishlist
router.post('/', addToWishlist);

// (GET /api/wishlist)
router.get('/', getWishlist);

// (DELETE /api/wishlist/:productId)
router.delete('/:productId', removeFromWishlist);

module.exports = router;