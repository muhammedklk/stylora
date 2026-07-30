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

    // Real-time Optimistic Product Deletion
    const handleDeleteProduct = async (id, title) => {
        // Optimistic UI update: Remove product immediately from local state
        const previousProducts = [...adminProducts];
        const updatedProducts = adminProducts.filter(p => p._id !== id);
        setAdminProducts(updatedProducts);
        showToast(`"${title}" deleted successfully!`, 'success');

        // Update local cache and dispatch real-time events across all tabs/windows
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updatedProducts, timestamp: Date.now() }));
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('stylora_products_updated', { detail: updatedProducts }));
        } catch (e) {}

        // Send API request in background
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Delete product failed on backend:', err);
            setAdminProducts(previousProducts);
            showToast(`Failed to delete "${title}". Reverted changes.`, 'error');
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
                        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Quick Actions</h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => navigate('/admin/add-product')}
                                    style={{ padding: '12px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    + Add New Product
                                </button>
                                <button
                                    onClick={() => { setActiveTab('products'); navigate('/admin/dashboard?tab=products'); }}
                                    style={{ padding: '12px 20px', backgroundColor: '#f3f4f6', color: '#111', border: '1px solid #d1d5db', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Manage Catalog
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PRODUCTS CATALOG */}
                {activeTab === 'products' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                        
                        {/* Search & Category Filter Pills Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search products by title..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '10px 16px',
                                        width: '320px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                                <button
                                    onClick={() => navigate('/admin/add-product')}
                                    style={{ padding: '10px 18px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                                >
                                    + Add Product
                                </button>
                            </div>

                            {/* Category Filter Pills */}
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {categories.map(cat => {
                                    const count = cat === 'ALL' ? adminProducts.length : adminProducts.filter(p => 
                                        (p.category && p.category.toUpperCase() === cat) ||
                                        (p.tags && p.tags.some(t => t.toUpperCase() === cat))
                                    ).length;

                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setAdminCategoryFilter(cat)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: adminCategoryFilter === cat ? 700 : 500,
                                                border: adminCategoryFilter === cat ? '1px solid #000' : '1px solid #e5e7eb',
                                                backgroundColor: adminCategoryFilter === cat ? '#000' : '#f9fafb',
                                                color: adminCategoryFilter === cat ? '#fff' : '#4b5563',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {cat} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Product Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Image</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Title</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Price</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Original Price</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Stock</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product, idx) => (
                                            <tr key={product._id || idx} className="admin-product-row" style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s ease' }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ width: '54px', height: '54px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f0f0f0', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                                        <img
                                                            src={resolveImageUrl(product.image)}
                                                            alt={product.title}
                                                            className="admin-product-img"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/find-section-img-1.png'; }}
                                                        />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                                                        ID: #{product._id ? String(product._id).slice(-6) : idx + 1}
                                                    </span>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111', display: 'block' }}>
                                                        {product.title}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '10px',
                                                        fontWeight: 700,
                                                        backgroundColor: '#f3f4f6',
                                                        color: '#374151',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {product.category || 'General'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontWeight: 800, color: '#111', fontSize: '14px' }}>₹{product.price}</td>
                                                <td style={{ padding: '14px 16px', color: '#9ca3af', textDecoration: product.originalPrice ? 'line-through' : 'none' }}>
                                                    {product.originalPrice ? `₹${product.originalPrice}` : '-'}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        backgroundColor: (product.inventoryCount ?? 10) > 0 ? '#dcfce7' : '#fee2e2',
                                                        color: (product.inventoryCount ?? 10) > 0 ? '#15803d' : '#b91c1c'
                                                    }}>
                                                        {(product.inventoryCount ?? 10) > 0 ? `In Stock (${product.inventoryCount ?? 10})` : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                                                            style={{ padding: '7px 14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product._id, product.title)}
                                                            style={{ padding: '7px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                                                No products found matching your filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: ORDERS */}
                {activeTab === 'orders' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Orders</h3>
                        {orders.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px' }}>Order ID</th>
                                        <th style={{ padding: '12px 16px' }}>Customer</th>
                                        <th style={{ padding: '12px 16px' }}>Total Amount</th>
                                        <th style={{ padding: '12px 16px' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{o._id.substring(0, 8)}</td>
                                            <td style={{ padding: '12px 16px' }}>{o.user?.name || o.shippingAddress?.fullName || 'Guest Customer'}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{o.totalPrice}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e' }}>
                                                    {o.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <select
                                                    value={o.status || 'Pending'}
                                                    onChange={e => handleUpdateOrderStatus(o._id, e.target.value)}
                                                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '11px' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#6b7280', margin: 0 }}>No orders placed yet.</p>
                        )}
                    </div>
                )}

                {/* TAB 4: USERS */}
                {activeTab === 'users' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Users</h3>
                        {users.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px' }}>Name</th>
                                        <th style={{ padding: '12px 16px' }}>Email</th>
                                        <th style={{ padding: '12px 16px' }}>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ padding: '12px 16px' }}>{u.email}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, backgroundColor: u.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: u.role === 'admin' ? '#b91c1c' : '#3730a3' }}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#6b7280', margin: 0 }}>No registered users found.</p>
                        )}
                    </div>
                )}

                {/* TAB 5: CONTENT SETTINGS */}
                {activeTab === 'settings' && (
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', maxWidth: '600px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700 }}>Store Content Settings</h3>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={showNotAvailableBadge}
                                    onChange={e => setShowNotAvailableBadge(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: '#000' }}
                                />
                                <div>
                                    <span style={{ fontSize: '14px', fontWeight: 600, display: 'block' }}>Show "Not Available" (N/A) Badge</span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Displays a red N/A badge on empty category tabs in Shop page when products count is 0.</span>
                                </div>
                            </label>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Shop Hero Image URL</label>
                            <input
                                type="text"
                                value={shopHeroImg}
                                onChange={e => setShopHeroImg(e.target.value)}
                                placeholder="/assets/shop-hero.jpg"
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                            />
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '24px 0' }} />

                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#111' }}>
                            Find Your Style - Category Card Images
                        </h4>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
                            Set custom image URLs or paths for the Category Cards displayed on the Home Page "Find Your Style" section.
                        </p>

                        {[
                            { key: 'shirts', label: 'Shirts Category Image', placeholder: '/assets/find-section-img-3.png' },
                            { key: 'pants', label: 'Pants & Trousers Category Image', placeholder: '/assets/find-section-img-2.png' },
                            { key: 'outerwear', label: 'Coats & Jackets (Outerwear) Image', placeholder: '/assets/find-section-img-1.png' },
                            { key: 'shoes', label: 'Shoes & Sneakers Category Image', placeholder: '/assets/find-section-img-4.png' },
                            { key: 'activewear', label: 'Activewear Category Image', placeholder: '/assets/find-section-img-1.png' },
                            { key: 'watches', label: 'Watches Category Image', placeholder: '/assets/find-section-img-3.png' }
                        ].map(cat => (
                            <div key={cat.key} style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#374151' }}>
                                        {cat.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={categoryImages[cat.key] || ''}
                                        onChange={e => handleCategoryImgChange(cat.key, e.target.value)}
                                        placeholder={cat.placeholder}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
                                    />
                                </div>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: '#f3f4f6',
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
                            style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                        >
                            Save All Settings & Category Images
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;
