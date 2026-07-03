import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LocationPickerModal from '../components/LocationPickerModal';
import { API_URL } from '../config';

const Account = () => {
    const { 
        user, 
        logout, 
        addresses, 
        addAddress, 
        deleteAddress, 
        updateProfile 
    } = useAuth();
    
    const navigate = useNavigate();

    const [activePanel, setActivePanel] = useState('dashboard');
    
    // Profile Edit states
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [profilePassword, setProfilePassword] = useState('');
    
    // Address Form states
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [addrName, setAddrName] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrLine, setAddrLine] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrState, setAddrState] = useState('');
    const [addrPostalCode, setAddrPostalCode] = useState('');
    const [addrType, setAddrType] = useState('shipping');
    const [addrLat, setAddrLat] = useState(null);
    const [addrLng, setAddrLng] = useState(null);
    const [addrMapAddress, setAddrMapAddress] = useState('');
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Orders states
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchUserOrders();
        }
    }, [user]);

    const fetchUserOrders = async () => {
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({
                name: profileName,
                email: profileEmail,
                password: profilePassword || undefined
            });
            setProfilePassword('');
            alert('Profile updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await addAddress({
                name: addrName,
                phone: addrPhone,
                addressLine: addrLine,
                city: addrCity,
                state: addrState,
                postalCode: addrPostalCode,
                addressType: addrType,
                latitude: addrLat,
                longitude: addrLng,
                mapAddress: addrMapAddress
            });
            setAddrName('');
            setAddrPhone('');
            setAddrLine('');
            setAddrCity('');
            setAddrState('');
            setAddrPostalCode('');
            setAddrLat(null);
            setAddrLng(null);
            setAddrMapAddress('');
            setShowAddrForm(false);
            alert('Address saved successfully!');
        } catch (err) {
            alert('Error saving address');
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    // Active order extraction (first Placed/Processed/Shipped order)
    const activeOrder = orders.find(o => o.status !== 'Delivered');

    return (
        <main className="account-main">
            {/* Account Header Hero */}
            <section className="shop-hero">
                <div className="shop-hero-overlay"></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag">[ Dashboard ]</span>
                    <h1 className="shop-hero-title">My Account</h1>
                    <p className="shop-hero-subtitle">Manage your personal settings, view order tracking, and edit billing addresses.</p>
                </div>
            </section>

            {/* Dashboard Workspace */}
            <section className="account-section">
                <div className="container">
                    <div className="row account-grid">
                        {/* Left Sidebar Menu */}
                        <aside className="col-md-3 account-sidebar">
                            <ul className="account-nav-list">
                                <li className={`account-nav-item ${activePanel === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePanel('dashboard')}>
                                    <span>Dashboard</span>
                                </li>
                                <li className={`account-nav-item ${activePanel === 'profile' ? 'active' : ''}`} onClick={() => setActivePanel('profile')}>
                                    <span>Profile Details</span>
                                </li>
                                <li className={`account-nav-item ${activePanel === 'orders' ? 'active' : ''}`} onClick={() => setActivePanel('orders')}>
                                    <span>Order History</span>
                                </li>
                                <li className={`account-nav-item ${activePanel === 'addresses' ? 'active' : ''}`} onClick={() => setActivePanel('addresses')}>
                                    <span>Saved Addresses</span>
                                </li>
                                <li className="account-nav-item" onClick={handleLogoutClick}>
                                    <span>Logout</span>
                                </li>
                            </ul>
                        </aside>

                        {/* Right Content Panels */}
                        <div className="col-md-9 account-content-panels">
                            
                            {/* Panel 1: Dashboard */}
                            {activePanel === 'dashboard' && (
                                <div className="account-panel active">
                                    <div className="panel-header">
                                        <h2 className="panel-title">Welcome back, {user.name}</h2>
                                        <p className="panel-subtitle">Here is a brief overview of your account status and recent actions.</p>
                                    </div>
                                    
                                    <div className="account-stats-row">
                                        <div className="stat-card">
                                            <span className="stat-title">Total Orders</span>
                                            <span className="stat-value">{orders.length}</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-title">Active Shipments</span>
                                            <span className="stat-value">{orders.filter(o => o.status !== 'Delivered').length}</span>
                                        </div>
                                        <div className="stat-card">
                                            <span className="stat-title">Reward Points</span>
                                            <span className="stat-value">450</span>
                                        </div>
                                    </div>

                                    {activeOrder && (
                                        <div className="recent-order-highlight mt-4">
                                            <div className="highlight-header d-flex justify-content-between align-items-center">
                                                <h3 className="highlight-title">Active Order #{activeOrder._id.substring(activeOrder._id.length - 8)}</h3>
                                                <span className={`status-badge in-transit`}>{activeOrder.status}</span>
                                            </div>
                                            <div className="highlight-body">
                                                <div className="order-details-summary mb-3">
                                                    <p><strong>Order Date:</strong> {new Date(activeOrder.createdAt).toLocaleDateString()}</p>
                                                    <p><strong>Estimated Delivery:</strong> 3-5 Business Days</p>
                                                </div>
                                                <div className="order-tracking-steps d-flex justify-content-between">
                                                    {['Placed', 'Processed', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                                        const steps = ['Placed', 'Processed', 'Shipped', 'Out for Delivery', 'Delivered'];
                                                        const currentIdx = steps.indexOf(activeOrder.status);
                                                        const stepIdx = steps.indexOf(step);
                                                        const isDone = stepIdx < currentIdx;
                                                        const isActive = stepIdx === currentIdx;

                                                        return (
                                                            <div key={step} className={`tracking-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                                                <span className="step-dot"></span>
                                                                <span className="step-label" style={{ fontSize: '11px' }}>{step}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Panel 2: Profile Details */}
                            {activePanel === 'profile' && (
                                <div className="account-panel active">
                                    <div className="panel-header">
                                        <h2 className="panel-title">Profile Details</h2>
                                        <p className="panel-subtitle">Manage your personal settings, password configuration, and email address notifications.</p>
                                    </div>

                                    <form className="account-form" onSubmit={handleProfileUpdate}>
                                        <h3 className="form-section-heading">Personal Information</h3>
                                        <div className="form-group mb-3">
                                            <label>Full Name</label>
                                            <input type="text" className="account-input w-100" value={profileName} onChange={e => setProfileName(e.target.value)} required />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>Email Address</label>
                                            <input type="email" className="account-input w-100" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required />
                                        </div>
                                        <h3 className="form-section-heading mt-4">Change Password</h3>
                                        <div className="form-group mb-4">
                                            <label>New Password (leave blank to keep current)</label>
                                            <input type="password" className="account-input w-100" placeholder="••••••••" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} />
                                        </div>
                                        <button type="submit" className="checkout-btn w-auto px-5">SAVE CHANGES</button>
                                    </form>
                                </div>
                            )}

                            {/* Panel 3: Order History */}
                            {activePanel === 'orders' && (
                                <div className="account-panel active">
                                    <div className="panel-header">
                                        <h2 className="panel-title">Order History</h2>
                                        <p className="panel-subtitle">View past order receipts, tracking histories, and transaction status.</p>
                                    </div>

                                    {ordersLoading ? (
                                        <p>Loading your orders...</p>
                                    ) : orders.length > 0 ? (
                                        <div className="orders-list">
                                            {orders.map(order => (
                                                <div key={order._id} className="order-history-card">
                                                    <div className="order-history-header">
                                                        <span className="order-number">Order #{order._id.substring(order._id.length - 8)}</span>
                                                        <span className={`status-badge ${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                                                    </div>
                                                    <div className="order-history-body">
                                                        <div className="order-info-grid">
                                                            <div className="order-info-item">
                                                                <span className="order-info-label">Date Placed</span>
                                                                <span className="order-info-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="order-info-item">
                                                                <span className="order-info-label">Total Amount</span>
                                                                <span className="order-info-value amount">₹{order.total}</span>
                                                            </div>
                                                            <div className="order-info-item full-width">
                                                                <span className="order-info-label">Items Ordered</span>
                                                                <span className="order-info-value">{order.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#888' }}>You have not placed any orders yet.</p>
                                    )}
                                </div>
                            )}

                            {/* Panel 4: Saved Addresses */}
                            {activePanel === 'addresses' && (
                                <div className="account-panel active">
                                    <div className="panel-header">
                                        <h2 className="panel-title">Saved Addresses</h2>
                                        <p className="panel-subtitle">Manage billing and delivery address destinations.</p>
                                    </div>

                                    <div className="row g-3">
                                        {addresses.map(addr => (
                                            <div className="col-md-6" key={addr._id}>
                                                <div className="address-card">
                                                    <span className="address-badge">{addr.addressType || 'Shipping'}</span>
                                                    <h4 className="address-name">{addr.name}</h4>
                                                    <p className="address-details">
                                                        {addr.addressLine}, {addr.city}, {addr.state} - {addr.postalCode}
                                                    </p>
                                                    <div className="address-phone">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                        </svg>
                                                        {addr.phone}
                                                    </div>
                                                    <button 
                                                        className="address-delete-btn"
                                                        onClick={() => deleteAddress(addr._id)}
                                                    >
                                                        Remove Address
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4">
                                        {!showAddrForm ? (
                                            <button className="save-profile-btn d-inline-block px-4 py-2" onClick={() => setShowAddrForm(true)}>+ ADD NEW ADDRESS</button>
                                        ) : (
                                            <form className="address-form-box" onSubmit={handleAddressSubmit}>
                                                <h3 className="form-section-heading mb-4">Add New Destination Address</h3>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="account-form-label">Recipient Name</label>
                                                            <input type="text" className="account-input" value={addrName} onChange={e => setAddrName(e.target.value)} placeholder="e.g. John Doe" required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="account-form-label">Phone Number</label>
                                                            <input type="text" className="account-input" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} placeholder="e.g. +91 98765 43210" required />
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="form-group">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <label className="account-form-label">Street Address</label>
                                                                <button 
                                                                    type="button" 
                                                                    className="cart-secondary-btn" 
                                                                    style={{ height: '30px', padding: '0 12px', fontSize: '10px', marginTop: 0, width: 'auto' }}
                                                                    onClick={() => setIsMapOpen(true)}
                                                                >
                                                                    📍 PINPOINT ON MAP
                                                                </button>
                                                            </div>
                                                            <input type="text" className="account-input" value={addrLine} onChange={e => setAddrLine(e.target.value)} placeholder="e.g. 123 Main St, Apartment 4B" required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label className="account-form-label">City</label>
                                                            <input type="text" className="account-input" value={addrCity} onChange={e => setAddrCity(e.target.value)} placeholder="e.g. Mumbai" required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label className="account-form-label">State</label>
                                                            <input type="text" className="account-input" value={addrState} onChange={e => setAddrState(e.target.value)} placeholder="e.g. Maharashtra" required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label className="account-form-label">Postal Code</label>
                                                            <input type="text" className="account-input" value={addrPostalCode} onChange={e => setAddrPostalCode(e.target.value)} placeholder="e.g. 400001" required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-actions-row mt-4">
                                                    <button type="submit" className="save-profile-btn">SAVE ADDRESS</button>
                                                    <button type="button" className="cancel-btn" onClick={() => setShowAddrForm(false)}>CANCEL</button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </section>
            <LocationPickerModal 
                isOpen={isMapOpen} 
                onClose={() => setIsMapOpen(false)} 
                onConfirm={(loc) => {
                    setAddrLine(loc.addressLine);
                    setAddrCity(loc.city);
                    setAddrState(loc.state);
                    setAddrPostalCode(loc.postalCode);
                    setAddrLat(loc.latitude);
                    setAddrLng(loc.longitude);
                    setAddrMapAddress(loc.mapAddress);
                }}
            />
        </main>
    );
};

export default Account;
