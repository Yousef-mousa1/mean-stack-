// load files
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

//  Create Order
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { Address } = req.body; // address of user

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Empty Cart' });
        }

        let totalPrice = 0;
        const orderItems = [];

        // iterate on products in cart
        for (const item of cart.items) {
            const product = item.productId;
            
            if (!product) {
                return res.status(404).json({ message: 'Product is unavailable' });
            }

            const itemPrice = product.price; 
            const quantity = item.quantity;

            totalPrice += itemPrice * quantity;

            
            orderItems.push({
                productId: product._id,
                quantity: quantity,
                price: itemPrice
            });
        }

        // add order in DB
        const order = await Order.create({
            userId,
            items: orderItems,
            totalPrice,
            Address,
            status: 'Pending' // default state
        });

        // delete cart 
        cart.items = [];
        await cart.save();

        return res.status(201).json({ message: 'Order is done', order });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// get User Orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        // get orders ascending
        const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 });

        return res.status(200).json({ orders });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// (Get All Orders - Admin)

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId')
            .populate('items.productId')
            .sort({ createdAt: -1 });

        return res.status(200).json({ orders });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in get all orders', error: error.message });
    }
};

// Update Order Status for admin
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // URL 
        const { status } = req.body;     // (Pending, Processing, Delivered, Cancelled)

        const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'unavailabe statues' });
        }

        // search on order
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true } 
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Updated done on order', order });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};
// (Delete / Cancel Order)
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params; //URL of order

        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ message: 'order is not founded' });
        }

        return res.status(200).json({ message: 'deleted order' });

    } 
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// to routes 
module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
};