const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Coupon = require('../models/coupon');

exports.placeOrder = async (req, res) => {
    try {
        const { items, address, subtotal, discount, shipping, total, couponCode } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order items cannot be empty' });
        }
        if (!address) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }
        
        // Check inventory and decrement count
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.title} not found` });
            }
            if (product.inventoryCount < item.quantity) {
                return res.status(400).json({ message: `Insufficient inventory for ${item.title}` });
            }
            product.inventoryCount -= item.quantity;
            await product.save();
        }
        
        const order = await Order.create({
            userId: req.user.id,
            items,
            address,
            subtotal: Number(subtotal),
            discount: Number(discount || 0),
            shipping: Number(shipping || 0),
            total: Number(total),
            couponCode: couponCode || '',
            paymentStatus: 'Pending',
            status: 'Placed',
            trackingTimeline: [{ status: 'Placed', date: new Date() }]
        });
        
        // Clear user's cart
        await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
        
        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Error placing order', error: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user orders', error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
        return res.json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching all orders', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Order status is required' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = status;
        order.trackingTimeline.push({ status, date: new Date() });
        
        if (status === 'Delivered') {
            order.paymentStatus = 'Paid';
        }
        
        await order.save();
        return res.json(order);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};
