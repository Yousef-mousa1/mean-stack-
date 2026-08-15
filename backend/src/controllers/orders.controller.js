const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// كلاس بسيط لتمرير status code مع رسالة الخطأ من جوه الـ transaction للـ catch بره
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

//  Create Order
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        let createdOrder;

        // ===== كل العمليات هنا بتتنفذ كوحدة واحدة (all-or-nothing) =====
        // لو أي خطوة فشلت (حتى لو السيرفر وقع فجأة)، MongoDB بترجع كل حاجة زي ما كانت
        await session.withTransaction(async () => {
            const userId = req.user._id;
            const { Address, couponCode } = req.body;

            const cart = await Cart.findOne({ userId })
                .populate('items.productId')
                .session(session);

            if (!cart || cart.items.length === 0) {
                throw new AppError(400, 'Empty Cart');
            }

            let totalPrice = 0;
            const orderItems = [];

            for (const item of cart.items) {
                const product = item.productId;
                if (!product) {
                    throw new AppError(404, 'Product is unavailable');
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
                coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);

                if (!coupon) {
                    throw new AppError(404, 'Invalid coupon code');
                }

                if (!coupon.isActive) {
                    throw new AppError(400, 'This coupon is no longer active');
                }

                if (coupon.expiryDate < new Date()) {
                    throw new AppError(400, 'This coupon has expired');
                }

                if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                    throw new AppError(400, 'This coupon has reached its usage limit');
                }

                if (totalPrice < coupon.minCartValue) {
                    throw new AppError(400, `Cart total must be at least ${coupon.minCartValue} to use this coupon`);
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

            // ===== Stock check & decrement (ATOMIC + داخل نفس الـ transaction) =====
            for (const item of orderItems) {
                const updatedProduct = await Product.findOneAndUpdate(
                    { _id: item.productId, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { new: true, session }
                );

                if (!updatedProduct) {
                    const productDoc = await Product.findById(item.productId).session(session);
                    const availableStock = productDoc ? productDoc.stock : 0;

                    throw new AppError(
                        400,
                        `Not enough stock for "${productDoc ? productDoc.name : 'product'}". Available: ${availableStock}, requested: ${item.quantity}`
                    );
                }

                // لو الستوك بقى صفر، خلي المنتج غير متاح تلقائيًا
                if (updatedProduct.stock === 0 && updatedProduct.isAvailable) {
                    updatedProduct.isAvailable = false;
                    await updatedProduct.save({ session });
                }
            }

            // ===== Coupon usage (ATOMIC + داخل نفس الـ transaction) =====
            // بنستخدم findOneAndUpdate بشرط usedCount < usageLimit في نفس الاستعلام
            // عشان نمنع اتنين كستمر يستخدموا آخر استخدام متاح في نفس اللحظة
            if (coupon) {
                const couponUpdateFilter = {
                    _id: coupon._id,
                    $or: [
                        { usageLimit: null },
                        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
                    ]
                };

                const updatedCoupon = await Coupon.findOneAndUpdate(
                    couponUpdateFilter,
                    { $inc: { usedCount: 1 } },
                    { new: true, session }
                );

                if (!updatedCoupon) {
                    throw new AppError(400, 'This coupon has just reached its usage limit, please try without it');
                }
            }

            // add order in DB
            const orderDocs = await Order.create([{
                userId,
                items: orderItems,
                totalPrice: finalTotal,
                couponCode: appliedCouponCode,
                discountAmount,
                Address,
                status: 'Pending'
            }], { session });

            createdOrder = orderDocs[0];

            // delete cart
            cart.items = [];
            await cart.save({ session });
        });

        return res.status(201).json({ message: 'Order is done', order: createdOrder });
    }
    catch (error) {
        // لو الخطأ من نوعنا الجوّاني (AppError)، ارجع الـ status code بتاعه
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
    finally {
        session.endSession();
    }
};

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

// helper: يرجّع الستوك لكل عناصر الأوردر، وياخد إعادة تفعيل isAvailable في الاعتبار
async function restoreStockForOrder(order) {
    for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        product.stock += item.quantity;
        if (product.stock > 0 && !product.isAvailable) {
            product.isAvailable = true;
        }
        await product.save();
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'unavailabe statues' });
        }

        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const wasAlreadyCancelled = existingOrder.status === 'Cancelled';

        existingOrder.status = status;
        await existingOrder.save();

        // لو الأدمن ألغى الأوردر (ومكنش ملغي قبل كده)، نرجّع الستوك للمنتجات
        if (status === 'Cancelled' && !wasAlreadyCancelled) {
            await restoreStockForOrder(existingOrder);
        }

        return res.status(200).json({ message: 'Updated done on order', order: existingOrder });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error in server', error: error.message });
    }
};

// PUT /my-orders/:orderId/cancel  (Customer only — يلغي أوردره هو بس)
const cancelMyOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // يتأكد إن الأوردر ده بتاع نفس اليوزر
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not allowed to cancel this order' });
        }

        // يسمح بالإلغاء بس لو لسه Pending
        if (order.status !== 'Pending') {
            return res.status(400).json({
                message: `Cannot cancel an order with status "${order.status}"`
            });
        }

        order.status = 'Cancelled';
        await order.save();

        // رجّع الستوك للمنتجات (وأعد تفعيل isAvailable لو كان اتقفل بسبب نفاد الستوك)
        await restoreStockForOrder(order);

        return res.status(200).json({ message: 'Order cancelled', order });
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
    cancelMyOrder,
    deleteOrder
};