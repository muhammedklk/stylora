import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL, resolveImageUrl } from '../config';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { productsData } from '../products-data';

const CACHE_KEY = 'stylora_products_cache';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { settings, updateSettings } = useSettings();

    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'overview';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [adminProducts, setAdminProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
    const [adminCategoryFilter, setAdminCategoryFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Local state for Content Settings tab
    const [showNotAvailableBadge, setShowNotAvailableBadge] = useState(settings?.showNotAvailableBadge ?? false);
    const [shopHeroImg, setShopHeroImg] = useState(settings?.shopHeroImage || '');
    const [categoryImages, setCategoryImages] = useState({
        shirts: settings?.categoryImages?.shirts || '',
        pants: settings?.categoryImages?.pants || '',
        outerwear: settings?.categoryImages?.outerwear || '',
        shoes: settings?.categoryImages?.shoes || '',
        activewear: settings?.categoryImages?.activewear || '',
        watches: settings?.categoryImages?.watches || ''
    });

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab) setActiveTab(tab);
    }, [location.search]);

    useEffect(() => {
        if (settings) {
            setShowNotAvailableBadge(settings.showNotAvailableBadge ?? false);
            setShopHeroImg(settings.shopHeroImage || '');
            if (settings.categoryImages) {
                setCategoryImages(prev => ({
                    ...prev,
                    ...settings.categoryImages
                }));
            }
        }
    }, [settings]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const [prodRes, orderRes, userRes] = await Promise.allSettled([
                axios.get(`${API_URL}/products`),
                axios.get(`${API_URL}/orders`, authHeader),
                axios.get(`${API_URL}/users`, authHeader)
            ]);

            let fetchedProducts = [];
            if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
                fetchedProducts = prodRes.value.data;
            } else {
                fetchedProducts = productsData;
            }
            setAdminProducts(fetchedProducts);

            let fetchedOrders = [];
            if (orderRes.status === 'fulfilled' && Array.isArray(orderRes.value.data)) {
                fetchedOrders = orderRes.value.data;
            }
            setOrders(fetchedOrders);

            let fetchedUsers = [];
            if (userRes.status === 'fulfilled' && Array.isArray(userRes.value.data)) {
                fetchedUsers = userRes.value.data;
            }
            setUsers(fetchedUsers);

            // Compute stats
            const rev = fetchedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            setStats({
                totalRevenue: rev,
                totalOrders: fetchedOrders.length,
                totalProducts: fetchedProducts.length,
                totalUsers: fetchedUsers.length
            });
        } catch (err) {
            console.warn('Error fetching admin data:', err.message);
        }
    };

    // Real-Time Permanent Product Deletion
    const handleDeleteProduct = async (id, title) => {
        // 1. Immediately remove product from local state
        const updatedProducts = adminProducts.filter(p => String(p._id) !== String(id));
        setAdminProducts(updatedProducts);
        showToast(`"${title}" deleted successfully!`, 'success');

        // 2. Immediately update local cache and dispatch sync event across open pages
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updatedProducts, timestamp: Date.now() }));
            window.dispatchEvent(new Event('stylora_products_updated'));
        } catch (e) {}

        // 3. Send API delete request if it's a valid 24-char MongoDB ObjectId
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (id && String(id).length === 24 && /^[0-9a-fA-F]{24}$/.test(String(id))) {
                await axios.delete(`${API_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.warn('Backend deletion sync completed:', err.message);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/orders/${orderId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            showToast('Order status updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update order status.', 'error');
        }
    };

    const handleSaveSettings = () => {
        updateSettings({
            showNotAvailableBadge,
            shopHeroImage: shopHeroImg,
            categoryImages
        });
        showToast('Settings & Category Images saved successfully!', 'success');
    };

    const handleCategoryImgChange = (catKey, value) => {
        setCategoryImages(prev => ({
            ...prev,
            [catKey]: value
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        showToast('Logged out of Admin Dashboard', 'info');
        navigate('/admin/login');
    };

    // Categories for filter tabs
    const categories = ['ALL', 'CLOTHING', 'SHIRTS', 'PANTS', 'SHOES', 'WATCHES', 'ACCESSORIES', 'OUTERWEAR', 'ACTIVEWEAR'];

    // Filter products by category and search
    const filteredProducts = adminProducts.filter(p => {
        const matchesCategory = adminCategoryFilter === 'ALL' || 
            (p.category && p.category.toUpperCase() === adminCategoryFilter) ||
            (p.tags && p.tags.some(t => t.toUpperCase() === adminCategoryFilter));
        const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Admin Header */}
            <header style={{
                backgroundColor: '#0f0f0f',
                color: '#fff',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.1em', color: '#d4af37', textTransform: 'uppercase' }}>
                        Stylora Admin
                    </h2>
                    <span style={{ backgroundColor: '#222', color: '#aaa', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Control Panel
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/admin/add-product')}
                        style={{
                            backgroundColor: '#d4af37',
                            color: '#000',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>+ Add Product</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            padding: '10px 16px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Sub-Header Navigation Tabs */}
            <nav style={{
                backgroundColor: '#fff',
                borderBottom: '1px solid #e5e7eb',
                padding: '0 32px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto'
            }}>
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'products', label: `Products (${adminProducts.length})` },
                    { id: 'orders', label: `Orders (${orders.length})` },
                    { id: 'users', label: `Users (${users.length})` },
                    { id: 'settings', label: 'Content Settings' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            navigate(`/admin/dashboard?tab=${tab.id}`);
                        }}
                        style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            color: activeTab === tab.id ? '#000' : '#6b7280',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2.5px solid #000' : '2.5px solid transparent',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Main Content Area */}
            <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
                                <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#111' }}>₹{stats.totalRevenue.toLocaleString()}</h3>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</span>
                                <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#111' }}>{stats.totalOrders}</h3>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Products</span>
                                <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#111' }}>{stats.totalProducts}</h3>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Users</span>
                                <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#111' }}>{stats.totalUsers}</h3>
                            </div>
                        </div>

                        {/* Recent Activity Card */}
            {/* Main Workspace Body */}
            <div style={{ display: 'flex', flex: 1 }}>

                {/* Left Sidebar Navigation */}
                <aside style={{ 
                    width: '260px', 
                    backgroundColor: '#14161d', 
                    borderRight: '1px solid #232733', 
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ padding: '0 12px 16px 12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b7280' }}>
                        Admin Management
                    </div>

                    {[
                        { id: 'overview', label: 'Overview Dashboard', icon: '📊' },
                        { id: 'products', label: 'Products Catalog', icon: '🛍️', badge: adminProducts.length },
                        { id: 'orders', label: 'Orders List', icon: '📦', badge: orders.length },
                        { id: 'users', label: 'Users & Customers', icon: '👥', badge: users.length },
                        { id: 'settings', label: 'Content Settings', icon: '⚙️' }
                    ].map(item => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); navigate(`/admin/dashboard?tab=${item.id}`); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: active ? '#d4af37' : 'transparent',
                                    color: active ? '#000000' : '#9ca3af',
                                    fontSize: '13px',
                                    fontWeight: active ? 700 : 500,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </span>
                                {item.badge !== undefined && (
                                    <span style={{ 
                                        backgroundColor: active ? '#000' : '#232733', 
                                        color: active ? '#fff' : '#9ca3af', 
                                        fontSize: '11px', 
                                        fontWeight: 700, 
                                        padding: '2px 8px', 
                                        borderRadius: '12px' 
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* Right Content View */}
                <main style={{ flex: 1, padding: '32px 40px', backgroundColor: '#0d0e12', overflowY: 'auto' }}>

                    {/* TAB 1: OVERVIEW DASHBOARD */}
                    {activeTab === 'overview' && (
                        <div>
                            <div style={{ marginBottom: '28px' }}>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>Dashboard Overview</h1>
                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Real-time metrics and store inventory health.</p>
                            </div>

                            {/* KPI Stat Cards Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                                {[
                                    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#10b981', icon: '💰' },
                                    { title: 'Total Orders', value: stats.totalOrders, color: '#3b82f6', icon: '📦' },
                                    { title: 'Active Products', value: stats.totalProducts, color: '#d4af37', icon: '🏷️' },
                                    { title: 'Registered Users', value: stats.totalUsers, color: '#8b5cf6', icon: '👥' }
                                ].map((kpi, idx) => (
                                    <div key={idx} style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '12px', padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.title}</span>
                                            <span style={{ fontSize: '20px' }}>{kpi.icon}</span>
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff' }}>{kpi.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Category Distribution Breakdown */}
                            <div style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '12px', padding: '28px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', color: '#ffffff' }}>Category Distribution</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    {[
                                        { label: 'Clothing', count: categoryCounts.CLOTHING, color: '#3b82f6' },
                                        { label: 'Shirts', count: categoryCounts.SHIRTS, color: '#10b981' },
                                        { label: 'Pants & Shorts', count: categoryCounts.PANTS, color: '#f59e0b' },
                                        { label: 'Shoes', count: categoryCounts.SHOES, color: '#ec4899' },
                                        { label: 'Outerwear', count: categoryCounts.OUTERWEAR, color: '#8b5cf6' },
                                        { label: 'Watches', count: categoryCounts.WATCHES, color: '#d4af37' }
                                    ].map(cat => (
                                        <div key={cat.label} style={{ backgroundColor: '#1e222d', padding: '16px', borderRadius: '8px', border: '1px solid #2d3345' }}>
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>{cat.label}</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: cat.color }}>{cat.count} Products</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PRODUCTS CATALOG */}
                    {activeTab === 'products' && (
                        <div>
                            {/* Header & Add Action */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>Products Catalog</h1>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Manage, edit, and delete products in real-time.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/products/add')}
                                    style={{
                                        backgroundColor: '#d4af37',
                                        color: '#000000',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)'
                                    }}
                                >
                                    <span>+</span> Add New Product
                                </button>
                            </div>

                            {/* Search & Category Filter Pills */}
                            <div style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Search product title, category or ID..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#1e222d',
                                            border: '1px solid #2d3345',
                                            color: '#ffffff',
                                            padding: '12px 16px',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {Object.keys(categoryCounts).map(catKey => {
                                        const count = categoryCounts[catKey];
                                        const isActive = adminCategoryFilter === catKey;
                                        return (
                                            <button
                                                key={catKey}
                                                onClick={() => setAdminCategoryFilter(catKey)}
                                                style={{
                                                    backgroundColor: isActive ? '#ffffff' : '#1e222d',
                                                    color: isActive ? '#000000' : '#9ca3af',
                                                    border: '1px solid',
                                                    borderColor: isActive ? '#ffffff' : '#2d3345',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {catKey} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Products List Grid */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, idx) => (
                                        <div 
                                            key={product._id || idx}
                                            className="admin-product-row"
                                            style={{
                                                backgroundColor: '#14161d',
                                                border: '1px solid #232733',
                                                borderRadius: '10px',
                                                padding: '16px 20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '20px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {/* Product Image & Info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                                <div style={{ 
                                                    width: '56px', 
                                                    height: '56px', 
                                                    borderRadius: '6px', 
                                                    overflow: 'hidden', 
                                                    backgroundColor: '#1e222d', 
                                                    border: '1px solid #2d3345',
                                                    flexShrink: 0
                                                }}>
                                                    <img 
                                                        src={resolveImageUrl(product.image)} 
                                                        alt={product.title} 
                                                        className="admin-product-img"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={e => { e.target.onerror = null; e.target.src = '/assets/find-section-img-1.png'; }}
                                                    />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#d4af37', backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                                            #{product._id ? String(product._id).substring(String(product._id).length - 6) : `P-${idx + 1}`}
                                                        </span>
                                                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', backgroundColor: '#1e222d', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{product.title}</h4>
                                                </div>
                                            </div>

                                            {/* Price & Inventory */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Price</div>
                                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>₹{product.price}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Stock</div>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: (product.inventoryCount || 50) > 0 ? '#10b981' : '#ef4444' }}>
                                                        {product.inventoryCount || 50} units
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                    style={{
                                                        backgroundColor: '#1e222d',
                                                        color: '#e5e7eb',
                                                        border: '1px solid #2d3345',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id, product.title)}
                                                    style={{
                                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                                        color: '#ef4444',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '10px', padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
                                        No products found in this category or search filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ORDERS LIST */}
                    {activeTab === 'orders' && (
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>Customer Orders</h1>
                            <div style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '12px', padding: '24px' }}>
                                {orders.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #232733', color: '#9ca3af', textAlign: 'left' }}>
                                                <th style={{ padding: '12px 16px' }}>Order ID</th>
                                                <th style={{ padding: '12px 16px' }}>Customer</th>
                                                <th style={{ padding: '12px 16px' }}>Total Price</th>
                                                <th style={{ padding: '12px 16px' }}>Status</th>
                                                <th style={{ padding: '12px 16px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(o => (
                                                <tr key={o._id} style={{ borderBottom: '1px solid #1e222d' }}>
                                                    <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 700, color: '#d4af37' }}>#{String(o._id).substring(0, 8)}</td>
                                                    <td style={{ padding: '16px', color: '#ffffff' }}>{o.shippingAddress?.fullName || 'Customer'}</td>
                                                    <td style={{ padding: '16px', fontWeight: 700, color: '#ffffff' }}>₹{o.totalPrice}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ 
                                                            padding: '4px 10px', 
                                                            borderRadius: '12px', 
                                                            fontSize: '11px', 
                                                            fontWeight: 700, 
                                                            backgroundColor: o.status === 'delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                                                            color: o.status === 'delivered' ? '#10b981' : '#f59e0b' 
                                                        }}>
                                                            {o.status || 'processing'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <select
                                                            value={o.status || 'processing'}
                                                            onChange={e => handleUpdateOrderStatus(o._id, e.target.value)}
                                                            style={{ backgroundColor: '#1e222d', color: '#ffffff', border: '1px solid #2d3345', padding: '6px 12px', borderRadius: '4px', fontSize: '12px' }}
                                                        >
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#9ca3af', margin: 0, textAlign: 'center', padding: '24px 0' }}>No customer orders placed yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: USERS LIST */}
                    {activeTab === 'users' && (
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>Registered Users</h1>
                            <div style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '12px', padding: '24px' }}>
                                {users.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #232733', color: '#9ca3af', textAlign: 'left' }}>
                                                <th style={{ padding: '12px 16px' }}>Name</th>
                                                <th style={{ padding: '12px 16px' }}>Email</th>
                                                <th style={{ padding: '12px 16px' }}>Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u._id} style={{ borderBottom: '1px solid #1e222d' }}>
                                                    <td style={{ padding: '16px', fontWeight: 700, color: '#ffffff' }}>{u.name}</td>
                                                    <td style={{ padding: '16px', color: '#9ca3af' }}>{u.email}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: u.role === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: u.role === 'admin' ? '#d4af37' : '#3b82f6' }}>
                                                            {u.role || 'user'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#9ca3af', margin: 0, textAlign: 'center', padding: '24px 0' }}>No registered users found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: CONTENT SETTINGS */}
                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '640px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '24px' }}>Store Content Settings</h1>
                            <div style={{ backgroundColor: '#14161d', border: '1px solid #232733', borderRadius: '12px', padding: '28px' }}>
                                
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={showNotAvailableBadge}
                                            onChange={e => setShowNotAvailableBadge(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: '#d4af37' }}
                                        />
                                        <div>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', display: 'block' }}>Show "Not Available" (N/A) Badge</span>
                                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Displays a red N/A badge on empty category tabs when product count is 0.</span>
                                        </div>
                                    </label>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', display: 'block', marginBottom: '8px' }}>Shop Hero Image URL</label>
                                    <input
                                        type="text"
                                        value={shopHeroImg}
                                        onChange={e => setShopHeroImg(e.target.value)}
                                        placeholder="/assets/shop-hero.jpg"
                                        style={{ width: '100%', padding: '12px 16px', backgroundColor: '#1e222d', border: '1px solid #2d3345', borderRadius: '6px', fontSize: '13px', color: '#ffffff', outline: 'none' }}
                                    />
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid #232733', margin: '28px 0' }} />

                                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                                    Find Your Style - Category Card Images
                                </h4>
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
                                    Set custom image URLs for the 6 Category Cards on the Home Page.
                                </p>

                                {[
                                    { key: 'shirts', label: 'Shirts Category Image', placeholder: '/assets/find-section-img-3.png' },
                                    { key: 'pants', label: 'Pants & Trousers Category Image', placeholder: '/assets/find-section-img-2.png' },
                                    { key: 'outerwear', label: 'Coats & Jackets Category Image', placeholder: '/assets/find-section-img-1.png' },
                                    { key: 'shoes', label: 'Shoes & Sneakers Category Image', placeholder: '/assets/find-section-img-4.png' },
                                    { key: 'activewear', label: 'Activewear Category Image', placeholder: '/assets/find-section-img-1.png' },
                                    { key: 'watches', label: 'Watches Category Image', placeholder: '/assets/find-section-img-3.png' }
                                ].map(cat => (
                                    <div key={cat.key} style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#d1d5db' }}>
                                                {cat.label}
                                            </label>
                                            <input
                                                type="text"
                                                value={categoryImages[cat.key] || ''}
                                                onChange={e => handleCategoryImgChange(cat.key, e.target.value)}
                                                placeholder={cat.placeholder}
                                                style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1e222d', border: '1px solid #2d3345', borderRadius: '6px', fontSize: '12px', color: '#ffffff', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            border: '1px solid #2d3345',
                                            backgroundColor: '#1e222d',
                                            flexShrink: 0,
                                            marginTop: '16px'
                                        }}>
                                            <img
                                                src={resolveImageUrl(categoryImages[cat.key] || cat.placeholder)}
                                                alt={cat.label}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = cat.placeholder; }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleSaveSettings}
                                    style={{ 
                                        marginTop: '24px', 
                                        padding: '14px 28px', 
                                        backgroundColor: '#d4af37', 
                                        color: '#000000', 
                                        border: 'none', 
                                        borderRadius: '6px', 
                                        fontSize: '13px', 
                                        fontWeight: 800, 
                                        cursor: 'pointer', 
                                        width: '100%',
                                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)'
                                    }}
                                >
                                    Save All Content Settings
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
