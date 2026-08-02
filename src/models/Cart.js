// mongoose lib
const mongoose = require('mongoose');

// new cart
const cartSchema = new mongoose.Schema({
    
    // user for cart
    userId: {
        type: mongoose.Schema.Types.ObjectId,// type objectId
        ref: 'User',                         // ralation : user
        required: true,                      // each cart has an user
        unique: true                         // unique cart for each user
    },
    
    // store items in cart
    items: [
        {
            // to know the product
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // product in DB
                required: true
            },
            
          
            quantity: {
                type: Number,
                required: true,
                min: 1, 
                default: 1 
            }
        }
    ]
}, { 
    timestamps: true // any update will add the time of it 
});

// to use cart with DB and update on it 
module.exports = mongoose.model('Cart', cartSchema);