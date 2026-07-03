const Coupon = require('../models/coupon');

exports.validateCoupon = async (req, res) => {
    try {
        const { code, cartSubtotal } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or inactive promo code' });
        }
        
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ message: 'This promo code has expired' });
        }
        
        if (Number(cartSubtotal) < coupon.minPurchase) {
            return res.status(400).json({ message: `Minimum purchase of ₹${coupon.minPurchase} required` });
        }
        
        return res.json({
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error validating promo code', error: error.message });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;
        if (!code || !discountValue || !expiryDate) {
            return res.status(400).json({ message: 'Required coupon details are missing' });
        }
        
        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType: discountType || 'percentage',
            discountValue: Number(discountValue),
            minPurchase: Number(minPurchase || 0),
            expiryDate: new Date(expiryDate)
        });
        
        return res.status(201).json(coupon);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating coupon', error: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        await Coupon.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting coupon', error: error.message });
    }
};
