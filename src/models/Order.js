// mongoose lib
const mongoose = require('mongoose');

// schema for oreders
const orderSchema = new mongoose.Schema({
    
    // to know the user for these oreders
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // products
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
    
    // address of user
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
    timestamps: true // save time of updates 
});

// to export to other files(controller)
module.exports = mongoose.model('Order', orderSchema);