const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/initiate
// @desc    Initiate payment for an order
// @access  Private
router.post('/initiate', protect, async (req, res) => {
    try {
        const { orderId } = req.body;

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify user owns the order
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay for this order'
            });
        }

        // Check if order is in correct state
        if (order.status !== 'CREATED') {
            return res.status(400).json({
                success: false,
                message: 'Order is not in a payable state'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ orderId, status: { $in: ['PENDING', 'SUCCESS'] } });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already initiated for this order'
            });
        }

        // Create payment record
        const payment = await Payment.create({
            orderId,
            userId: req.user._id,
            provider: 'MOCK', // For hackathon, using mock payment
            amount: order.totalAmount,
            status: 'PENDING'
        });

        // In production, this would generate Paytm payment link/QR
        // For now, we'll return a mock payment URL
        const mockPaymentUrl = `paytm://pay?amount=${order.totalAmount}&orderId=${orderId}&paymentId=${payment._id}`;

        res.status(201).json({
            success: true,
            data: {
                payment,
                paymentUrl: mockPaymentUrl,
                // Mock QR code data
                qrData: JSON.stringify({
                    paymentId: payment._id,
                    orderId: orderId,
                    amount: order.totalAmount
                })
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/payments/:id/confirm
// @desc    Confirm payment (mock endpoint for testing)
// @access  Private
router.post('/:id/confirm', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify user owns the payment
        if (payment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (payment.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Payment is not in pending state'
            });
        }

        // Mock payment confirmation
        payment.status = 'SUCCESS';
        payment.transactionId = `TXN${Date.now()}`;
        payment.paymentDetails = {
            mockConfirmation: true,
            confirmedAt: new Date()
        };
        await payment.save();

        // Update order status
        const order = await Order.findById(payment.orderId);
        if (order) {
            order.status = 'PAID';
            order.generatePickupCode(); // Generate pickup code when payment is confirmed
            await order.save();
        }

        res.json({
            success: true,
            data: {
                payment,
                order
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/payments/webhook/paytm
// @desc    Paytm webhook handler
// @access  Public (but should verify signature in production)
router.post('/webhook/paytm', async (req, res) => {
    try {
        // In production, verify Paytm checksum here
        const { orderId, status, transactionId } = req.body;

        const payment = await Payment.findOne({ orderId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Update payment status
        payment.status = status === 'TXN_SUCCESS' ? 'SUCCESS' : 'FAILED';
        payment.transactionId = transactionId;
        payment.paymentDetails = req.body;
        await payment.save();

        // Update order status
        const order = await Order.findById(orderId);
        if (order) {
            if (payment.status === 'SUCCESS') {
                order.status = 'PAID';
                order.generatePickupCode();
            } else {
                order.status = 'FAILED';
            }
            await order.save();
        }

        res.json({
            success: true,
            message: 'Webhook processed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/payments/order/:orderId
// @desc    Get payment for an order
// @access  Private
router.get('/order/:orderId', protect, async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify user owns the payment
        if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
