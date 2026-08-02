// mongoose lib
const mongoose = require('mongoose');

// new wishlist
const wishlistSchema = new mongoose.Schema({

    // user for wishlist
    userId: {
        type: mongoose.Schema.Types.ObjectId, // type objectId
        ref: 'User',                          // relation: user
        required: true,                       // each wishlist has a user
        unique: true                          // unique wishlist for each user
    },

    // store products in wishlist
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // product in DB
            required: true
        }
    ]
}, {
    timestamps: true // any update will add the time of it
});

// to use wishlist with DB and update on it
module.exports = mongoose.model('Wishlist', wishlistSchema);