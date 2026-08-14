const express = require('express');
const router = express.Router();

const { 
    createOrder, 
    getUserOrders, 
    getAllOrders, 
    getOrdersByUserId,
    updateOrderStatus, 
    deleteOrder 
} = require('../controllers/orders.controller');

const { protect } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/role'); 

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders); 

router.get('/admin/all', restrictTo('admin'), getAllOrders);
router.get('/admin/user/:userId', restrictTo('admin'), getOrdersByUserId);
router.put('/admin/:orderId', restrictTo('admin'), updateOrderStatus); 
router.delete('/admin/:orderId', restrictTo('admin'), deleteOrder);    

module.exports = router;