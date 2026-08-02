// express lib
const express = require('express');

const router = express.Router();

// call func from controller
const {
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    applyCoupon
} = require('../controllers/coupons.controller');

// auth & role
const { protect } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/role');

// protect all coupon routes with sign in
router.use(protect);

// (User) apply coupon on their own cart
router.post('/apply', applyCoupon);

// (Admin Only):
router.post('/', restrictTo('admin'), createCoupon);
router.get('/', restrictTo('admin'), getAllCoupons);
router.delete('/:couponId', restrictTo('admin'), deleteCoupon);

module.exports = router;