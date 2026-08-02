// load models to check on products in DB
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// add product
const addToCart = async (req, res) => {
    try {
        // get id , quantity from body
        const { productId, quantity } = req.body;
        
        // get userId
        const userId = req.user._id; 

        // check on product is available or not 
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'product is unavailable now' });
        }

        // check if the same user has a cart
        let cart = await Cart.findOne({ userId });

        if (cart) {
            //check if same product is found in same cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // founded-> add new quantity to old quantity
                cart.items[itemIndex].quantity += Number(quantity);
            } 
            else {
                // not found -> add it and its quantity 
                cart.items.push({ productId, quantity });
            }

            // save it in DB
            await cart.save();
            return res.status(200).json({ message: 'Cart is updated', cart });

        } 
        else {
            // create new cart
            cart = await Cart.create({
                userId,
                items: [{ productId, quantity }]
            });

            return res.status(201).json({ message:'Cart is created', cart });
        }

    } 
    catch (error) {
        // Handle errors
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

//  Get User Cart
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        // search on cart of userId
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Empty Cart' });
        }

        return res.status(200).json({ cart });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// Remove Item from Cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params; // get url of product to delete it 

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart isnt found' });
        }
        // delete it 
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        await cart.save();

        return res.status(200).json({ message: 'product is deleted from Cart', cart });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// export to use file in routes
module.exports = {
    addToCart,
    getCart,
    removeFromCart
};