import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { settings, updateSettings } = useSettings();
    const navigate = useNavigate();

    // Changed to support sidebar pages: 'overview', 'products', 'orders', 'coupons', and content sections
    const [activeAdminTab, setActiveAdminTab] = useState('overview');
    const [contentMenuOpen, setContentMenuOpen] = useState(false);

    // Dynamic Site Content States
    const [editHeroTitle, setEditHeroTitle] = useState('');
    const [editHeroSubtitle, setEditHeroSubtitle] = useState('');
    const [editHeroImage, setEditHeroImage] = useState('');
    const [editHeroTag, setEditHeroTag] = useState('');

    const [editAboutTitle, setEditAboutTitle] = useState('');
    const [editAboutContent, setEditAboutContent] = useState('');
    const [editAboutSubContent, setEditAboutSubContent] = useState('');
    const [editAboutHeroImage, setEditAboutHeroImage] = useState('');

    const [editShopHeroImage, setEditShopHeroImage] = useState('');
    const [editAccessoriesHeroImage, setEditAccessoriesHeroImage] = useState('');
    const [editContactHeroImage, setEditContactHeroImage] = useState('');

    const [editContactEmail, setEditContactEmail] = useState('');
    const [editContactPhone, setEditContactPhone] = useState('');
    const [editContactAddress, setEditContactAddress] = useState('');
    const [editSocialInstagram, setEditSocialInstagram] = useState('');
    const [editSocialTwitter, setEditSocialTwitter] = useState('');
    const [editPolicyShipping, setEditPolicyShipping] = useState('');
    const [editPolicyReturns, setEditPolicyReturns] = useState('');
    const [editPolicyPrivacy, setEditPolicyPrivacy] = useState('');
    const [editPolicyTerms, setEditPolicyTerms] = useState('');

    // Settings local upload file and type states
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroImageType, setHeroImageType] = useState('url');

    const [aboutHeroImageFile, setAboutHeroImageFile] = useState(null);
    const [aboutHeroImageType, setAboutHeroImageType] = useState('url');

    const [shopHeroImageFile, setShopHeroImageFile] = useState(null);
    const [shopHeroImageType, setShopHeroImageType] = useState('url');

    const [accessoriesHeroImageFile, setAccessoriesHeroImageFile] = useState(null);
    const [accessoriesHeroImageType, setAccessoriesHeroImageType] = useState('url');

    const [contactHeroImageFile, setContactHeroImageFile] = useState(null);
    const [contactHeroImageType, setContactHeroImageType] = useState('url');

    const [adminStats, setAdminStats] = useState(null);
    const [adminProducts, setAdminProducts] = useState([]);
    const [adminOrders, setAdminOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [adminCoupons, setAdminCoupons] = useState([]);
    const [adminLoading, setAdminLoading] = useState(true);

    // Filter/search states
    const [productSearch, setProductSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');

    // Form states
    const [newCouponCode, setNewCouponCode] = useState('');
    const [newCouponVal, setNewCouponVal] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else if (user.role !== 'admin') {
            alert('Access denied. Admin role required.');
            navigate('/');
        } else {
            fetchAdminData();
        }
    }, [user]);

    useEffect(() => {
        if (settings) {
            setEditHeroTitle(settings.heroTitle || '');
            setEditHeroSubtitle(settings.heroSubtitle || '');
            setEditHeroImage(settings.heroImage || '');
            setEditHeroTag(settings.heroTag || '');

            setEditAboutTitle(settings.aboutTitle || '');
            setEditAboutContent(settings.aboutContent || '');
            setEditAboutSubContent(settings.aboutSubContent || '');
            setEditAboutHeroImage(settings.aboutHeroImage || '');

            setEditShopHeroImage(settings.shopHeroImage || '');
            setEditAccessoriesHeroImage(settings.accessoriesHeroImage || '');
            setEditContactHeroImage(settings.contactHeroImage || '');

            setEditContactEmail(settings.contactEmail || '');
            setEditContactPhone(settings.contactPhone || '');
            setEditContactAddress(settings.contactAddress || '');
            setEditSocialInstagram(settings.socialInstagram || '');
            setEditSocialTwitter(settings.socialTwitter || '');
            setEditPolicyShipping(settings.policyShipping || '');
            setEditPolicyReturns(settings.policyReturns || '');
            setEditPolicyPrivacy(settings.policyPrivacy || '');
            setEditPolicyTerms(settings.policyTerms || '');
        }
    }, [settings]);

    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('heroTitle', editHeroTitle);
            formData.append('heroSubtitle', editHeroSubtitle);
            formData.append('heroTag', editHeroTag);
            
            formData.append('aboutTitle', editAboutTitle);
            formData.append('aboutContent', editAboutContent);
            formData.append('aboutSubContent', editAboutSubContent);

            formData.append('contactEmail', editContactEmail);
            formData.append('contactPhone', editContactPhone);
            formData.append('contactAddress', editContactAddress);
            formData.append('socialInstagram', editSocialInstagram);
            formData.append('socialTwitter', editSocialTwitter);
            formData.append('policyShipping', editPolicyShipping);
            formData.append('policyReturns', editPolicyReturns);
            formData.append('policyPrivacy', editPolicyPrivacy);
            formData.append('policyTerms', editPolicyTerms);

            // Handle Homepage Hero Image
            if (heroImageType === 'file' && heroImageFile) {
                formData.append('heroImage', heroImageFile);
            } else {
                formData.append('heroImage', editHeroImage);
            }

            // Handle About Page Hero Image
            if (aboutHeroImageType === 'file' && aboutHeroImageFile) {
                formData.append('aboutHeroImage', aboutHeroImageFile);
            } else {
                formData.append('aboutHeroImage', editAboutHeroImage);
            }

            // Handle Shop Page Hero Image
            if (shopHeroImageType === 'file' && shopHeroImageFile) {
                formData.append('shopHeroImage', shopHeroImageFile);
            } else {
                formData.append('shopHeroImage', editShopHeroImage);
            }

            // Handle Accessories Page Hero Image
            if (accessoriesHeroImageType === 'file' && accessoriesHeroImageFile) {
                formData.append('accessoriesHeroImage', accessoriesHeroImageFile);
            } else {
                formData.append('accessoriesHeroImage', editAccessoriesHeroImage);
            }

            // Handle Contact Page Hero Image
            if (contactHeroImageType === 'file' && contactHeroImageFile) {
                formData.append('contactHeroImage', contactHeroImageFile);
            } else {
                formData.append('contactHeroImage', editContactHeroImage);
            }

            await updateSettings(formData);
            alert('Website content updated successfully!');
            
            // Clear file states on success
            setHeroImageFile(null);
            setAboutHeroImageFile(null);
            setShopHeroImageFile(null);
            setAccessoriesHeroImageFile(null);
            setContactHeroImageFile(null);
        } catch (err) {
            console.error("Error saving settings:", err);
            alert('Error updating website content settings.');
        }
    };

    const fetchAdminData = async () => {
        setAdminLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const statsRes = await axios.get(`${API_URL}/admin/dashboard`, { headers });
            setAdminStats(statsRes.data);

            const prodRes = await axios.get(`${API_URL}/products`);
            setAdminProducts(prodRes.data);

            const ordersRes = await axios.get(`${API_URL}/orders/all`, { headers });
            setAdminOrders(ordersRes.data);

            // Coupons validate call or mocked data
            setAdminCoupons([
                { _id: '1', code: 'WELCOME10', discountValue: 10, discountType: 'percentage', expiryDate: '2027-12-31' },
                { _id: '2', code: 'STYLORA20', discountValue: 20, discountType: 'percentage', expiryDate: '2027-12-31' }
            ]);
        } catch (err) {
            console.error('Error fetching admin details', err);
        } finally {
            setAdminLoading(false);
        }
    };

    const handleDeleteProduct = async (prodId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${prodId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Product deleted successfully!');
            fetchAdminData();
        } catch (err) {
            alert('Error deleting product');
        }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/coupons`, {
                code: newCouponCode,
                discountType: 'percentage',
                discountValue: Number(newCouponVal),
                expiryDate: '2027-12-31'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewCouponCode('');
            setNewCouponVal('');
            alert('Coupon created successfully!');
            fetchAdminData();
        } catch (err) {
            alert('Error creating coupon');
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const statuses = ['Placed', 'Processed', 'Shipped', 'Out for Delivery', 'Delivered'];
        const nextIdx = statuses.indexOf(currentStatus) + 1;
        if (nextIdx >= statuses.length) {
            alert('Order is already Delivered.');
            return;
        }
        const nextStatus = statuses[nextIdx];
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: nextStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Order status updated to ${nextStatus}!`);
            fetchAdminData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleAdminLogout = () => {
        logout();
        navigate('/admin/login');
    };

    if (!user || user.role !== 'admin') return null;

    // Filter lists
    const filteredProducts = adminProducts.filter(p => 
        p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.category.toLowerCase().includes(productSearch.toLowerCase()) || 
        (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()))
    );

    const filteredOrders = adminOrders.filter(o => 
        o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.status.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.userId?.name && o.userId.name.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.userId?.email && o.userId.email.toLowerCase().includes(orderSearch.toLowerCase()))
    );

    // Sidebar navigation styles
    const sidebarLinkStyle = (tab) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        backgroundColor: activeAdminTab === tab ? '#111' : 'transparent',
        color: activeAdminTab === tab ? '#fff' : '#555',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: activeAdminTab === tab ? '700' : '500',
        cursor: 'pointer',
        borderRadius: '3px',
        transition: 'all 0.2s ease',
        marginBottom: '4px'
    });

    const submenuLinkStyle = (tab) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: activeAdminTab === tab ? '#fafafa' : 'transparent',
        color: activeAdminTab === tab ? '#000' : '#666',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: activeAdminTab === tab ? '700' : '500',
        cursor: 'pointer',
        borderRadius: '3px',
        transition: 'all 0.2s ease',
        marginBottom: '2px',
        paddingLeft: '32px'
    });

    return (
        <main className="account-main">
            {/* Admin Dashboard Hero Header */}
            <section className="shop-hero" style={{ background: '#0f0f0f' }}>
                <div className="hero-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag" style={{ color: '#d4af37' }}>[ Control Workspace ]</span>
                    <h1 className="shop-hero-title" style={{ color: '#fff' }}>Store Suite Administration</h1>
                    <p className="shop-hero-subtitle" style={{ color: '#aaa' }}>Manage catalog inventory, fulfill customer orders, and monitor sales analytics.</p>
                </div>
            </section>

            {/* Main Admin Section */}
            <section className="account-section py-5">
                <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="row g-4">
                        
                        {/* LEFT SIDEBAR NAVIGATION */}
                        <div className="col-lg-3 col-md-4">
                            <div className="p-4" style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '4px', position: 'sticky', top: '100px' }}>
                                <div className="mb-4 text-center pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '18px', fontWeight: 'bold' }}>
                                        A
                                    </div>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111' }}>{user.name}</h5>
                                    <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Store Administrator</span>
                                </div>

                                <nav className="d-flex flex-column">
                                    <button 
                                        onClick={() => {
                                            setActiveAdminTab('overview');
                                        }}
                                        style={sidebarLinkStyle('overview')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="9" />
                                            <rect x="14" y="3" width="7" height="5" />
                                            <rect x="14" y="12" width="7" height="9" />
                                            <rect x="3" y="16" width="7" height="5" />
                                        </svg>
                                        Overview / Stats
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setActiveAdminTab('products');
                                        }}
                                        style={sidebarLinkStyle('products')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                        Products Catalog
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setActiveAdminTab('orders');
                                        }}
                                        style={sidebarLinkStyle('orders')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                        </svg>
                                        Orders Management
                                    </button>

                                    <button 
                                        onClick={() => {
                                            setActiveAdminTab('coupons');
                                        }}
                                        style={sidebarLinkStyle('coupons')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                            <line x1="7" y1="7" x2="7.01" y2="7" />
                                        </svg>
                                        Promo Coupons
                                    </button>

                                    {/* EXPANDABLE CONTENT SETTINGS BUTTON */}
                                    <button 
                                        onClick={() => setContentMenuOpen(!contentMenuOpen)}
                                        style={{
                                            ...sidebarLinkStyle('content'),
                                            backgroundColor: activeAdminTab.startsWith('content-') ? '#f3f3f3' : 'transparent',
                                            color: activeAdminTab.startsWith('content-') ? '#000' : '#555',
                                            fontWeight: activeAdminTab.startsWith('content-') ? '700' : '500',
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                                        </svg>
                                        Content settings
                                        <span style={{ 
                                            marginLeft: 'auto', 
                                            transform: contentMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                            fontSize: '9px',
                                            color: '#888'
                                        }}>▶</span>
                                    </button>

                                    {/* EXPANDABLE SUBMENU PANEL */}
                                    <div style={{
                                        maxHeight: contentMenuOpen ? '250px' : '0px',
                                        overflow: 'hidden',
                                        transition: 'max-height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        borderLeft: '1px solid #eee',
                                        marginLeft: '14px',
                                        paddingLeft: '4px'
                                    }}>
                                        <button onClick={() => setActiveAdminTab('content-home')} style={submenuLinkStyle('content-home')}>Homepage Hero</button>
                                        <button onClick={() => setActiveAdminTab('content-about')} style={submenuLinkStyle('content-about')}>About Us Page</button>
                                        <button onClick={() => setActiveAdminTab('content-shop')} style={submenuLinkStyle('content-shop')}>Shop Page</button>
                                        <button onClick={() => setActiveAdminTab('content-accessories')} style={submenuLinkStyle('content-accessories')}>Accessories Page</button>
                                        <button onClick={() => setActiveAdminTab('content-contact')} style={submenuLinkStyle('content-contact')}>Contact & Info</button>
                                        <button onClick={() => setActiveAdminTab('content-policies')} style={submenuLinkStyle('content-policies')}>Store Policies</button>
                                    </div>

                                    <button 
                                        onClick={handleAdminLogout}
                                        style={{
                                            ...sidebarLinkStyle('logout'),
                                            marginTop: '20px',
                                            borderTop: '1px solid #f0f0f0',
                                            paddingTop: '20px',
                                            color: '#e53e3e',
                                            fontWeight: 600
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout from Suite
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* RIGHT MAIN WORKSPACE */}
                        <div className="col-lg-9 col-md-8">
                            <div className="p-5" style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '4px', minHeight: '600px' }}>
                                
                                {adminLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
                                        <p style={{ fontSize: '14px', color: '#666' }}>Loading administrative data workspace...</p>
                                    </div>
                                ) : (
                                    <div>
                                        
                                        {/* SCREEN 1: OVERVIEW / STATS */}
                                        {activeAdminTab === 'overview' && (
                                            <div>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Store Suite Analytics</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Real-time business performance overview.</p>
                                                </div>

                                                {/* Stats Cards Row */}
                                                <div className="row g-3 mb-5">
                                                    <div className="col-md-3 col-sm-6">
                                                        <div className="p-4 text-center" style={{ backgroundColor: '#000', color: '#fff', borderRadius: '2px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                                                            <h5 style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 600, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px' }}>Total Sales</h5>
                                                            <span style={{ fontSize: '24px', fontWeight: 700 }}>₹{adminStats?.stats?.totalSales}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-sm-6">
                                                        <div className="p-4 text-center" style={{ backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '2px' }}>
                                                            <h5 style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Orders</h5>
                                                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#000' }}>{adminStats?.stats?.totalOrders}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-sm-6">
                                                        <div className="p-4 text-center" style={{ backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '2px' }}>
                                                            <h5 style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Products</h5>
                                                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#000' }}>{adminStats?.stats?.totalProducts}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 col-sm-6">
                                                        <div className="p-4 text-center" style={{ backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '2px' }}>
                                                            <h5 style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Active Users</h5>
                                                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#000' }}>{adminStats?.stats?.totalUsers}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4" style={{ backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '2px' }}>
                                                    <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#111', marginBottom: '12px' }}>System Health & Database Logs</h4>
                                                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0 }}>
                                                        All systems operational. Connected securely to MongoDB Atlas cluster. Administrative authentication active.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* SCREEN 2: PRODUCTS CATALOG */}
                                        {activeAdminTab === 'products' && (
                                            <div>
                                                <div className="mb-4 pb-3 d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <div>
                                                        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Products Catalog</h2>
                                                        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Add, update, or remove e-commerce items from catalog inventory.</p>
                                                    </div>
                                                    <button 
                                                        className="checkout-btn" 
                                                        style={{ padding: '10px 20px', width: 'auto', fontSize: '12px' }} 
                                                        onClick={() => navigate('/admin/products/add')}
                                                    >
                                                        + ADD PRODUCT
                                                    </button>
                                                </div>

                                                {/* Search products filter */}
                                                <div className="mb-4">
                                                    <input 
                                                        type="text" 
                                                        className="account-input" 
                                                        placeholder="Search products by title, category, or brand..." 
                                                        value={productSearch}
                                                        onChange={e => setProductSearch(e.target.value)}
                                                        style={{ height: '46px' }}
                                                    />
                                                </div>

                                                {/* Products inventory table */}
                                                <div className="table-responsive" style={{ border: '1px solid #eee', maxHeight: '550px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#fafafa' }}>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Image</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Title</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Category</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Price</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Stock</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredProducts.length > 0 ? (
                                                                filteredProducts.map(p => (
                                                                    <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                                                                        <td style={{ padding: '12px 16px' }}>
                                                                            <img src={p.image.startsWith('http') ? p.image : (p.image.startsWith('uploads/') ? `http://localhost:5000/${p.image}` : (p.image.startsWith('/') ? p.image : `/${p.image}`))} alt={p.title} style={{ height: '35px', width: '35px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #eee' }} />
                                                                        </td>
                                                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                                                                            <div>{p.title}</div>
                                                                            {p.brand && <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>{p.brand}</div>}
                                                                        </td>
                                                                        <td style={{ padding: '12px 16px', color: '#666' }}>{p.category}</td>
                                                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>₹{p.price}</td>
                                                                        <td style={{ padding: '12px 16px' }}>{p.inventoryCount}</td>
                                                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                                                                 <button 
                                                                                     onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                                                                                     style={{ 
                                                                                         backgroundColor: '#f5f5f5', 
                                                                                         border: '1px solid #ccc', 
                                                                                         color: '#111', 
                                                                                         cursor: 'pointer', 
                                                                                         fontWeight: 600, 
                                                                                         fontSize: '11px', 
                                                                                         padding: '6px 12px',
                                                                                         borderRadius: '2px',
                                                                                         transition: 'all 0.2s',
                                                                                         letterSpacing: '0.05em'
                                                                                     }}
                                                                                 >
                                                                                     EDIT
                                                                                 </button>
                                                                                 <button 
                                                                                     onClick={() => handleDeleteProduct(p._id)}
                                                                                     style={{ 
                                                                                         backgroundColor: '#fff5f5', 
                                                                                         border: '1px solid #fed7d7', 
                                                                                         color: '#e53e3e', 
                                                                                         cursor: 'pointer', 
                                                                                         fontWeight: 600, 
                                                                                         fontSize: '11px', 
                                                                                         padding: '6px 12px',
                                                                                         borderRadius: '2px',
                                                                                         transition: 'all 0.2s',
                                                                                         letterSpacing: '0.05em'
                                                                                     }}
                                                                                 >
                                                                                     DELETE
                                                                                 </button>
                                                                             </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>No products found matching your search.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* SCREEN 3: ORDERS MANAGEMENT */}
                                        {activeAdminTab === 'orders' && (
                                            <div>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Customer Orders</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Manage order fulfillment stages and shipping status updates.</p>
                                                </div>

                                                {/* Search orders filter */}
                                                <div className="mb-4">
                                                    <input 
                                                        type="text" 
                                                        className="account-input" 
                                                        placeholder="Search orders by Order ID, status, or user details..." 
                                                        value={orderSearch}
                                                        onChange={e => setOrderSearch(e.target.value)}
                                                        style={{ height: '46px' }}
                                                    />
                                                </div>

                                                {/* Orders list table */}
                                                <div className="table-responsive" style={{ border: '1px solid #eee', maxHeight: '550px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#fafafa' }}>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Order ID</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>User</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Total</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Status</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Details</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Update Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredOrders.length > 0 ? (
                                                                filteredOrders.map(o => (
                                                                    <React.Fragment key={o._id}>
                                                                        <tr style={{ borderBottom: '1px solid #eee' }}>
                                                                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 'bold' }}>#{o._id.substring(o._id.length - 8)}</td>
                                                                            <td style={{ padding: '12px 16px' }}>
                                                                                <div style={{ fontWeight: 500 }}>{o.userId?.name}</div>
                                                                                <div style={{ fontSize: '11px', color: '#888' }}>{o.userId?.email}</div>
                                                                            </td>
                                                                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>₹{o.total}</td>
                                                                            <td style={{ padding: '12px 16px' }}>
                                                                                <span className="status-badge" style={{ 
                                                                                    backgroundColor: o.status === 'Delivered' ? '#e6f4ea' : '#fff3cd', 
                                                                                    color: o.status === 'Delivered' ? '#137333' : '#b06000',
                                                                                    padding: '4px 10px', 
                                                                                    fontSize: '11px', 
                                                                                    fontWeight: 600,
                                                                                    borderRadius: '12px',
                                                                                    textTransform: 'uppercase',
                                                                                    letterSpacing: '0.02em'
                                                                                }}>
                                                                                    {o.status}
                                                                                </span>
                                                                            </td>
                                                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                                <button 
                                                                                    className="cart-secondary-btn" 
                                                                                    style={{ padding: '6px 12px', width: 'auto', fontSize: '11px', height: '30px', marginTop: 0 }}
                                                                                    onClick={() => setExpandedOrderId(expandedOrderId === o._id ? null : o._id)}
                                                                                >
                                                                                    {expandedOrderId === o._id ? 'Hide' : 'View'}
                                                                                </button>
                                                                            </td>
                                                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                                {o.status !== 'Delivered' ? (
                                                                                    <button 
                                                                                        className="checkout-btn" 
                                                                                        style={{ padding: '8px 16px', width: 'auto', fontSize: '11px' }}
                                                                                        onClick={() => handleUpdateStatus(o._id, o.status)}
                                                                                    >
                                                                                        Advance Status
                                                                                    </button>
                                                                                ) : (
                                                                                    <span style={{ color: '#137333', fontWeight: 600, fontSize: '12px' }}>Delivered ✓</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                        {expandedOrderId === o._id && (
                                                                            <tr style={{ backgroundColor: '#fdfdfd' }}>
                                                                                <td colSpan="6" style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}>
                                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '13px' }}>
                                                                                        {/* Left: Customer & Address details */}
                                                                                        <div style={{ borderRight: '1px solid #eee', paddingRight: '20px' }}>
                                                                                            <h4 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '12px' }}>
                                                                                                Delivery & Customer Information
                                                                                            </h4>
                                                                                            <div style={{ marginBottom: '8px' }}>
                                                                                                <span style={{ fontWeight: 600 }}>Recipient Name: </span>
                                                                                                <span>{o.address?.name || o.userId?.name}</span>
                                                                                            </div>
                                                                                            <div style={{ marginBottom: '8px' }}>
                                                                                                <span style={{ fontWeight: 600 }}>Contact Phone: </span>
                                                                                                <span style={{ color: '#000', fontWeight: 'bold' }}>{o.address?.phone || 'N/A'}</span>
                                                                                            </div>
                                                                                            <div style={{ marginBottom: '8px' }}>
                                                                                                <span style={{ fontWeight: 600 }}>Email Address: </span>
                                                                                                <span>{o.userId?.email}</span>
                                                                                            </div>
                                                                                            <div style={{ marginBottom: '12px', lineHeight: 1.4 }}>
                                                                                                <span style={{ fontWeight: 600 }}>Shipping Destination: </span>
                                                                                                <span>
                                                                                                    {o.address?.addressLine}, {o.address?.city}, {o.address?.state} - {o.address?.postalCode}
                                                                                                </span>
                                                                                            </div>
                                                                                            
                                                                                            {/* Google Maps link */}
                                                                                            {o.address?.latitude && o.address?.longitude ? (
                                                                                                <a 
                                                                                                    href={`https://www.google.com/maps/search/?api=1&query=${o.address.latitude},${o.address.longitude}`} 
                                                                                                    target="_blank" 
                                                                                                    rel="noopener noreferrer" 
                                                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2b6cb0', textDecoration: 'underline', fontWeight: 600, fontSize: '12px' }}
                                                                                                >
                                                                                                    📍 Open Pinpoint Location in Google Maps
                                                                                                </a>
                                                                                            ) : (
                                                                                                <a 
                                                                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address?.addressLine + ', ' + o.address?.city + ', ' + o.address?.state + ' ' + o.address?.postalCode)}`} 
                                                                                                    target="_blank" 
                                                                                                    rel="noopener noreferrer" 
                                                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2b6cb0', textDecoration: 'underline', fontWeight: 600, fontSize: '12px' }}
                                                                                                >
                                                                                                    📍 Search Location in Google Maps
                                                                                                </a>
                                                                                            )}
                                                                                        </div>
                                                                                        
                                                                                        {/* Right: Ordered Products List */}
                                                                                        <div>
                                                                                            <h4 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '12px' }}>
                                                                                                Ordered Items ({o.items?.length})
                                                                                            </h4>
                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                                                {o.items?.map((item, idx) => (
                                                                                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', paddingBottom: '8px', borderBottom: idx < o.items.length - 1 ? '1px dashed #eee' : 'none' }}>
                                                                                                        {item.image && (
                                                                                                            <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid #ddd' }} />
                                                                                                        )}
                                                                                                        <div style={{ flex: 1 }}>
                                                                                                            <div style={{ fontWeight: 500 }}>{item.title}</div>
                                                                                                            <div style={{ fontSize: '11px', color: '#666' }}>
                                                                                                                Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </React.Fragment>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>No customer orders found matching your search.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* SCREEN 4: PROMO COUPONS */}
                                        {activeAdminTab === 'coupons' && (
                                            <div>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Promo Coupons</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Create promotional discounts and view active coupons.</p>
                                                </div>

                                                {/* Add Promo Coupons form */}
                                                <form className="row g-3 align-items-end mb-4 p-4" onSubmit={handleAddCoupon} style={{ border: '1px solid #eee', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                                                    <div className="col-md-5">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Coupon Code</label>
                                                        <input type="text" className="account-input" placeholder="e.g. OFFER30" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} required style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Discount Value (%)</label>
                                                        <input type="number" className="account-input" placeholder="30" value={newCouponVal} onChange={e => setNewCouponVal(e.target.value)} required style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <button type="submit" className="checkout-btn w-100" style={{ padding: '15px 0', fontSize: '12px' }}>Create Coupon</button>
                                                    </div>
                                                </form>

                                                {/* Coupon List Table */}
                                                <h4 className="mt-4 mb-3" style={{ fontSize: '16px', fontWeight: 600 }}>Active Store Coupons</h4>
                                                <div className="table-responsive" style={{ border: '1px solid #eee', maxHeight: '350px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#fafafa' }}>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Coupon Code</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Discount Value</th>
                                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px', position: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>Expiry</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {adminCoupons.map(c => (
                                                                <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                                                                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#000' }}>{c.code}</td>
                                                                    <td style={{ padding: '12px 16px' }}>{c.discountValue}% Off</td>
                                                                    <td style={{ padding: '12px 16px', color: '#666' }}>{c.expiryDate}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* SCREEN 5-A: CONTENT SETTINGS - HOMEPAGE */}
                                        {activeAdminTab === 'content-home' && (
                                            <form onSubmit={handleSaveSettings}>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Homepage Hero Configurations</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Configure main banner tagline, headlines, and backdrop images.</p>
                                                </div>

                                                <div className="row g-3 mb-4">
                                                    <div className="col-md-4">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Hero Tagline</label>
                                                        <input type="text" className="account-input" value={editHeroTag} onChange={e => setEditHeroTag(e.target.value)} placeholder="e.g. [ Featured Collections ]" style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-8">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Hero Title (pre-formatted)</label>
                                                        <textarea className="account-input" value={editHeroTitle} onChange={e => setEditHeroTitle(e.target.value)} placeholder="Timeless Essentials&#10;for the Season" rows="2" style={{ resize: 'vertical' }}></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Hero Accent Subtitle</label>
                                                        <textarea className="account-input" value={editHeroSubtitle} onChange={e => setEditHeroSubtitle(e.target.value)} placeholder="Fresh Fits @26" rows="2" style={{ resize: 'vertical' }}></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Hero Background Image</label>
                                                        
                                                        {/* Image Source Selection Tabs */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setHeroImageType('url')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: heroImageType === 'url' ? '#000' : '#fff',
                                                                    color: heroImageType === 'url' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                IMAGE PATH/URL
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setHeroImageType('file')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: heroImageType === 'file' ? '#000' : '#fff',
                                                                    color: heroImageType === 'file' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                UPLOAD LOCAL FILE
                                                            </button>
                                                        </div>

                                                        {heroImageType === 'url' ? (
                                                            <input 
                                                                type="text" 
                                                                className="account-input" 
                                                                value={editHeroImage} 
                                                                onChange={e => setEditHeroImage(e.target.value)} 
                                                                placeholder="e.g. assets/home-hero-bg.png" 
                                                                style={{ height: '46px' }} 
                                                            />
                                                        ) : (
                                                            <input 
                                                                type="file" 
                                                                className="account-input" 
                                                                accept="image/*"
                                                                onChange={e => setHeroImageFile(e.target.files[0])} 
                                                                style={{ height: '46px', paddingTop: '10px' }} 
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                    <button type="submit" className="checkout-btn" style={{ padding: '16px 32px', width: 'auto', fontSize: '12px', fontWeight: 600 }}>
                                                        SAVE HOMEPAGE HERO
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* SCREEN 5-B: CONTENT SETTINGS - ABOUT US */}
                                        {activeAdminTab === 'content-about' && (
                                            <form onSubmit={handleSaveSettings}>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>About Us Page Content</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Configure company story headlines, vision content paragraphs, and hero backgrounds.</p>
                                                </div>

                                                <div className="row g-3 mb-4">
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>About Us Headline</label>
                                                        <input type="text" className="account-input" value={editAboutTitle} onChange={e => setEditAboutTitle(e.target.value)} style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Vision Paragraph 1</label>
                                                        <textarea className="account-input" value={editAboutContent} onChange={e => setEditAboutContent(e.target.value)} rows="4" style={{ resize: 'vertical', minHeight: '100px' }}></textarea>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Vision Paragraph 2</label>
                                                        <textarea className="account-input" value={editAboutSubContent} onChange={e => setEditAboutSubContent(e.target.value)} rows="4" style={{ resize: 'vertical', minHeight: '100px' }}></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>About Page Hero Image</label>
                                                        
                                                        {/* Image Source Selection Tabs */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setAboutHeroImageType('url')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: aboutHeroImageType === 'url' ? '#000' : '#fff',
                                                                    color: aboutHeroImageType === 'url' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                IMAGE PATH/URL
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setAboutHeroImageType('file')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: aboutHeroImageType === 'file' ? '#000' : '#fff',
                                                                    color: aboutHeroImageType === 'file' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                UPLOAD LOCAL FILE
                                                            </button>
                                                        </div>

                                                        {aboutHeroImageType === 'url' ? (
                                                            <input 
                                                                type="text" 
                                                                className="account-input" 
                                                                value={editAboutHeroImage} 
                                                                onChange={e => setEditAboutHeroImage(e.target.value)} 
                                                                placeholder="e.g. assets/about-hero-bg.png" 
                                                                style={{ height: '46px' }} 
                                                            />
                                                        ) : (
                                                            <input 
                                                                type="file" 
                                                                className="account-input" 
                                                                accept="image/*"
                                                                onChange={e => setAboutHeroImageFile(e.target.files[0])} 
                                                                style={{ height: '46px', paddingTop: '10px' }} 
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                    <button type="submit" className="checkout-btn" style={{ padding: '16px 32px', width: 'auto', fontSize: '12px', fontWeight: 600 }}>
                                                        SAVE ABOUT PAGE CONTENT
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* SCREEN 5-C: CONTENT SETTINGS - SHOP */}
                                        {activeAdminTab === 'content-shop' && (
                                            <form onSubmit={handleSaveSettings}>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Shop Page Configurations</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Configure shop page titles and hero background image banners.</p>
                                                </div>

                                                <div className="row g-3 mb-4">
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Shop Hero Banner Image</label>
                                                        
                                                        {/* Image Source Selection Tabs */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShopHeroImageType('url')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: shopHeroImageType === 'url' ? '#000' : '#fff',
                                                                    color: shopHeroImageType === 'url' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                IMAGE PATH/URL
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShopHeroImageType('file')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: shopHeroImageType === 'file' ? '#000' : '#fff',
                                                                    color: shopHeroImageType === 'file' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                UPLOAD LOCAL FILE
                                                            </button>
                                                        </div>

                                                        {shopHeroImageType === 'url' ? (
                                                            <input 
                                                                type="text" 
                                                                className="account-input" 
                                                                value={editShopHeroImage} 
                                                                onChange={e => setEditShopHeroImage(e.target.value)} 
                                                                placeholder="e.g. assets/shop-hero-bg.png" 
                                                                style={{ height: '46px' }} 
                                                            />
                                                        ) : (
                                                            <input 
                                                                type="file" 
                                                                className="account-input" 
                                                                accept="image/*"
                                                                onChange={e => setShopHeroImageFile(e.target.files[0])} 
                                                                style={{ height: '46px', paddingTop: '10px' }} 
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                    <button type="submit" className="checkout-btn" style={{ padding: '16px 32px', width: 'auto', fontSize: '12px', fontWeight: 600 }}>
                                                        SAVE SHOP CONFIG
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* SCREEN 5-D: CONTENT SETTINGS - ACCESSORIES */}
                                        {activeAdminTab === 'content-accessories' && (
                                            <form onSubmit={handleSaveSettings}>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Accessories Page Configurations</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Configure accessories page categories and background image banners.</p>
                                                </div>

                                                <div className="row g-3 mb-4">
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Accessories Hero Banner Image</label>
                                                        
                                                        {/* Image Source Selection Tabs */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setAccessoriesHeroImageType('url')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: accessoriesHeroImageType === 'url' ? '#000' : '#fff',
                                                                    color: accessoriesHeroImageType === 'url' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                IMAGE PATH/URL
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setAccessoriesHeroImageType('file')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: accessoriesHeroImageType === 'file' ? '#000' : '#fff',
                                                                    color: accessoriesHeroImageType === 'file' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                UPLOAD LOCAL FILE
                                                            </button>
                                                        </div>

                                                        {accessoriesHeroImageType === 'url' ? (
                                                            <input 
                                                                type="text" 
                                                                className="account-input" 
                                                                value={editAccessoriesHeroImage} 
                                                                onChange={e => setEditAccessoriesHeroImage(e.target.value)} 
                                                                placeholder="e.g. assets/accessories-hero-bg.png" 
                                                                style={{ height: '46px' }} 
                                                            />
                                                        ) : (
                                                            <input 
                                                                type="file" 
                                                                className="account-input" 
                                                                accept="image/*"
                                                                onChange={e => setAccessoriesHeroImageFile(e.target.files[0])} 
                                                                style={{ height: '46px', paddingTop: '10px' }} 
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                    <button type="submit" className="checkout-btn" style={{ padding: '16px 32px', width: 'auto', fontSize: '12px', fontWeight: 600 }}>
                                                        SAVE ACCESSORIES CONFIG
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* SCREEN 5-E: CONTENT SETTINGS - CONTACT & INFO */}
                                        {activeAdminTab === 'content-contact' && (
                                            <form onSubmit={handleSaveSettings}>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Contact & Help Info Configurations</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Configure helplines, support emails, headquarters location, social links, and contact hero banners.</p>
                                                </div>

                                                <div className="row g-3 mb-4">
                                                    <div className="col-md-6">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Support Email Address</label>
                                                        <input type="email" className="account-input" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)} style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Customer Helpline Phone</label>
                                                        <input type="text" className="account-input" value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)} style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Headquarters Location Address</label>
                                                        <input type="text" className="account-input" value={editContactAddress} onChange={e => setEditContactAddress(e.target.value)} style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Instagram URL</label>
                                                        <input type="text" className="account-input" value={editSocialInstagram} onChange={e => setEditSocialInstagram(e.target.value)} style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Twitter URL</label>
                                                        <input type="text" className="account-input" value={editSocialTwitter} onChange={e => setEditSocialTwitter(e.target.value)} style={{ height: '46px' }} />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contact Hero Banner Image</label>
                                                        
                                                        {/* Image Source Selection Tabs */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setContactHeroImageType('url')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: contactHeroImageType === 'url' ? '#000' : '#fff',
                                                                    color: contactHeroImageType === 'url' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                IMAGE PATH/URL
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setContactHeroImageType('file')}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    border: '1px solid #ccc',
                                                                    backgroundColor: contactHeroImageType === 'file' ? '#000' : '#fff',
                                                                    color: contactHeroImageType === 'file' ? '#fff' : '#000',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                UPLOAD LOCAL FILE
                                                            </button>
                                                        </div>

                                                        {contactHeroImageType === 'url' ? (
                                                            <input 
                                                                type="text" 
                                                                className="account-input" 
                                                                value={editContactHeroImage} 
                                                                onChange={e => setEditContactHeroImage(e.target.value)} 
                                                                placeholder="e.g. assets/contact-hero-bg.png" 
                                                                style={{ height: '46px' }} 
                                                            />
                                                        ) : (
                                                            <input 
                                                                type="file" 
                                                                className="account-input" 
                                                                accept="image/*"
                                                                onChange={e => setContactHeroImageFile(e.target.files[0])} 
                                                                style={{ height: '46px', paddingTop: '10px' }} 
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                    <button type="submit" className="checkout-btn" style={{ padding: '16px 32px', width: 'auto', fontSize: '12px', fontWeight: 600 }}>
                                                        SAVE CONTACT & INFO
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* SCREEN 5-F: CONTENT SETTINGS - POLICIES */}
                                        {activeAdminTab === 'content-policies' && (
                                            <form onSubmit={handleSaveSettings}>
                                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>Store Policies & Guidelines</h2>
                                                    <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Configure shipping, return details, privacy statements, and terms of use for your storefront footer pages.</p>
                                                </div>

                                                <div className="row g-3 mb-4">
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Shipping & Delivery Policy</label>
                                                        <textarea className="account-input" value={editPolicyShipping} onChange={e => setEditPolicyShipping(e.target.value)} rows="5" style={{ resize: 'vertical', minHeight: '120px' }} required></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Return & Exchange Policy</label>
                                                        <textarea className="account-input" value={editPolicyReturns} onChange={e => setEditPolicyReturns(e.target.value)} rows="5" style={{ resize: 'vertical', minHeight: '120px' }} required></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Privacy Policy Statement</label>
                                                        <textarea className="account-input" value={editPolicyPrivacy} onChange={e => setEditPolicyPrivacy(e.target.value)} rows="5" style={{ resize: 'vertical', minHeight: '120px' }} required></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Terms & Conditions of Service</label>
                                                        <textarea className="account-input" value={editPolicyTerms} onChange={e => setEditPolicyTerms(e.target.value)} rows="5" style={{ resize: 'vertical', minHeight: '120px' }} required></textarea>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #eee' }}>
                                                    <button type="submit" className="checkout-btn" style={{ padding: '16px 32px', width: 'auto', fontSize: '12px', fontWeight: 600 }}>
                                                        SAVE STORE POLICIES
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    );
};

export default AdminDashboard;
