const express = require('express');
const router = express.Router();

// load Orders Controller
const { 
    createOrder, 
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder 
} = require('../controllers/orders.controller');

// role and auth
const { protect } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/role'); 

// safe all routes by sing in
router.use(protect);

// routes of user
router.post('/', createOrder);         // (Checkout)
router.get('/my-orders', getUserOrders); 

// (Admin Only):
router.get('/admin/all', restrictTo('admin'), getAllOrders);          
router.put('/admin/:orderId', restrictTo('admin'), updateOrderStatus); 
router.delete('/admin/:orderId', restrictTo('admin'), deleteOrder);    

module.exports = router;