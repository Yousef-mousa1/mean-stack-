// mongoose lib
const mongoose = require('mongoose');

// new coupon
const couponSchema = new mongoose.Schema({

    // the code user types to apply discount
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true, // always store as uppercase (SAVE10 not save10)
        trim: true
    },

    // percentage (10%) or fixed (10 EGP off)
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },

    discountValue: {
        type: Number,
        required: true,
        min: 0
    },

    // minimum cart total needed to use this coupon
    minCartValue: {
        type: Number,
        default: 0
    },

    // coupon stops working after this date
    expiryDate: {
        type: Date,
        required: true
    },

    // how many times this coupon can be used in total (null = unlimited)
    usageLimit: {
        type: Number,
        default: null
    },

    // how many times it has actually been used so far
    usedCount: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // any update will add the time of it
});

// to use coupon with DB and update on it
module.exports = mongoose.model('Coupon', couponSchema);