const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    
    totalPrice: {
        type: Number,
        required: true
    },

    couponCode: {
        type: String,
        default: null
    },

    discountAmount: {
        type: Number,
        default: 0
    },
    
    Address: {
        type: String,
        required: true
    },
    
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);