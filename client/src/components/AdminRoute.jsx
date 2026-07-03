import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }
    
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default AdminRoute;
