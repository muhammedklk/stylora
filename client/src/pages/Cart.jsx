import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LocationPickerModal from '../components/LocationPickerModal';

const API_URL = 'http://localhost:5000/api';

const Cart = () => {
    const { 
        cart, 
        updateQuantity, 
        removeFromCart, 
        applyCoupon, 
        removeCoupon, 
        coupon, 
        couponError,
        getSubtotal, 
        getDiscount, 
        getShipping, 
        getTotal,
        clearCart
    } = useCart();
    
    const { isAuthenticated, addresses, addAddress } = useAuth();
    const navigate = useNavigate();

    const [promoInput, setPromoInput] = useState('');
    const [checkoutStage, setCheckoutStage] = useState(false); // false: bag review, true: checkout details
    
    // Checkout form states (bound to inputs, prepopulated automatically, editable)
    const [checkoutName, setCheckoutName] = useState('');
    const [checkoutPhone, setCheckoutPhone] = useState('');
    const [checkoutAddrLine, setCheckoutAddrLine] = useState('');
    const [checkoutCity, setCheckoutCity] = useState('');
    const [checkoutState, setCheckoutState] = useState('');
    const [checkoutPostalCode, setCheckoutPostalCode] = useState('');
    const [checkoutLat, setCheckoutLat] = useState(null);
    const [checkoutLng, setCheckoutLng] = useState(null);
    const [checkoutMapAddress, setCheckoutMapAddress] = useState('');
    const [saveToProfile, setSaveToProfile] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Unused address states cleaned up
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newAddrLine, setNewAddrLine] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newState, setNewState] = useState('');
    const [newPostalCode, setNewPostalCode] = useState('');

    const startCheckout = () => {
        if (!isAuthenticated) {
            alert('Please login to continue checkout');
            navigate('/login');
            return;
        }

        // Find default or first address to auto-populate
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        if (defaultAddr) {
            setCheckoutName(defaultAddr.name || '');
            setCheckoutPhone(defaultAddr.phone || '');
            setCheckoutAddrLine(defaultAddr.addressLine || '');
            setCheckoutCity(defaultAddr.city || '');
            setCheckoutState(defaultAddr.state || '');
            setCheckoutPostalCode(defaultAddr.postalCode || '');
            setCheckoutLat(defaultAddr.latitude || null);
            setCheckoutLng(defaultAddr.longitude || null);
            setCheckoutMapAddress(defaultAddr.mapAddress || '');
        } else {
            setCheckoutName('');
            setCheckoutPhone('');
            setCheckoutAddrLine('');
            setCheckoutCity('');
            setCheckoutState('');
            setCheckoutPostalCode('');
            setCheckoutLat(null);
            setCheckoutLng(null);
            setCheckoutMapAddress('');
        }
        setCheckoutStage(true);
    };

    const handlePromoSubmit = async (e) => {
        e.preventDefault();
        if (!promoInput.trim()) return;
        try {
            await applyCoupon(promoInput.trim());
            alert('Promo code applied successfully!');
        } catch (err) {
            alert(err.message || 'Invalid promo code');
        }
    };

    const handleNewAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            await addAddress({
                name: newName,
                phone: newPhone,
                addressLine: newAddrLine,
                city: newCity,
                state: newState,
                postalCode: newPostalCode
            });
            setShowNewAddressForm(false);
            setNewName('');
            setNewPhone('');
            setNewAddrLine('');
            setNewCity('');
            setNewState('');
            setNewPostalCode('');
            alert('New address saved!');
        } catch (err) {
            console.error('Error saving address', err);
            alert('Error saving address. Please try again.');
        }
    };

    const handlePlaceOrder = async () => {
        if (!checkoutName || !checkoutPhone || !checkoutAddrLine || !checkoutCity || !checkoutState || !checkoutPostalCode) {
            alert('Please complete all shipping address fields.');
            return;
        }

        const orderPayload = {
            items: cart.items.map(item => ({
                productId: item.productId._id,
                title: item.productId.title,
                price: item.productId.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: item.productId.image
            })),
            address: {
                name: checkoutName,
                phone: checkoutPhone,
                addressLine: checkoutAddrLine,
                city: checkoutCity,
                state: checkoutState,
                postalCode: checkoutPostalCode,
                country: 'India',
                latitude: checkoutLat,
                longitude: checkoutLng,
                mapAddress: checkoutMapAddress
            },
            subtotal: getSubtotal(),
            discount: getDiscount(),
            shipping: getShipping(),
            total: getTotal(),
            couponCode: coupon ? coupon.code : ''
        };

        try {
            const token = localStorage.getItem('token');
            
            // Optionally save address to profile if checked
            if (saveToProfile) {
                try {
                    await addAddress({
                        name: checkoutName,
                        phone: checkoutPhone,
                        addressLine: checkoutAddrLine,
                        city: checkoutCity,
                        state: checkoutState,
                        postalCode: checkoutPostalCode,
                        latitude: checkoutLat,
                        longitude: checkoutLng,
                        mapAddress: checkoutMapAddress,
                        addressType: 'shipping'
                    });
                } catch (addrErr) {
                    console.error('Failed to auto-save address to profile', addrErr);
                }
            }

            const res = await axios.post(`${API_URL}/orders`, orderPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            clearCart();
            alert('Order placed successfully! Tracking number generated.');
            navigate('/account');
        } catch (err) {
            console.error('Error placing order', err);
            alert(err.response?.data?.message || 'Error placing order');
        }
    };

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const shipping = getShipping();
    const total = getTotal();

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <main className="cart-main">
                <section className="shop-hero">
                    <div className="hero-overlay"></div>
                    <div className="shop-hero-content">
                        <span className="shop-hero-tag">[ Empty Bag ]</span>
                        <h1 className="shop-hero-title">Shopping Cart</h1>
                        <p className="shop-hero-subtitle">Your shopping bag is currently empty. Explore our collections to add essentials.</p>
                        <Link to="/shop" className="shop-now-btn mt-3" style={{ display: 'inline-block' }}>CONTINUE SHOPPING</Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-main">
            {/* Cart Hero */}
            <section className="shop-hero">
                <div className="hero-overlay"></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag">[ Your Bag ]</span>
                    <h1 className="shop-hero-title">Shopping Cart</h1>
                    <p className="shop-hero-subtitle">Review details of selected essential wear before proceeding to checkout.</p>
                </div>
            </section>

            {/* Cart Content Section */}
            <section className="cart-section">
                <div className="container">
                    {!checkoutStage ? (
                        <div className="row cart-grid">
                            {/* Left: Cart Items List */}
                            <div className="col-md-8 cart-items-column">
                                <table className="cart-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.items.map(item => {
                                            const prod = item.productId;
                                            if (!prod) return null;
                                            return (
                                                <tr className="cart-item" key={item._id}>
                                                    <td className="cart-product-cell">
                                                        <div className="cart-product-img-frame">
                                                            <img 
                                                                src={prod.image.startsWith('http') ? prod.image : (prod.image.startsWith('uploads/') ? `http://localhost:5000/${prod.image}` : (prod.image.startsWith('/') ? prod.image : `/${prod.image}`))} 
                                                                alt={prod.title} 
                                                            />
                                                        </div>
                                                        <div className="cart-product-details">
                                                            <h3 className="cart-item-title">
                                                                <Link to={`/product/${prod._id}`}>{prod.title}</Link>
                                                            </h3>
                                                            <p className="cart-item-meta">Size: {item.size} | Color: {item.color}</p>
                                                        </div>
                                                    </td>
                                                    <td className="cart-price-cell">₹{prod.price}</td>
                                                    <td className="cart-qty-cell">
                                                        <div className="quantity-selector">
                                                            <button 
                                                                className="qty-btn minus-btn"
                                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                            >−</button>
                                                            <input type="number" className="qty-input" value={item.quantity} readOnly />
                                                            <button 
                                                                className="qty-btn plus-btn"
                                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                            >+</button>
                                                        </div>
                                                    </td>
                                                    <td className="cart-subtotal-cell">₹{prod.price * item.quantity}</td>
                                                    <td className="cart-remove-cell">
                                                        <button 
                                                            className="remove-item-btn" 
                                                            title="Remove Item"
                                                            onClick={() => removeFromCart(item._id)}
                                                        >&times;</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Promo Code Form */}
                                <div className="cart-actions-row">
                                    {coupon ? (
                                        <div className="d-flex align-items-center" style={{ gap: '15px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'green' }}>Promo Code "{coupon.code}" Active!</span>
                                            <button 
                                                className="btn btn-outline-danger btn-sm" 
                                                style={{ borderRadius: 0, fontSize: '11px', padding: '4px 8px' }}
                                                onClick={removeCoupon}
                                            >
                                                REMOVE
                                            </button>
                                        </div>
                                    ) : (
                                        <form className="promo-code-form" onSubmit={handlePromoSubmit}>
                                            <input 
                                                type="text" 
                                                placeholder="Promo Code" 
                                                className="promo-input" 
                                                value={promoInput}
                                                onChange={(e) => setPromoInput(e.target.value)}
                                                required 
                                            />
                                            <button type="submit" className="promo-btn">APPLY</button>
                                        </form>
                                    )}
                                    {couponError && <span className="coupon-status-msg" style={{ color: 'red' }}>{couponError}</span>}
                                </div>
                            </div>

                            {/* Right: Order Summary */}
                            <div className="col-md-4 cart-summary-column">
                                <div className="summary-box">
                                    <h2 className="summary-title">Order Summary</h2>
                                    
                                    <div className="summary-rows">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{subtotal}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            {shipping === 0 ? <span className="free-shipping">FREE</span> : <span>₹{shipping}</span>}
                                        </div>
                                        {discount > 0 && (
                                            <div className="summary-row discount-row">
                                                <span>Discount</span>
                                                <span>-₹{discount}</span>
                                            </div>
                                        )}
                                        <div className="summary-divider"></div>
                                        <div className="summary-row total-row">
                                            <span>Estimated Total</span>
                                            <span>₹{total}</span>
                                        </div>
                                    </div>

                                    <button 
                                        className="checkout-btn" 
                                        onClick={startCheckout}
                                    >
                                        PROCEED TO CHECKOUT
                                    </button>

                                    <div className="summary-security-badges">
                                        <p className="security-text">🔒 Secure Checkout Guaranteed</p>
                                        <div className="payment-methods-row">
                                            <span className="payment-icon">Visa</span>
                                            <span className="payment-icon">MC</span>
                                            <span className="payment-icon">UPI</span>
                                            <span className="payment-icon">GPay</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Checkout Stage: Address details & order placing */
                        <div className="row cart-grid">
                            <div className="col-md-8 cart-items-column">
                                <h3 className="mb-4" style={{ fontFamily: 'var(--font-primary)', fontWeight: 600 }}>Shipping & Delivery Details</h3>
                                
                                {addresses && addresses.length > 0 && (
                                    <div className="mb-4 p-3" style={{ border: '1px solid #ddd', backgroundColor: '#fafafa' }}>
                                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#555' }}>
                                            Use a Saved Address
                                        </label>
                                        <select 
                                            className="account-input" 
                                            onChange={(e) => {
                                                const idx = e.target.value;
                                                if (idx !== "") {
                                                    const selected = addresses[idx];
                                                    setCheckoutName(selected.name || '');
                                                    setCheckoutPhone(selected.phone || '');
                                                    setCheckoutAddrLine(selected.addressLine || '');
                                                    setCheckoutCity(selected.city || '');
                                                    setCheckoutState(selected.state || '');
                                                    setCheckoutPostalCode(selected.postalCode || '');
                                                    setCheckoutLat(selected.latitude || null);
                                                    setCheckoutLng(selected.longitude || null);
                                                    setCheckoutMapAddress(selected.mapAddress || '');
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>-- Select a saved address to populate form --</option>
                                            {addresses.map((addr, idx) => (
                                                <option key={addr._id} value={idx}>
                                                    {addr.name} ({addr.addressLine}, {addr.city})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <form className="address-form-box" style={{ border: '1px solid #eee', padding: '24px', backgroundColor: '#fff' }} onSubmit={(e) => e.preventDefault()}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="account-form-label">Recipient Name</label>
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    value={checkoutName} 
                                                    onChange={e => setCheckoutName(e.target.value)} 
                                                    placeholder="e.g. John Doe"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label className="account-form-label">Phone Number</label>
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    value={checkoutPhone} 
                                                    onChange={e => setCheckoutPhone(e.target.value)} 
                                                    placeholder="e.g. +91 98765 43210"
                                                    required 
                                                />
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
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    value={checkoutAddrLine} 
                                                    onChange={e => setCheckoutAddrLine(e.target.value)} 
                                                    placeholder="e.g. 123 Main St, Apartment 4B"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="account-form-label">City</label>
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    value={checkoutCity} 
                                                    onChange={e => setCheckoutCity(e.target.value)} 
                                                    placeholder="e.g. Mumbai"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="account-form-label">State</label>
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    value={checkoutState} 
                                                    onChange={e => setCheckoutState(e.target.value)} 
                                                    placeholder="e.g. Maharashtra"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="account-form-label">Postal Code</label>
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    value={checkoutPostalCode} 
                                                    onChange={e => setCheckoutPostalCode(e.target.value)} 
                                                    placeholder="e.g. 400001"
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        {checkoutMapAddress && (
                                            <div className="col-12">
                                                <div style={{ fontSize: '11px', color: '#666', background: '#f5f5f5', padding: '10px 14px', borderLeft: '3px solid #000' }}>
                                                    <strong>📍 Map Pinpoint:</strong> {checkoutMapAddress} 
                                                    {checkoutLat && ` (${checkoutLat.toFixed(5)}, ${checkoutLng.toFixed(5)})`}
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-12 mt-3">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={saveToProfile} 
                                                    onChange={e => setSaveToProfile(e.target.checked)} 
                                                />
                                                Save this address to my profile for future orders
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Right: Checkout order Summary */}
                            <div className="col-md-4 cart-summary-column">
                                <div className="summary-box">
                                    <h2 className="summary-title">Checkout Summary</h2>
                                    
                                    <div className="summary-rows">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{subtotal}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            {shipping === 0 ? <span className="free-shipping">FREE</span> : <span>₹{shipping}</span>}
                                        </div>
                                        {discount > 0 && (
                                            <div className="summary-row discount-row">
                                                <span>Discount</span>
                                                <span>-₹{discount}</span>
                                            </div>
                                        )}
                                        <div className="summary-divider"></div>
                                        <div className="summary-row total-row">
                                            <span>Final Total</span>
                                            <span>₹{total}</span>
                                        </div>
                                    </div>

                                    <button 
                                        className="checkout-btn" 
                                        onClick={handlePlaceOrder}
                                    >
                                        PLACE ORDER (COD)
                                    </button>

                                    <button 
                                        className="cart-secondary-btn w-100 mt-2" 
                                        onClick={() => setCheckoutStage(false)}
                                    >
                                        BACK TO SHOPPING BAG
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <LocationPickerModal 
                isOpen={isMapOpen} 
                onClose={() => setIsMapOpen(false)} 
                onConfirm={(loc) => {
                    setCheckoutName(checkoutName || loc.addressLine);
                    setCheckoutAddrLine(loc.addressLine);
                    setCheckoutCity(loc.city);
                    setCheckoutState(loc.state);
                    setCheckoutPostalCode(loc.postalCode);
                    setCheckoutLat(loc.latitude);
                    setCheckoutLng(loc.longitude);
                    setCheckoutMapAddress(loc.mapAddress);
                }}
            />
        </main>
    );
};

export default Cart;
