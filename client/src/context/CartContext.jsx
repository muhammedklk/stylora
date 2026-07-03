import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { API_URL } from '../config';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [cart, setCart] = useState(null);
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
            setCoupon(null);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/cart`);
            setCart(res.data);
        } catch (err) {
            console.error('Error fetching cart', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity, size, color) => {
        if (!isAuthenticated) {
            showToast('Please login to add items to cart', 'error');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/cart/add`, { productId, quantity, size, color });
            setCart(res.data);
        } catch (err) {
            console.error('Error adding to cart', err);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            const res = await axios.put(`${API_URL}/cart/update/${itemId}`, { quantity });
            setCart(res.data);
        } catch (err) {
            console.error('Error updating quantity', err);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const res = await axios.delete(`${API_URL}/cart/remove/${itemId}`);
            setCart(res.data);
        } catch (err) {
            console.error('Error removing from cart', err);
        }
    };

    const applyCoupon = async (code) => {
        if (!cart || cart.items.length === 0) return;
        setCouponError('');
        try {
            const subtotal = getSubtotal();
            const res = await axios.post(`${API_URL}/coupons/validate`, { code, cartSubtotal: subtotal });
            setCoupon(res.data);
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid promo code';
            setCouponError(msg);
            setCoupon(null);
            throw new Error(msg);
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
        setCouponError('');
    };

    const getSubtotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum, item) => {
            const price = item.productId?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const getDiscount = () => {
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        if (coupon.discountType === 'percentage') {
            return Math.round((subtotal * coupon.discountValue) / 100);
        } else {
            return coupon.discountValue;
        }
    };

    const getShipping = () => {
        const subtotal = getSubtotal();
        if (subtotal === 0 || subtotal >= 5000) return 0; // free shipping above 5k
        return 100; // flat rate shipping
    };

    const getTotal = () => {
        const subtotal = getSubtotal();
        const discount = getDiscount();
        const shipping = getShipping();
        return Math.max(0, subtotal - discount + shipping);
    };

    const clearCart = () => {
        setCart(null);
        setCoupon(null);
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            coupon,
            couponError,
            addToCart,
            updateQuantity,
            removeFromCart,
            applyCoupon,
            removeCoupon,
            getSubtotal,
            getDiscount,
            getShipping,
            getTotal,
            clearCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
