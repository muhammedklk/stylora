import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchProfile();
            fetchAddresses();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/profile`);
            setUser(res.data);
        } catch (err) {
            console.error('Error fetching profile', err);
            // Only logout if token is explicitly invalid/expired (401/403)
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${API_URL}/addresses`);
            setAddresses(res.data);
        } catch (err) {
            console.error('Error fetching addresses', err);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        setAddresses([]);
    };

    const updateProfile = async (profileData) => {
        const res = await axios.put(`${API_URL}/auth/profile`, profileData);
        setUser(prev => ({ ...prev, ...res.data }));
        return res.data;
    };

    const addAddress = async (addrData) => {
        const res = await axios.post(`${API_URL}/addresses`, addrData);
        fetchAddresses();
        return res.data;
    };

    const updateAddress = async (id, addrData) => {
        const res = await axios.put(`${API_URL}/addresses/${id}`, addrData);
        fetchAddresses();
        return res.data;
    };

    const deleteAddress = async (id) => {
        await axios.delete(`${API_URL}/addresses/${id}`);
        fetchAddresses();
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            loading,
            addresses,
            login,
            register,
            logout,
            updateProfile,
            addAddress,
            updateAddress,
            deleteAddress,
            fetchAddresses
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
