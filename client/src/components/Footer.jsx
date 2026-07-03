import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();

    return (
        <footer className="footer">
            <div className="container">
                {/* Top Footer: 5 Columns */}
                <div class="footer-top">
                    {/* Column 1: Quick Links */}
                    <div class="footer-column">
                        <h4 class="footer-heading">QUICK LINKS</h4>
                        <ul class="footer-links">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="#">Sitemap</Link></li>
                            <li><Link to="#">Blogs</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Policies */}
                    <div className="footer-column">
                        <h4 className="footer-heading">POLICIES</h4>
                        <ul className="footer-links">
                            <li><Link to="/policies/shipping">Shipping & Delivery</Link></li>
                            <li><Link to="/policies/returns">Return Policy</Link></li>
                            <li><Link to="/policies/privacy">Privacy Policy</Link></li>
                            <li><Link to="/policies/terms">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Styleora Description */}
                    <div class="footer-column brand-col">
                        <h4 class="footer-heading">STYLEORA</h4>
                        <p class="brand-desc">We deliver thoughtfully designed pieces that blend comfort and edge — made to move with you and crafted to help you stand out, every day.</p>
                        <Link to="#" class="find-stores">Find Store Locations</Link>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div class="footer-column newsletter-col">
                        <h4 class="footer-heading">NEWS LETTER</h4>
                        <p class="newsletter-text">Sign up to our newsletter to receive exclusive offers.</p>
                        <p class="newsletter-text highlight-text">Get 10% OFF on your first order</p>
                        <form class="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
                            <input type="email" placeholder="E-mail" class="newsletter-input" required />
                            <button type="submit" class="newsletter-btn">SUBSCRIBE</button>
                        </form>
                    </div>

                    {/* Column 5: Popular Searches */}
                    <div class="footer-column searches-col">
                        <h4 class="footer-heading">POPULAR SEARCHES</h4>
                        <p class="searches-text">Shirts, T Shirts, Pyjamas, Cargos, Jeans, Joggers, Shorts, Trousers, Watches</p>
                        <Link to="/contact" class="footer-contact-btn">Contact Us</Link>
                    </div>
                </div>

                {/* Divider Line */}
                <div class="footer-divider"></div>

                {/* Bottom Footer: Copyright, Socials, Credits */}
                <div class="footer-bottom">
                    <p class="copyright">© 2026 Styleora India Pvt Ltd. All rights reserved.</p>
                    
                    <div class="social-links">
                        <a href={settings.socialInstagram || '#'} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/assets/Instagram.svg" alt="Instagram" /></a>
                        <a href={settings.socialTwitter || '#'} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><img src="/assets/Facebook.svg" alt="Twitter" /></a>
                    </div>
                    
                    <p class="credits">Designed By kmuhammed</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
