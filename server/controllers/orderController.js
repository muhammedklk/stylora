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

        // Clean & normalize items payload so no invalid properties crash the query
        const cleanItems = items.map(item => ({
            productId: item.productId || 'prod-' + Date.now(),
            title: item.title || 'Product',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            size: item.size || 'M',
            color: item.color || 'Black',
            image: item.image || ''
        }));
        
        // Safely attempt inventory decrement if product exists in DB
        for (const item of cleanItems) {
            try {
                if (item.productId && String(item.productId).length === 24 && /^[0-9a-fA-F]{24}$/.test(String(item.productId))) {
                    const product = await Product.findById(item.productId);
                    if (product && product.inventoryCount !== undefined) {
                        product.inventoryCount = Math.max(0, product.inventoryCount - item.quantity);
                        await product.save();
                    }
                }
            } catch (invErr) {
                console.warn('Inventory update skip:', invErr.message);
            }
        }
        
        const order = await Order.create({
            userId: req.user.id,
            items: cleanItems,
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
        
        // Clear user's cart in database if exists
        try {
            await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
        } catch (cErr) {}
        
        return res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
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
