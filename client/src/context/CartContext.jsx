import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { API_URL } from '../config';

const CartContext = createContext();

const LOCAL_CART_KEY = 'stylora_cart';

const getInitialCart = () => {
    try {
        const saved = localStorage.getItem(LOCAL_CART_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.items)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Error reading local cart:', e);
    }
    return { items: [] };
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [cart, setCart] = useState(getInitialCart);
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(false);

    // Synchronize local cart state to localStorage whenever cart changes
    const saveCartLocally = (newCart) => {
        try {
            localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(newCart));
            window.dispatchEvent(new Event('stylora_cart_updated'));
        } catch (e) {
            console.warn('Error saving local cart:', e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await axios.get(`${API_URL}/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
                    setCart(res.data);
                    saveCartLocally(res.data);
                    return;
                }
            }
        } catch (err) {
            console.warn('Background API cart fetch note:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const resolveProductDetails = async (productIdOrObj) => {
        if (!productIdOrObj) return null;
        if (typeof productIdOrObj === 'object' && (productIdOrObj._id || productIdOrObj.id)) {
            return productIdOrObj;
        }

        const idStr = String(productIdOrObj);

        // Search custom products in local storage
        try {
            const customProds = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
            const foundCustom = customProds.find(p => String(p._id) === idStr || String(p.id) === idStr);
            if (foundCustom) return foundCustom;
        } catch (e) {}

        // Search cached products
        try {
            const cachedProds = JSON.parse(localStorage.getItem('stylora_products_cache') || '[]');
            const foundCached = cachedProds.find(p => String(p._id) === idStr || String(p.id) === idStr);
            if (foundCached) return foundCached;
        } catch (e) {}

        // Try API lookup
        try {
            const res = await axios.get(`${API_URL}/products/${idStr}`);
            const prod = res.data.product || res.data;
            if (prod) return prod;
        } catch (e) {}

        return null;
    };

    const addToCart = async (productIdOrObj, quantity = 1, size = 'M', color = 'Black') => {
        const prodObj = await resolveProductDetails(productIdOrObj);
        
        if (!prodObj) {
            showToast('Unable to add product to cart', 'error');
            return;
        }

        const prodId = String(prodObj._id || prodObj.id || Date.now());
        const prodPrice = Number(prodObj.price) || 0;
        const prodTitle = prodObj.title || 'Product';
        const prodImg = prodObj.image || '';

        const currentItems = cart?.items ? [...cart.items] : [];
        const existingIndex = currentItems.findIndex(
            item => String(item.productId?._id || item.productId?.id || item.productId) === prodId && 
                    item.size === size && 
                    item.color === color
        );

        let updatedItems = [];
        if (existingIndex > -1) {
            updatedItems = currentItems.map((item, idx) => {
                if (idx === existingIndex) {
                    return {
                        ...item,
                        quantity: item.quantity + (Number(quantity) || 1)
                    };
                }
                return item;
            });
        } else {
            const newItem = {
                _id: 'cart-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
                productId: {
                    _id: prodId,
                    id: prodId,
                    title: prodTitle,
                    price: prodPrice,
                    image: prodImg
                },
                quantity: Number(quantity) || 1,
                size: size || 'M',
                color: color || 'Black'
            };
            updatedItems = [...currentItems, newItem];
        }

        const updatedCart = { ...cart, items: updatedItems };
        setCart(updatedCart);
        saveCartLocally(updatedCart);
        showToast(`🛒 "${prodTitle}" added to cart!`, 'success');

        // Optional API background sync if authenticated
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await axios.post(`${API_URL}/cart/add`, { 
                        productId: prodId, 
                        quantity, 
                        size, 
                        color 
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (err) {
                console.warn('Background server cart sync note:', err.message);
            }
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        const newQty = Number(quantity);
        if (newQty <= 0) {
            return removeFromCart(itemId);
        }

        const currentItems = cart?.items ? [...cart.items] : [];
        const updatedItems = currentItems.map(item => {
            if (String(item._id) === String(itemId) || String(item.productId?._id) === String(itemId)) {
                return { ...item, quantity: newQty };
            }
            return item;
        });

        const updatedCart = { ...cart, items: updatedItems };
        setCart(updatedCart);
        saveCartLocally(updatedCart);

        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await axios.put(`${API_URL}/cart/update/${itemId}`, { quantity: newQty }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (err) {}
        }
    };

    const removeFromCart = async (itemId) => {
        const currentItems = cart?.items ? [...cart.items] : [];
        const updatedItems = currentItems.filter(
            item => String(item._id) !== String(itemId) && String(item.productId?._id) !== String(itemId)
        );

        const updatedCart = { ...cart, items: updatedItems };
        setCart(updatedCart);
        saveCartLocally(updatedCart);
        showToast('Item removed from cart', 'info');

        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (err) {}
        }
    };

    const applyCoupon = async (code) => {
        if (!cart || !cart.items || cart.items.length === 0) return;
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
            const price = Number(item.productId?.price) || 0;
            return sum + (price * Number(item.quantity || 1));
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
        const emptyCart = { items: [] };
        setCart(emptyCart);
        saveCartLocally(emptyCart);
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
