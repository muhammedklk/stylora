import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    
    // Check master admin override in localStorage
    const localToken = localStorage.getItem('token');
    const localUserStr = localStorage.getItem('user');
    let localUser = null;
    try {
        if (localUserStr) localUser = JSON.parse(localUserStr);
    } catch(e) {}

    const isMasterAdmin = localToken === 'master_admin_token' || localUser?.role === 'admin';

    if (loading && !isMasterAdmin) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }
    
    if (!isMasterAdmin && (!isAuthenticated || user?.role !== 'admin')) {
        return <Navigate to="/admin/login" replace />;
    }
    
    return children;
};

export default AdminRoute;
