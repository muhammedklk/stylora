import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SidebarDrawer = ({ isOpen, onClose }) => {
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [searchVal, setSearchVal] = useState('');
    const navigate = useNavigate();

    const toggleSubmenu = (menu) => {
        if (openSubmenu === menu) {
            setOpenSubmenu(null);
        } else {
            setOpenSubmenu(menu);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchVal.trim()) {
            onClose();
            navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
        }
    };

    return (
        <>
            <div 
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
                onClick={onClose}
            ></div>
            <div className={`sidebar-drawer ${isOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <span className="sidebar-logo">STYLEORA</span>
                    <button className="sidebar-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="sidebar-search-wrapper">
                    <form className="sidebar-search-form" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="sidebar-search-input"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                        />
                        <button type="submit" className="sidebar-search-submit">
                            <img src="/assets/Search.svg" alt="Search" />
                        </button>
                    </form>
                </div>

                <nav className="sidebar-nav">
                    <ul className="sidebar-links">
                        <li className={`sidebar-has-submenu ${openSubmenu === 'men' ? 'open' : ''}`}>
                            <a href="#" className="sidebar-submenu-toggle" onClick={(e) => { e.preventDefault(); toggleSubmenu('men'); }}>
                                Men <span className="plus-icon">{openSubmenu === 'men' ? '-' : '+'}</span>
                            </a>
                            <ul 
                                className="sidebar-submenu"
                                style={{ 
                                    maxHeight: openSubmenu === 'men' ? '400px' : '0px',
                                    transition: 'max-height 0.3s ease-out',
                                    overflow: 'hidden'
                                }}
                            >
                                <li><Link to="/shop?category=new-arrivals" onClick={onClose}>New Arrivals</Link></li>
                                <li><Link to="/shop?category=clothing" onClick={onClose}>Clothing</Link></li>
                                <li><Link to="/shop?category=shoes" onClick={onClose}>Shoes</Link></li>
                                <li><Link to="/shop?category=activewear" onClick={onClose}>Activewear</Link></li>
                                <li><Link to="/shop?category=outerwear" onClick={onClose}>Outerwear</Link></li>
                                <li><Link to="/shop?category=shirts" onClick={onClose}>Shirts</Link></li>
                                <li><Link to="/shop?category=pants" onClick={onClose}>Pants</Link></li>
                                <li><Link to="/shop?category=shorts" onClick={onClose}>Shorts</Link></li>
                            </ul>
                        </li>
                        <li className={`sidebar-has-submenu ${openSubmenu === 'accessories' ? 'open' : ''}`}>
                            <a href="#" className="sidebar-submenu-toggle" onClick={(e) => { e.preventDefault(); toggleSubmenu('accessories'); }}>
                                Accessories <span className="plus-icon">{openSubmenu === 'accessories' ? '-' : '+'}</span>
                            </a>
                            <ul 
                                className="sidebar-submenu"
                                style={{ 
                                    maxHeight: openSubmenu === 'accessories' ? '400px' : '0px',
                                    transition: 'max-height 0.3s ease-out',
                                    overflow: 'hidden'
                                }}
                            >
                                <li><Link to="/accessories?category=watches" onClick={onClose}>Watches</Link></li>
                                <li><Link to="/accessories?category=bags" onClick={onClose}>Bags</Link></li>
                                <li><Link to="/accessories?category=sunglasses" onClick={onClose}>Sunglasses</Link></li>
                                <li><Link to="/accessories?category=belts-wallets" onClick={onClose}>Belts & Wallets</Link></li>
                                <li><Link to="/accessories?category=hats-caps" onClick={onClose}>Hats & Caps</Link></li>
                                <li><Link to="/accessories?category=jewelry" onClick={onClose}>Jewelry</Link></li>
                                <li><Link to="/accessories?category=socks" onClick={onClose}>Socks</Link></li>
                            </ul>
                        </li>
                        <li><Link to="/about" onClick={onClose}>Our Story</Link></li>
                        <li><Link to="/contact" onClick={onClose}>Contact Us</Link></li>
                        <li><Link to="/account" onClick={onClose}>My Account</Link></li>
                        <li><Link to="/cart" onClick={onClose}>Shopping Bag</Link></li>
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default SidebarDrawer;
