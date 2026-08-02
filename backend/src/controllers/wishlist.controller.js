// load models to check on products in DB
const Wishlist = require('../models/wishlist');
const Product = require('../models/Product');

// add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        // get id from body
        const { productId } = req.body;

        // get userId
        const userId = req.user._id;

        // check on product is available or not
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'product is unavailable now' });
        }

        // check if the same user has a wishlist
        let wishlist = await Wishlist.findOne({ userId });

        if (wishlist) {
            // check if same product is already in wishlist
            const alreadyExists = wishlist.products.some(
                (p) => p.toString() === productId
            );

            if (alreadyExists) {
                return res.status(400).json({ message: 'product is already in wishlist' });
            }

            // not found -> add it
            wishlist.products.push(productId);

            // save it in DB
            await wishlist.save();
            return res.status(200).json({ message: 'Wishlist is updated', wishlist });

        }
        else {
            // create new wishlist
            wishlist = await Wishlist.create({
                userId,
                products: [productId]
            });

            return res.status(201).json({ message: 'Wishlist is created', wishlist });
        }

    }
    catch (error) {
        // Handle errors
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// Get User Wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        // search on wishlist of userId
        const wishlist = await Wishlist.findOne({ userId }).populate('products');

        if (!wishlist) {
            return res.status(404).json({ message: 'Empty Wishlist' });
        }

        return res.status(200).json({ wishlist });

    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// Remove Item from Wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params; // get url of product to delete it

        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist isnt found' });
        }

        // delete it
        wishlist.products = wishlist.products.filter(
            (p) => p.toString() !== productId
        );

        await wishlist.save();

        return res.status(200).json({ message: 'product is deleted from Wishlist', wishlist });

    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// export to use file in routes
module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};