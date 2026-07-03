const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments();
        
        // Sum total sales (only delivered/paid orders contribute to actual completed sales, but we can sum all for demo/simplicity)
        const completedOrders = await Order.find({ paymentStatus: 'Paid' });
        const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
        
        // Sales by Category
        const allOrders = await Order.find();
        const categorySales = {};
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.productId ? (categorySales[item.productId.category] || 0) : 0; // fallback category
                // We will count categories from product details
            });
        });
        
        // Simple demo categories mapping from order items
        const categoryCount = {};
        allOrders.forEach(o => {
            o.items.forEach(item => {
                // Approximate category extraction from titles or local logic
                const title = item.title.toLowerCase();
                let category = 'clothing';
                if (title.includes('hoodie') || title.includes('jacket') || title.includes('coat')) {
                    category = 'outerwear';
                } else if (title.includes('shirt') || title.includes('tee')) {
                    category = 'shirts';
                } else if (title.includes('pants') || title.includes('jeans') || title.includes('joggers') || title.includes('trousers')) {
                    category = 'pants';
                } else if (title.includes('watch') || title.includes('longines')) {
                    category = 'watches';
                } else if (title.includes('cap') || title.includes('hat')) {
                    category = 'hats-caps';
                }
                
                categoryCount[category] = (categoryCount[category] || 0) + item.price * item.quantity;
            });
        });
        
        const recentOrders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(5);
        
        return res.json({
            stats: {
                totalProducts,
                totalUsers,
                totalOrders,
                totalSales
            },
            categorySales: Object.keys(categoryCount).map(key => ({
                name: key.toUpperCase(),
                value: categoryCount[key]
            })),
            recentOrders
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching admin dashboard statistics', error: error.message });
    }
};
