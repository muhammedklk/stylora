import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const { cart } = useCart();
    
    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const currentPath = location.pathname;

    const navItems = [
        {
            label: 'Home',
            path: '/',
            icon: (color) => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            label: 'Shop',
            path: '/shop',
            icon: (color) => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            )
        },
        {
            label: 'Cart',
            path: '/cart',
            badge: cartCount,
            icon: (color) => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
            )
        },
        {
            label: 'Profile',
            path: '/account',
            icon: (color) => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        }
    ];

    return (
        <div className="mobile-bottom-nav">
            {navItems.map((item) => {
                const isActive = currentPath === item.path;
                const activeColor = '#d4af37'; // Golden Active
                const inactiveColor = '#888888'; // Gray Inactive

                return (
                    <Link 
                        key={item.label} 
                        to={item.path} 
                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="mobile-nav-icon-wrapper">
                            {item.icon(isActive ? activeColor : inactiveColor)}
                            {item.badge > 0 && (
                                <span className="mobile-nav-badge">{item.badge}</span>
                            )}
                        </div>
                        <span className="mobile-nav-label" style={{ color: isActive ? activeColor : inactiveColor }}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
