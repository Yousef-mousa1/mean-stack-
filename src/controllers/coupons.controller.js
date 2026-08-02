// load models
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

// (Admin) Create Coupon
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minCartValue, expiryDate, usageLimit } = req.body;

        // check if same code already exists
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            minCartValue,
            expiryDate,
            usageLimit
        });

        return res.status(201).json({ message: 'Coupon is created', coupon });

    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// (Admin) Get All Coupons
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ coupons });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// (Admin) Delete Coupon
const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findByIdAndDelete(couponId);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        return res.status(200).json({ message: 'Coupon is deleted' });

    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// (User) Apply Coupon on their own cart
const applyCoupon = async (req, res) => {
    try {
        const userId = req.user._id;
        const { code } = req.body;

        // get user's cart with product prices
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Empty Cart' });
        }

        // calculate cart total first
        let cartTotal = 0;
        for (const item of cart.items) {
            cartTotal += item.productId.price * item.quantity;
        }

        // find the coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        // run all the validation checks
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }

        if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'This coupon has reached its usage limit' });
        }

        if (cartTotal < coupon.minCartValue) {
            return res.status(400).json({
                message: `Cart total must be at least ${coupon.minCartValue} to use this coupon`
            });
        }

        // calculate discount based on type
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        // discount cannot exceed cart total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        const finalTotal = cartTotal - discountAmount;

        // NOTE: usedCount only increases when the order is actually placed
        // (this endpoint just previews the discount, doesn't commit it yet)

        return res.status(200).json({
            message: 'Coupon applied successfully',
            cartTotal,
            discountAmount,
            finalTotal,
            couponCode: coupon.code
        });

    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// export to use file in routes
module.exports = {
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    applyCoupon
};