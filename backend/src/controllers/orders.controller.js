const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

//  Create Order
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { Address, couponCode } = req.body;

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Empty Cart' });
        }

        let totalPrice = 0;
        const orderItems = [];

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

        // ===== Coupon handling (لو المستخدم بعت كود) =====
        let discountAmount = 0;
        let appliedCouponCode = null;
        let coupon = null;

        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

            if (!coupon) {
                return res.status(404).json({ message: 'Invalid coupon code' });
            }

            if (!coupon.isActive) {
                return res.status(400).json({ message: 'This coupon is no longer active' });
            }

            if (coupon.expiryDate < new Date()) {
                return res.status(400).json({ message: 'This coupon has expired' });
            }

            if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ message: 'This coupon has reached its usage limit' });
            }

            if (totalPrice < coupon.minCartValue) {
                return res.status(400).json({
                    message: `Cart total must be at least ${coupon.minCartValue} to use this coupon`
                });
            }

            if (coupon.discountType === 'percentage') {
                discountAmount = (totalPrice * coupon.discountValue) / 100;
            } else {
                discountAmount = coupon.discountValue;
            }

            if (discountAmount > totalPrice) {
                discountAmount = totalPrice;
            }

            appliedCouponCode = coupon.code;
        }

        const finalTotal = totalPrice - discountAmount;

        // ===== Stock check & decrement (ATOMIC) =====
        // بنتأكد إن الكمية متوفرة وبننقصها في نفس الاستعلام
        // عشان نمنع oversell لو اتنين طلبوا نفس المنتج في نفس اللحظة
        const stockUpdates = [];

        for (const item of orderItems) {
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                // فشل النقص معناه الكمية المتاحة أقل من المطلوب (أو المنتج اتمسح)
                // لازم نرجّع اللي اتنقص قبل كده عشان الداتا تفضل صح
                await rollbackStock(stockUpdates);

                const productDoc = await Product.findById(item.productId);
                const availableStock = productDoc ? productDoc.stock : 0;

                return res.status(400).json({
                    message: `Not enough stock for "${productDoc ? productDoc.name : 'product'}". Available: ${availableStock}, requested: ${item.quantity}`
                });
            }

            stockUpdates.push({ productId: item.productId, quantity: item.quantity });
        }

        // add order in DB
        let order;
        try {
            order = await Order.create({
                userId,
                items: orderItems,
                totalPrice: finalTotal,
                couponCode: appliedCouponCode,
                discountAmount,
                Address,
                status: 'Pending'
            });
        } catch (orderError) {
            // لو فشل إنشاء الأوردر، نرجّع الستوك اللي اتنقص
            await rollbackStock(stockUpdates);
            throw orderError;
        }

        // لو الكوبون اتطبق فعلاً، زوّد عداد الاستخدام دلوقتي بس (بعد نجاح الأوردر)
        if (coupon) {
            coupon.usedCount += 1;
            await coupon.save();
        }

        // delete cart
        cart.items = [];
        await cart.save();

        return res.status(201).json({ message: 'Order is done', order });

    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// helper: يرجّع الستوك لو حصل فشل في نص العملية
async function rollbackStock(stockUpdates) {
    for (const update of stockUpdates) {
        await Product.findByIdAndUpdate(update.productId, {
            $inc: { stock: update.quantity }
        });
    }
}

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

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

const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId })
            .populate('items.productId')
            .sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error in get user orders', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'unavailabe statues' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // لو الأدمن ألغى الأوردر، نرجّع الستوك للمنتجات
        if (status === 'Cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        return res.status(200).json({ message: 'Updated done on order', order });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
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

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrdersByUserId,
    updateOrderStatus,
    deleteOrder
};