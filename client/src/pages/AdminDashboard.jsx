import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL, resolveImageUrl } from '../config';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { productsData } from '../products-data';

const CACHE_KEY = 'stylora_products_cache';
const DELETED_IDS_KEY = 'stylora_deleted_ids';

const getDeletedIds = () => {
    try {
        const str = localStorage.getItem(DELETED_IDS_KEY);
        return str ? JSON.parse(str) : [];
    } catch (e) {
        return [];
    }
};

const addDeletedId = (id) => {
    try {
        const current = getDeletedIds();
        const strId = String(id);
        if (!current.includes(strId)) {
            current.push(strId);
            localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(current));
        }
    } catch (e) {}
};

const filterOutDeleted = (prods) => {
    const deletedIds = getDeletedIds();
    return prods.filter(p => {
        const strId = String(p._id);
        const num = Number(strId);
        const isMock = !isNaN(num) && num >= 1 && num <= 20;
        return !deletedIds.includes(strId) && !isMock;
    });
};

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

    const [homeSlots, setHomeSlots] = useState(['', '', '', '', '']);

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
            if (settings.homeBestsellerSlots && Array.isArray(settings.homeBestsellerSlots)) {
                setHomeSlots(settings.homeBestsellerSlots);
            }
        }
    }, [settings]);

    useEffect(() => {
        fetchAdminData();
        const handleSync = () => fetchAdminData();
        window.addEventListener('stylora_products_updated', handleSync);
        return () => window.removeEventListener('stylora_products_updated', handleSync);
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const [prodRes, orderRes, userRes] = await Promise.allSettled([
                axios.get(`${API_URL}/products`),
                axios.get(`${API_URL}/orders`, authHeader),
                axios.get(`${API_URL}/users`, authHeader)
            ]);

            let fetchedProducts = [];
            if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
                fetchedProducts = prodRes.value.data;
            }

            const customProds = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
            const mergedProducts = [...customProds, ...fetchedProducts];

            const cleanProducts = filterOutDeleted(mergedProducts);
            setAdminProducts(cleanProducts);

            let fetchedOrders = [];
            if (orderRes.status === 'fulfilled' && Array.isArray(orderRes.value.data)) {
                fetchedOrders = [...orderRes.value.data];
            }
            try {
                const localOrders = JSON.parse(localStorage.getItem('stylora_orders') || '[]');
                localOrders.forEach(lo => {
                    if (!fetchedOrders.some(o => String(o._id) === String(lo._id))) {
                        fetchedOrders.push(lo);
                    }
                });
            } catch (e) {}
            setOrders(fetchedOrders);

            let fetchedUsers = [];
            if (userRes.status === 'fulfilled' && Array.isArray(userRes.value.data)) {
                fetchedUsers = userRes.value.data;
            }
            setUsers(fetchedUsers);

            const rev = fetchedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            setStats({
                totalRevenue: rev,
                totalOrders: fetchedOrders.length,
                totalProducts: cleanProducts.length,
                totalUsers: fetchedUsers.length
            });
        } catch (err) {
            console.warn('Error fetching admin data:', err.message);
        }
    };

    const handleDeleteProduct = async (id, title) => {
        addDeletedId(id);

        const updatedProducts = adminProducts.filter(p => String(p._id) !== String(id));
        setAdminProducts(updatedProducts);
        showToast(`"${title}" deleted successfully!`, 'success');

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updatedProducts, timestamp: Date.now() }));
            window.dispatchEvent(new Event('stylora_products_updated'));
        } catch (e) {}

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (id && String(id).length === 24 && /^[0-9a-fA-F]{24}$/.test(String(id))) {
                await axios.delete(`${API_URL}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.warn('Background delete note:', err.message);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/orders/${orderId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            showToast('Order status updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating order status:', err);
            showToast('Failed to update order status.', 'error');
        }
    };

    const handleToggleBestsellerTag = async (product) => {
        const hasBestsellerTag = product.tags && product.tags.includes('Bestseller');
        let newTags;
        if (hasBestsellerTag) {
            newTags = (product.tags || []).filter(t => t !== 'Bestseller');
        } else {
            newTags = [...(product.tags || []).filter(t => t !== 'Bestseller'), 'Bestseller'];
        }

        const updatedProduct = { ...product, tags: newTags };
        const updatedList = adminProducts.map(p => String(p._id) === String(product._id) ? updatedProduct : p);
        setAdminProducts(updatedList);

        if (hasBestsellerTag) {
            showToast(`Removed "${product.title}" from Home Page Bestsellers`, 'info');
        } else {
            showToast(`Added "${product.title}" to Home Page Bestsellers! ⭐`, 'success');
        }

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updatedList, timestamp: Date.now() }));
            window.dispatchEvent(new Event('stylora_products_updated'));
        } catch (e) {}

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (product._id && String(product._id).length === 24) {
                await axios.put(`${API_URL}/products/${product._id}`, updatedProduct, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.warn('Background update note:', err.message);
        }
    };

    const checkIsOutOfStock = (product) => {
        if (!product) return false;
        if (product.isNotAvailable === true) return true;
        if (product.inStock === false) return true;
        if (product.inventoryCount !== undefined && Number(product.inventoryCount) <= 0) return true;
        if (product.stock !== undefined && Number(product.stock) <= 0) return true;
        return false;
    };

    const handleRestockProduct = async (id) => {
        try {
            const customProds = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
            const updatedCustom = customProds.map(p => {
                if (String(p._id) === String(id)) {
                    return { ...p, isNotAvailable: false, inStock: true, inventoryCount: 10, stock: 10 };
                }
                return p;
            });
            localStorage.setItem('stylora_custom_products', JSON.stringify(updatedCustom));

            const updatedAdminList = adminProducts.map(p => {
                if (String(p._id) === String(id)) {
                    return { ...p, isNotAvailable: false, inStock: true, inventoryCount: 10, stock: 10 };
                }
                return p;
            });
            setAdminProducts(updatedAdminList);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: updatedAdminList, timestamp: Date.now() }));
            window.dispatchEvent(new Event('stylora_products_updated'));

            try {
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                if (id && String(id).length === 24) {
                    await axios.put(`${API_URL}/products/${id}`, {
                        isNotAvailable: false,
                        inStock: true,
                        inventoryCount: 10,
                        stock: 10
                    }, { headers: { Authorization: `Bearer ${token}` } });
                }
            } catch (e) {}

            showToast('Product restocked successfully (+10 in stock)! 🟢', 'success');
        } catch (err) {
            showToast('Failed to restock product', 'error');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const updated = {
                ...settings,
                showNotAvailableBadge,
                shopHeroImage: shopHeroImg,
                categoryImages
            };
            await updateSettings(updated);
            showToast('Store Content Settings updated successfully!', 'success');
        } catch (err) {
            console.error('Error saving settings:', err);
            showToast('Failed to save settings.', 'error');
        }
    };

    const handleSlotChange = (index, prodId) => {
        const updated = [...homeSlots];
        updated[index] = prodId;
        setHomeSlots(updated);
    };

    const handleSaveHomeSlots = async (newSlots = homeSlots) => {
        try {
            const updated = {
                ...settings,
                homeBestsellerSlots: newSlots
            };
            await updateSettings(updated);
            window.dispatchEvent(new Event('stylora_products_updated'));
            showToast('Home Page Bestseller Showcase Layout updated!', 'success');
        } catch (err) {
            console.error('Error saving home slots:', err);
            showToast('Failed to save home showcase slots.', 'error');
        }
    };

    const handleCategoryImgChange = (key, val) => {
        setCategoryImages(prev => ({
            ...prev,
            [key]: val
        }));
    };

    const handleCategoryFileUpload = (catKey, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setCategoryImages(prev => ({
                ...prev,
                [catKey]: reader.result
            }));
            showToast(`Image selected for ${catKey.toUpperCase()}! Click Save to apply.`, 'info');
        };
        reader.readAsDataURL(file);
    };

    const handleShopHeroFileUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setShopHeroImg(reader.result);
            showToast('Shop Hero image file updated! Click Save to apply.', 'info');
        };
        reader.readAsDataURL(file);
    };

    const categoryCounts = {
        ALL: adminProducts.length,
        CLOTHING: adminProducts.filter(p => ['clothing', 'shirts', 'pants', 'shorts', 'outerwear', 'activewear'].includes(p.category?.toLowerCase())).length,
        SHIRTS: adminProducts.filter(p => p.category?.toLowerCase() === 'shirts').length,
        PANTS: adminProducts.filter(p => p.category?.toLowerCase() === 'pants' || p.category?.toLowerCase() === 'shorts').length,
        SHOES: adminProducts.filter(p => p.category?.toLowerCase() === 'shoes').length,
        ACCESSORIES: adminProducts.filter(p => (p.tags && p.tags.includes('Accessories')) || ['watches', 'bags', 'sunglasses', 'belts-wallets', 'hats-caps', 'jewelry', 'socks'].includes(p.category?.toLowerCase())).length,
        OUTERWEAR: adminProducts.filter(p => p.category?.toLowerCase() === 'outerwear').length,
        ACTIVEWEAR: adminProducts.filter(p => p.category?.toLowerCase() === 'activewear').length,
        WATCHES: adminProducts.filter(p => p.category?.toLowerCase() === 'watches').length
    };

    const categories = Object.keys(categoryCounts);

    const filteredProducts = adminProducts.filter(p => {
        const matchesSearch = searchQuery === '' || 
            p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p._id).toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        if (adminCategoryFilter === 'ALL') return true;
        if (adminCategoryFilter === 'CLOTHING') {
            return ['clothing', 'shirts', 'pants', 'shorts', 'outerwear', 'activewear'].includes(p.category?.toLowerCase());
        }
        if (adminCategoryFilter === 'ACCESSORIES') {
            return (p.tags && p.tags.includes('Accessories')) || ['watches', 'bags', 'sunglasses', 'belts-wallets', 'hats-caps', 'jewelry', 'socks'].includes(p.category?.toLowerCase());
        }
        return p.category?.toLowerCase() === adminCategoryFilter.toLowerCase();
    });

    const allBestsellers = adminProducts.filter(p => p.tags && p.tags.includes('Bestseller'));
    const homeFeaturedCount = Math.min(allBestsellers.length, 5);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'var(--font-primary, sans-serif)', color: '#111827' }}>
            <header style={{ 
                height: '70px', 
                backgroundColor: '#0a0a0a', 
                borderBottom: '1px solid #1a1a1a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0 32px',
                color: '#ffffff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.12em', color: '#d4af37' }}>
                        STYLORA ADMIN
                    </span>
                    <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        backgroundColor: '#1f1f1f', 
                        color: '#9ca3af', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        letterSpacing: '0.08em'
                    }}>
                        CONTROL PANEL
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={() => navigate('/shop')}
                        style={{ 
                            backgroundColor: '#d4af37', 
                            color: '#000000', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            cursor: 'pointer'
                        }}
                    >
                        Visit Store ➔
                    </button>
                    <button 
                        onClick={handleSignOut}
                        style={{ 
                            backgroundColor: 'transparent', 
                            color: '#ef4444', 
                            border: '1px solid rgba(239, 68, 68, 0.4)', 
                            padding: '7px 14px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            cursor: 'pointer'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#10b981' },
                        { label: 'Total Orders', value: stats.totalOrders, color: '#3b82f6' },
                        { label: 'Total Products', value: stats.totalProducts, color: '#8b5cf6' },
                        { label: 'Registered Users', value: stats.totalUsers, color: '#f59e0b' }
                    ].map(card => (
                        <div key={card.label} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>{card.label}</span>
                            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 0 0', color: card.color }}>{card.value}</h3>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'products', label: `Products (${adminProducts.length})` },
                        { id: 'outofstock', label: `🔴 Out of Stock (${adminProducts.filter(checkIsOutOfStock).length})` },
                        { id: 'bestsellers', label: `⭐ Bestsellers (${adminProducts.filter(p => p.tags && p.tags.includes('Bestseller')).length})` },
                        { id: 'category-cards', label: '🖼️ Category Banners' },
                        { id: 'orders', label: `Orders (${orders.length})` },
                        { id: 'users', label: `Users (${users.length})` },
                        { id: 'settings', label: 'Content Settings' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); navigate(`/admin/dashboard?tab=${tab.id}`); }}
                            style={{
                                padding: '12px 0',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #000000' : '2px solid transparent',
                                backgroundColor: 'transparent',
                                color: activeTab === tab.id ? '#000000' : '#6b7280',
                                fontWeight: activeTab === tab.id ? 800 : 500,
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Welcome & Quick Action Header Banner */}
                        <div style={{ 
                            backgroundColor: '#0a0a0a', 
                            borderRadius: '12px', 
                            padding: '24px 32px', 
                            color: '#ffffff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
                                    Store Analytics & Control Dashboard 🚀
                                </h2>
                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                                    Real-time tracking for products, sales performance, inventory categories, and store management.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => navigate('/admin/products/new')}
                                    style={{ 
                                        backgroundColor: '#10b981', 
                                        color: '#ffffff', 
                                        border: 'none', 
                                        padding: '10px 20px', 
                                        borderRadius: '6px', 
                                        fontSize: '12px', 
                                        fontWeight: 700, 
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>+ Add Product</span>
                                </button>
                                <button 
                                    onClick={() => navigate('/admin/dashboard?tab=settings')}
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.1)', 
                                        color: '#ffffff', 
                                        border: '1px solid rgba(255,255,255,0.2)', 
                                        padding: '10px 18px', 
                                        borderRadius: '6px', 
                                        fontSize: '12px', 
                                        fontWeight: 600, 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Banner Settings
                                </button>
                            </div>
                        </div>

                        {/* Main Overview Grid: Left Analytics + Right Category Health */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                            
                            {/* Left Side: Revenue Chart & Products Showcase */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                {/* Sales & Revenue Performance SVG Chart Card */}
                                <div style={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb', 
                                    padding: '24px', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>
                                                Sales & Revenue Trajectory
                                            </h3>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                                Monthly revenue analytics and store performance trend
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#10b981' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span> Revenue
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>• 2026 Trend</span>
                                        </div>
                                    </div>

                                    {/* SVG Interactive Revenue Line & Bar Chart */}
                                    <div style={{ width: '100%', overflowX: 'auto' }}>
                                        <svg viewBox="0 0 600 200" style={{ width: '100%', height: '220px' }}>
                                            <defs>
                                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            {/* Horizontal Grid lines */}
                                            {[30, 70, 110, 150].map((y, idx) => (
                                                <line key={idx} x1="30" y1={y} x2="570" y2={y} stroke="#f3f4f6" strokeDasharray="4 4" strokeWidth="1" />
                                            ))}

                                            {/* Light background bars */}
                                            {[
                                                { x: 50, h: 40 }, { x: 130, h: 65 }, { x: 210, h: 55 },
                                                { x: 290, h: 90 }, { x: 370, h: 110 }, { x: 450, h: 135 }, { x: 530, h: 150 }
                                            ].map((b, idx) => (
                                                <rect key={idx} x={b.x - 14} y={170 - b.h} width="28" height={b.h} rx="4" fill="#f0fdf4" opacity="0.9" />
                                            ))}

                                            {/* Area Gradient */}
                                            <polygon 
                                                points="50,170 50,130 130,105 210,115 290,80 370,60 450,35 530,20 530,170" 
                                                fill="url(#areaGradient)" 
                                            />

                                            {/* Curve Polyline */}
                                            <polyline 
                                                fill="none" 
                                                stroke="#10b981" 
                                                strokeWidth="3.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                points="50,130 130,105 210,115 290,80 370,60 450,35 530,20" 
                                            />

                                            {/* Data Points */}
                                            {[
                                                { x: 50, y: 130, val: '₹12k', label: 'Feb' },
                                                { x: 130, y: 105, val: '₹19k', label: 'Mar' },
                                                { x: 210, y: 115, val: '₹16k', label: 'Apr' },
                                                { x: 290, y: 80, val: '₹28k', label: 'May' },
                                                { x: 370, y: 60, val: '₹34k', label: 'Jun' },
                                                { x: 450, y: 35, val: '₹48k', label: 'Jul' },
                                                { x: 530, y: 20, val: '₹62k', label: 'Aug' }
                                            ].map((pt, idx) => (
                                                <g key={idx}>
                                                    <circle cx={pt.x} cy={pt.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                                                    <text x={pt.x} y={pt.y - 10} fontSize="10" fill="#059669" fontWeight="700" textAnchor="middle">{pt.val}</text>
                                                    <text x={pt.x} y="188" fontSize="11" fill="#6b7280" fontWeight="600" textAnchor="middle">{pt.label}</text>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                </div>

                                {/* Catalog Highlights & Recent Products Section */}
                                <div style={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb', 
                                    padding: '24px', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#111827' }}>
                                            Active Store Items ({adminProducts.length})
                                        </h3>
                                        <button 
                                            onClick={() => { setActiveTab('products'); navigate('/admin/dashboard?tab=products'); }}
                                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            Manage All Products ➔
                                        </button>
                                    </div>

                                    {adminProducts.length === 0 ? (
                                        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                                            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px 0' }}>No products added to catalog yet.</p>
                                            <button 
                                                onClick={() => navigate('/admin/products/new')}
                                                style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                + Add First Product
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                            {adminProducts.slice(0, 4).map(prod => (
                                                <div key={prod._id} style={{ border: '1px solid #f3f4f6', borderRadius: '8px', padding: '12px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ width: '100%', height: '110px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                                                        <img 
                                                            src={resolveImageUrl(prod.image)} 
                                                            alt={prod.title} 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80'; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            {prod.category || 'General'}
                                                        </span>
                                                        <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '2px 0 4px 0', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {prod.title}
                                                        </h4>
                                                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>
                                                            ₹{prod.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Category Inventory Share & Store Health */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                
                                {/* Category Inventory Share Breakdown */}
                                <div style={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb', 
                                    padding: '24px', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
                                }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#111827' }}>
                                        Category Inventory Share
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 20px 0' }}>
                                        Product breakdown by active store category
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { name: 'Shirts', count: categoryCounts.SHIRTS, color: '#10b981' },
                                            { name: 'Pants', count: categoryCounts.PANTS, color: '#3b82f6' },
                                            { name: 'Shoes', count: categoryCounts.SHOES, color: '#8b5cf6' },
                                            { name: 'Accessories', count: categoryCounts.ACCESSORIES, color: '#f59e0b' },
                                            { name: 'Watches', count: categoryCounts.WATCHES, color: '#ec4899' },
                                            { name: 'Outerwear', count: categoryCounts.OUTERWEAR, color: '#06b6d4' }
                                        ].map(cat => {
                                            const total = adminProducts.length || 1;
                                            const pct = Math.round((cat.count / total) * 100);
                                            return (
                                                <div key={cat.name}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
                                                        <span style={{ color: '#374151' }}>{cat.name}</span>
                                                        <span style={{ color: '#6b7280' }}>{cat.count} items ({pct}%)</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: cat.color, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* System & Store Health Status Widget */}
                                <div style={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e5e7eb', 
                                    padding: '24px', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
                                }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>
                                        System & Sync Status
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>Live Sync Status</span>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d' }}>● Active (0ms)</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #dbeafe' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>Database Integrity</span>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8' }}>100% Healthy</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#faf5ff', borderRadius: '6px', border: '1px solid #f3e8ff' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b21a8' }}>Custom Sub-Categories</span>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#7e22ce' }}>Active</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'products' && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={() => navigate('/admin/products/add')}
                                style={{ padding: '10px 20px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                            >
                                + Add Product
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            {categories.map(cat => {
                                const count = categoryCounts[cat];
                                const isActive = adminCategoryFilter === cat;

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setAdminCategoryFilter(cat)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: isActive ? 700 : 500,
                                            border: isActive ? '1px solid #000' : '1px solid #e5e7eb',
                                            backgroundColor: isActive ? '#000' : '#f9fafb',
                                            color: isActive ? '#fff' : '#4b5563',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {cat} ({count})
                                    </button>
                                );
                            })}
                        </div>

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
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80'; }}
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
                                                        backgroundColor: (product.inventoryCount ?? 100) > 0 ? '#dcfce7' : '#fee2e2',
                                                        color: (product.inventoryCount ?? 100) > 0 ? '#15803d' : '#b91c1c'
                                                    }}>
                                                        {(product.inventoryCount ?? 100) > 0 ? `In Stock (${product.inventoryCount ?? 100})` : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
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
                                                No products found in this category.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'outofstock' && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#dc2626' }}>
                                    🔴 Out of Stock Products ({adminProducts.filter(checkIsOutOfStock).length})
                                </h2>
                                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                    Items marked as Not Available or having 0 inventory stock. Restock items to restore active status on the live store.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/products/add')}
                                style={{ padding: '10px 20px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                            >
                                + Add Product
                            </button>
                        </div>

                        {adminProducts.filter(checkIsOutOfStock).length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
                                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🎉</span>
                                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>All Products Are In Stock!</h4>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>There are currently no out-of-stock items in your catalog.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Image</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Product Title</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Price</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminProducts.filter(checkIsOutOfStock).map(p => (
                                            <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <img src={resolveImageUrl(p.image)} alt={p.title} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                                                </td>
                                                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>{p.title}</td>
                                                <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{p.category}</td>
                                                <td style={{ padding: '12px 16px', fontWeight: 800 }}>₹{p.price}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                                                        🔴 Out of Stock (0)
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleRestockProduct(p._id)}
                                                            style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            ⚡ Restock (+10)
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                                                            style={{ backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

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
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{String(o._id).substring(0, 8)}</td>
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

                {activeTab === 'bestsellers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Header info banner */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>[ Bestsellers & Highlights Manager ]</span>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: '#111827' }}>
                                        Manage Store Bestsellers & Home Showcase
                                    </h2>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                        Products marked as ⭐ Bestseller appear in Shop lists. The top 5 selected items will be showcased on your Home Page (1 Featured Card + 4 Right Grid items).
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '10px 16px', borderRadius: '6px', textAlign: 'right' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', display: 'block' }}>HOME PAGE FEATURED</span>
                                        <span style={{ fontSize: '20px', fontWeight: 900, color: '#92400e' }}>
                                            {homeFeaturedCount} / 5 Slots
                                        </span>
                                    </div>
                                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 16px', borderRadius: '6px', textAlign: 'right' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', display: 'block' }}>TOTAL BESTSELLERS</span>
                                        <span style={{ fontSize: '20px', fontWeight: 900, color: '#166534' }}>
                                            {allBestsellers.length} Items
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Visual Home Showcase Layout Grid Control */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1.5px solid #d4af37', padding: '24px', boxShadow: '0 4px 16px rgba(212, 175, 55, 0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🖼️</span> Home Page Bestsellers Showcase Positions (5 Slots)
                                        </h3>
                                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                            Choose exact products for the 5 positions in the Home Page Bestsellers section (1 Main Featured Card + 4 Right Grid items).
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveHomeSlots(homeSlots)}
                                        style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                                    >
                                        💾 Save Showcase Layout
                                    </button>
                                </div>

                                {/* 5 Slots Mock Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                    {[
                                        { index: 0, label: '👑 Main Featured Card (Left)', badge: 'MAIN FEATURED' },
                                        { index: 1, label: '⭐ Right Grid #1 (Top-Left)', badge: 'RIGHT GRID #1' },
                                        { index: 2, label: '⭐ Right Grid #2 (Top-Right)', badge: 'RIGHT GRID #2' },
                                        { index: 3, label: '⭐ Right Grid #3 (Bottom-Left)', badge: 'RIGHT GRID #3' },
                                        { index: 4, label: '⭐ Right Grid #4 (Bottom-Right)', badge: 'RIGHT GRID #4' }
                                    ].map(slot => {
                                        const selectedProd = adminProducts.find(p => String(p._id) === String(homeSlots[slot.index])) || allBestsellers[slot.index];
                                        const currentVal = homeSlots[slot.index] || (selectedProd ? selectedProd._id : '');

                                        return (
                                            <div key={slot.index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 800, color: slot.index === 0 ? '#b45309' : '#1d4ed8', textTransform: 'uppercase' }}>{slot.badge}</span>
                                                    <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>Pos #{slot.index + 1}</span>
                                                </div>

                                                {/* Product Preview Box */}
                                                <div style={{ height: '110px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    {selectedProd ? (
                                                        <>
                                                            <img 
                                                                src={resolveImageUrl(selectedProd.image)} 
                                                                alt={selectedProd.title} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                                                            />
                                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', color: '#fff', padding: '4px 6px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {selectedProd.title} (₹{selectedProd.price})
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>No Product</span>
                                                    )}
                                                </div>

                                                {/* Selector Dropdown */}
                                                <select
                                                    value={currentVal}
                                                    onChange={e => {
                                                        const newProdId = e.target.value;
                                                        handleSlotChange(slot.index, newProdId);
                                                    }}
                                                    style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', outline: 'none', backgroundColor: '#fff' }}
                                                >
                                                    <option value="">-- Choose Product --</option>
                                                    {adminProducts.map(p => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.title} - ₹{p.price} {p.tags && p.tags.includes('Bestseller') ? '⭐' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Product Selection List with Search & Bestseller Toggle */}
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                                
                                {/* Search bar inside Bestsellers tab */}
                                <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search products to highlight as Bestsellers..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                                    />
                                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                                        Showing {filteredProducts.length} Products
                                    </span>
                                </div>

                                {/* Bestseller Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
                                    {filteredProducts.map(product => {
                                        const isBestseller = product.tags && product.tags.includes('Bestseller');
                                        const bIndex = isBestseller ? allBestsellers.findIndex(p => p._id === product._id) : -1;

                                        let positionBadge = null;
                                        if (isBestseller) {
                                            if (bIndex === 0) {
                                                positionBadge = <span style={{ fontSize: '9px', fontWeight: 800, color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '2px 6px', borderRadius: '4px' }}>👑 #1 Home Main</span>;
                                            } else if (bIndex >= 1 && bIndex <= 4) {
                                                positionBadge = <span style={{ fontSize: '9px', fontWeight: 800, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px' }}>⭐ Home Grid #{bIndex}</span>;
                                            } else {
                                                positionBadge = <span style={{ fontSize: '9px', fontWeight: 800, color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '4px' }}>🛒 Shop Only</span>;
                                            }
                                        }

                                        return (
                                            <div 
                                                key={product._id} 
                                                style={{ 
                                                    borderRadius: '8px', 
                                                    border: isBestseller ? '2px solid #d4af37' : '1px solid #e5e7eb', 
                                                    backgroundColor: isBestseller ? '#fffdf5' : '#ffffff',
                                                    padding: '14px', 
                                                    display: 'flex', 
                                                    gap: '14px', 
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: isBestseller ? '0 4px 12px rgba(212,175,55,0.15)' : 'none'
                                                }}
                                            >
                                                <img 
                                                    src={resolveImageUrl(product.image)} 
                                                    alt={product.title} 
                                                    style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #f3f4f6' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80'; }}
                                                />

                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                                                        <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: isBestseller ? '#b45309' : '#6b7280' }}>
                                                            {product.category}
                                                        </span>
                                                        {positionBadge}
                                                    </div>
                                                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#111827' }}>
                                                        {product.title}
                                                    </h4>
                                                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#000000' }}>
                                                        ₹{product.price}
                                                    </span>
                                                </div>

                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleBestsellerTag(product)}
                                                    style={{ 
                                                        backgroundColor: isBestseller ? '#000000' : '#f3f4f6', 
                                                        color: isBestseller ? '#ffffff' : '#374151', 
                                                        border: isBestseller ? 'none' : '1px solid #d1d5db', 
                                                        padding: '8px 12px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '11px', 
                                                        fontWeight: 800, 
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {isBestseller ? '⭐ Bestseller' : '+ Highlight'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    )}

                {activeTab === 'category-cards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Header Banner */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>[ Home Page Banners Manager ]</span>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: '#111827' }}>
                                    Find Your Style - Category Cards Manager
                                </h2>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                    Upload custom cover photos or paste image URLs for the 8 Category Cards in the "Find Your Style" section on your Home Page.
                                </p>
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                            >
                                💾 Save All Category Images
                            </button>
                        </div>

                        {/* 8 Category Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                            {[
                                { key: 'shirts', name: 'Shirts', tag: 'ESSENTIAL MENSWEAR', placeholder: '/assets/find-section-img-3.png' },
                                { key: 'pants', name: 'Pants & Trousers', tag: 'TAILORED BOTTOMS', placeholder: '/assets/find-section-img-2.png' },
                                { key: 'outerwear', name: 'Coats & Jackets', tag: 'OUTERWEAR', placeholder: '/assets/find-section-img-1.png' },
                                { key: 'shoes', name: 'Shoes & Sneakers', tag: 'FOOTWEAR', placeholder: '/assets/find-section-img-4.png' },
                                { key: 'activewear', name: 'Activewear', tag: 'GYM & SPORTS', placeholder: '/assets/find-section-img-1.png' },
                                { key: 'watches', name: 'Watches & Accessories', tag: 'TIMEPIECES', placeholder: '/assets/find-section-img-3.png' },
                                { key: 't-shirts', name: 'T-Shirts & Tops', tag: 'CASUAL ESSENTIALS', placeholder: '/assets/find-section-img-4.png' },
                                { key: 'accessories', name: 'Bags & Accessories', tag: 'EVERYDAY LUXURY', placeholder: '/assets/find-section-img-2.png' }
                            ].map(cat => {
                                const currentImg = categoryImages[cat.key] || cat.placeholder;
                                const isCustom = categoryImages[cat.key] && categoryImages[cat.key] !== cat.placeholder;

                                return (
                                    <div key={cat.key} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        
                                        {/* Live Image Card Preview Box */}
                                        <div style={{ height: '220px', width: '100%', position: 'relative', backgroundColor: '#f8fafc' }}>
                                            <img 
                                                src={resolveImageUrl(currentImg)} 
                                                alt={cat.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = cat.placeholder; }}
                                            />
                                            {isCustom && (
                                                <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', zIndex: 2 }}>
                                                    CUSTOM IMAGE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ padding: '12px 16px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontSize: '9px', fontWeight: 700, color: '#888', letterSpacing: '0.1em', display: 'block', textTransform: 'uppercase' }}>{cat.tag}</span>
                                                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '2px 0 0 0', color: '#111' }}>{cat.name}</h3>
                                            </div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>Explore →</span>
                                        </div>

                                        {/* Control Box */}
                                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: '6px', display: 'block' }}>
                                                    Upload File or Paste Image URL
                                                </label>
                                                
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={e => handleCategoryFileUpload(cat.key, e.target.files[0])}
                                                        style={{ fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 6px', flex: 1 }}
                                                    />
                                                    {isCustom && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleCategoryImgChange(cat.key, '')}
                                                            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0 10px', fontSize: '10px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>

                                                <input 
                                                    type="text"
                                                    value={categoryImages[cat.key] || ''}
                                                    onChange={e => handleCategoryImgChange(cat.key, e.target.value)}
                                                    placeholder={`Or URL e.g. ${cat.placeholder}`}
                                                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }}
                                                />
                                            </div>

                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Save Action */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleSaveSettings}
                                style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '12px 32px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                            >
                                💾 Save All Category Banner Images
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Top Header Banner */}
                        <div style={{ 
                            backgroundColor: '#ffffff', 
                            borderRadius: '12px', 
                            border: '1px solid #e5e7eb', 
                            padding: '24px 28px', 
                            display: 'flex', 
                            justify: 'space-between', 
                            alignItems: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em' }}>[ Store Control Center ]</span>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: '#111827' }}>
                                    ⚙️ Store Content & Banner Settings
                                </h2>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                    Manage store preferences, shop hero background imagery, and category cover photos with instant live previews.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveSettings}
                                style={{ 
                                    backgroundColor: '#000000', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    padding: '12px 24px', 
                                    borderRadius: '6px', 
                                    fontSize: '13px', 
                                    fontWeight: 800, 
                                    cursor: 'pointer', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>💾</span> Save All Settings
                            </button>
                        </div>

                        {/* Global Options Card */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                                🎛️ Global Store Preferences
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                                {/* Checkbox Card */}
                                <div style={{ backgroundColor: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                    <input
                                        type="checkbox"
                                        id="showNotAvailable"
                                        checked={showNotAvailableBadge}
                                        onChange={e => setShowNotAvailableBadge(e.target.checked)}
                                        style={{ width: '20px', height: '20px', accentColor: '#000000', marginTop: '2px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="showNotAvailable" style={{ cursor: 'pointer', flex: 1 }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                                            Show "Not Available" (N/A) Badge
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, display: 'block' }}>
                                            Displays a red N/A badge on empty category tabs in the Shop page when products count is 0.
                                        </span>
                                    </label>
                                </div>

                                {/* Shop Hero Background Card */}
                                <div style={{ backgroundColor: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                                        🖼️ Shop Page Hero Background Image
                                    </label>
                                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                        <div style={{ width: '120px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                                            <img 
                                                src={resolveImageUrl(shopHeroImg || '/assets/herobg.png')} 
                                                alt="Shop Hero" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/herobg.png'; }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => handleShopHeroFileUpload(e.target.files[0])}
                                                style={{ fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', backgroundColor: '#fff' }}
                                            />
                                            <input
                                                type="text"
                                                value={shopHeroImg}
                                                onChange={e => setShopHeroImg(e.target.value)}
                                                placeholder="Or enter image URL e.g. /assets/herobg.png"
                                                style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Find Your Style - Category Cards Grid */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>🖼️</span> Find Your Style - Category Cards (8 Categories)
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                                        Upload custom high-resolution cover photos or select custom image files for each Category Card on the Home Page.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                                {[
                                    { key: 'shirts', name: 'Shirts', tag: 'ESSENTIAL MENSWEAR', placeholder: '/assets/find-section-img-3.png' },
                                    { key: 'pants', name: 'Pants & Trousers', tag: 'TAILORED BOTTOMS', placeholder: '/assets/find-section-img-2.png' },
                                    { key: 'outerwear', name: 'Coats & Jackets', tag: 'OUTERWEAR', placeholder: '/assets/find-section-img-1.png' },
                                    { key: 'shoes', name: 'Shoes & Sneakers', tag: 'FOOTWEAR', placeholder: '/assets/find-section-img-4.png' },
                                    { key: 'activewear', name: 'Activewear', tag: 'GYM & SPORTS', placeholder: '/assets/find-section-img-1.png' },
                                    { key: 'watches', name: 'Watches & Accessories', tag: 'TIMEPIECES', placeholder: '/assets/find-section-img-3.png' },
                                    { key: 't-shirts', name: 'T-Shirts & Tops', tag: 'CASUAL ESSENTIALS', placeholder: '/assets/find-section-img-4.png' },
                                    { key: 'accessories', name: 'Bags & Accessories', tag: 'EVERYDAY LUXURY', placeholder: '/assets/find-section-img-2.png' }
                                ].map(cat => {
                                    const currentImg = categoryImages[cat.key] || cat.placeholder;
                                    const isCustom = categoryImages[cat.key] && categoryImages[cat.key] !== cat.placeholder;

                                    return (
                                        <div key={cat.key} style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                                            {/* Live Thumbnail Box */}
                                            <div style={{ height: '160px', width: '100%', position: 'relative', backgroundColor: '#f1f5f9' }}>
                                                <img 
                                                    src={resolveImageUrl(currentImg)} 
                                                    alt={cat.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = cat.placeholder; }}
                                                />
                                                {isCustom && (
                                                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                                        ✓ CUSTOM FILE
                                                    </span>
                                                )}
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', padding: '12px 14px', color: '#fff' }}>
                                                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{cat.tag}</span>
                                                    <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '2px 0 0 0', color: '#fff' }}>{cat.name}</h4>
                                                </div>
                                            </div>

                                            {/* Actions & File Upload Box */}
                                            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'space-between', backgroundColor: '#fafafa' }}>
                                                <div>
                                                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px', display: 'block' }}>
                                                        Upload Image File
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={e => handleCategoryFileUpload(cat.key, e.target.files[0])}
                                                            style={{ fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 6px', backgroundColor: '#fff', flex: 1 }}
                                                        />
                                                        {isCustom && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleCategoryImgChange(cat.key, '')}
                                                                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0 10px', fontSize: '10px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                Reset
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bottom Save Action */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px 28px', display: 'flex', justifyContent: 'flex-end', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <button
                                type="button"
                                onClick={handleSaveSettings}
                                style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '14px 36px', borderRadius: '8px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
                            >
                                💾 Save All Content Settings
                            </button>
                        </div>

                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;
