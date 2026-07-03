import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = ({ toggleSidebar }) => {
    const { isAuthenticated } = useAuth();
    const { cart } = useCart();
    const [searchVal, setSearchVal] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        // Run initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if the current route has a dark hero banner overlay at the top.
    // If it does not, the header needs to be dark (solid scrolled state) by default
    // to prevent white-on-white text collision.
    const isHeroPage = ['/', '/about', '/contact', '/shop', '/accessories', '/account'].some(path => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    });

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchVal.trim()) {
                navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
            }
        }
    };

    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <header className={`header ${scrolled || !isHeroPage ? 'scrolled' : ''}`}>
            <nav className="container">
                {/* Left Side: Nav Links */}
                <ul className="nav-links">
                    <li className="has-dropdown">
                        <Link to="/shop">Men <span className="arrow-icon"></span></Link>
                        <ul className="dropdown">
                            <li><Link to="/shop?category=new-arrivals">New Arrivals</Link></li>
                            <li><Link to="/shop?category=clothing">Clothing</Link></li>
                            <li><Link to="/shop?category=shoes">Shoes</Link></li>
                            <li><Link to="/shop?category=activewear">Activewear</Link></li>
                            <li><Link to="/shop?category=outerwear">Outerwear</Link></li>
                            <li><Link to="/shop?category=shirts">Shirts</Link></li>
                            <li><Link to="/shop?category=pants">Pants</Link></li>
                            <li><Link to="/shop?category=shorts">Shorts</Link></li>
                        </ul>
                    </li>
                    <li className="has-dropdown">
                        <Link to="/accessories">Accessories <span className="arrow-icon"></span></Link>
                        <ul className="dropdown">
                            <li><Link to="/accessories?category=watches">Watches</Link></li>
                            <li><Link to="/accessories?category=bags">Bags</Link></li>
                            <li><Link to="/accessories?category=sunglasses">Sunglasses</Link></li>
                            <li><Link to="/accessories?category=belts-wallets">Belts & Wallets</Link></li>
                            <li><Link to="/accessories?category=hats-caps">Hats & Caps</Link></li>
                            <li><Link to="/accessories?category=jewelry">Jewelry</Link></li>
                            <li><Link to="/accessories?category=socks">Socks</Link></li>
                        </ul>
                    </li>
                    <li><Link to="/about">Our Story</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>

                {/* Center: Logo */}
                <div className="logo">
                    <Link to="/">STYLEORA</Link>
                </div>

                {/* Right Side: Utility Icons */}
                <div className="nav-utilities">
                    <Link to="/account" className="utility-icon" title="Account">
                        <img src="/assets/account-icon 1.svg" alt="Account" />
                    </Link>
                    <div className={`search-container ${showSearch ? 'active' : ''}`} id="search-container">
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search" 
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                        />
                    </div>
                    <button 
                        className="utility-icon search-btn" 
                        onClick={() => setShowSearch(!showSearch)} 
                        title="Search"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <img src="/assets/Search.svg" alt="Search" />
                    </button>
                    <Link to="/cart" className="utility-icon" title="Shopping Cart" style={{ position: 'relative' }}>
                        <img src="/assets/Shopping cart.svg" alt="Shopping Cart" />
                        {cartCount > 0 && (
                            <span className="cart-badge" style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-8px',
                                backgroundColor: '#000',
                                color: '#fff',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: 'bold'
                            }}>{cartCount}</span>
                        )}
                    </Link>
                    <button 
                        className="utility-icon menu-toggle" 
                        onClick={toggleSidebar} 
                        title="Menu"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <img src="/assets/menu-bar-icon.svg" alt="Menu" />
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
