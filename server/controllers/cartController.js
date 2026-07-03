const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, items: [] });
        }
        return res.json(cart);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching shopping cart', error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        if (!productId || !size || !color) {
            return res.status(400).json({ message: 'Product ID, size, and color are required' });
        }
        
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, items: [] });
        }
        
        // Check if matching item exists in cart
        const itemIndex = cart.items.findIndex(item => 
            item.productId.toString() === productId && 
            item.size === size && 
            item.color === color
        );
        
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity || 1);
        } else {
            cart.items.push({
                productId,
                quantity: Number(quantity || 1),
                size,
                color
            });
        }
        
        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.productId');
        return res.json(populatedCart);
    } catch (error) {
        return res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        if (quantity === undefined || Number(quantity) < 1) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }
        
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        cart.items[itemIndex].quantity = Number(quantity);
        await cart.save();
        
        const populatedCart = await Cart.findById(cart._id).populate('items.productId');
        return res.json(populatedCart);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();
        
        const populatedCart = await Cart.findById(cart._id).populate('items.productId');
        return res.json(populatedCart);
    } catch (error) {
        return res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};
