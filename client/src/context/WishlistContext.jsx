import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [wishlist, setWishlist] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setWishlist(null);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get(`${API_URL}/wishlist`);
            setWishlist(res.data);
        } catch (err) {
            console.error('Error fetching wishlist', err);
        }
    };

    const toggleWishlist = async (productId) => {
        if (!isAuthenticated) {
            showToast('Please login to manage your wishlist', 'error');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/wishlist/toggle`, { productId });
            setWishlist(res.data);
        } catch (err) {
            console.error('Error toggling wishlist', err);
        }
    };

    const inWishlist = (productId) => {
        if (!wishlist || !wishlist.products) return false;
        return wishlist.products.some(p => p._id.toString() === productId.toString());
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            toggleWishlist,
            inWishlist,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
