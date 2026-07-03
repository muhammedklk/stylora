const Wishlist = require('../models/wishlist');

exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products');
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
        }
        return res.json(wishlist);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
};

exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        
        let wishlist = await Wishlist.findOne({ userId: req.user.id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
        }
        
        const existsIndex = wishlist.products.indexOf(productId);
        if (existsIndex > -1) {
            wishlist.products.splice(existsIndex, 1); // remove
        } else {
            wishlist.products.push(productId); // add
        }
        
        await wishlist.save();
        const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
        return res.json(populatedWishlist);
    } catch (error) {
        return res.status(500).json({ message: 'Error toggling wishlist', error: error.message });
    }
};
