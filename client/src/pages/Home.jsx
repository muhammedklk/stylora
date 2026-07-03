import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { API_URL } from '../config';

const Home = () => {
    const { settings } = useSettings();
    const [products, setProducts] = useState([]);
    const [bestsellers, setBestsellers] = useState([]);
    const [findStyleProducts, setFindStyleProducts] = useState([]);
    const [filteredStyleProducts, setFilteredStyleProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const charRefs = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
            
            // Extract bestsellers
            const bests = res.data.filter(p => p.tags.includes('Bestseller'));
            setBestsellers(bests);
            
            // Extract Find Your Style products (usually the first 8)
            const styleProds = res.data.slice(0, 8);
            setFindStyleProducts(styleProds);
            setFilteredStyleProducts(styleProds);
        } catch (err) {
            console.error('Error fetching products', err);
        }
    };

    // Filter Logic for Find Your Style
    const handleFilterClick = (category) => {
        setActiveFilter(category);
        setShowMoreDropdown(false);
        if (category === 'all') {
            setFilteredStyleProducts(findStyleProducts);
        } else {
            const filtered = findStyleProducts.filter(p => p.category === category);
            setFilteredStyleProducts(filtered);
        }
    };

    // Character Sweep Animation on Scroll
    useEffect(() => {
        const handleScroll = () => {
            const statementSection = document.querySelector('.brand-info-section');
            if (!statementSection) return;

            const rect = statementSection.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            
            if (rect.top < viewHeight && rect.bottom > 0) {
                const start = viewHeight;
                const end = viewHeight * 0.45;
                let progress = (start - rect.top) / (start - end);
                progress = Math.max(0, Math.min(1, progress));
                
                const activeCount = Math.floor(progress * charRefs.current.length);
                charRefs.current.forEach((char, index) => {
                    if (char) {
                        if (index < activeCount) {
                            char.classList.add('active');
                        } else {
                            char.classList.remove('active');
                        }
                    }
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [products]);

    // Split text into span elements for sweep animation
    const textBold = "We exemplify ‘free-spirited’ fashion at unmatched prices, offered in conveniently located, friendly, and relatable shopping spaces.";
    const textDimmed = "The brand resonates with the fun and carefree nature of fashion.";
    
    let charIndex = 0;
    const renderAnimatedText = (text, isBold) => {
        return text.split('').map((char, i) => {
            const currentIdx = charIndex++;
            return (
                <span 
                    key={i} 
                    ref={el => charRefs.current[currentIdx] = el}
                    className={`anim-char ${isBold ? 'char-bold' : 'char-dimmed'}`}
                    style={{ transitionDelay: `${i * 1.5}ms` }}
                >
                    {char}
                </span>
            );
        });
    };

    const featuredProduct = bestsellers[0];
    const rightGridProducts = bestsellers.slice(1, 5);

    const getHeroBg = (img) => {
        if (!img) return {};
        const resolved = img.startsWith('http') 
            ? img 
            : (img.startsWith('uploads/') ? `http://localhost:5000/${img}` : (img.startsWith('/') ? img : `/${img}`));
        return { backgroundImage: `url("${resolved}")` };
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="hero" style={getHeroBg(settings?.heroImage)}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-left">
                        <div className="tagline">{settings.heroTag || '[ Featured Collections ]'}</div>
                        <h1 className="hero-title" style={{ whiteSpace: 'pre-line' }}>{settings.heroTitle || 'Timeless Essentials\nfor the Season'}</h1>
                    </div>
                    <div className="hero-right">
                        <div className="hero-accent-text" style={{ whiteSpace: 'pre-line' }}>{settings.heroSubtitle || 'Fresh\nFits @26'}</div>
                    </div>
                </div>
            </section>

            {/* Bestsellers Section */}
            <section className="bestsellers">
                <div className="container">
                    <div className="bestsellers-header">
                        <span className="section-tag">[ Bestsellers ]</span>
                        <h2 class="section-title">Our Most Popular<br />Pieces This Season</h2>
                    </div>

                    <div className="row bestsellers-grid">
                        {/* Left Column: Featured Card */}
                        {featuredProduct && (
                            <div className="col-lg-6 product-featured">
                                <ProductCard product={featuredProduct} isFeatured={true} />
                            </div>
                        )}

                        {/* Right Column: 2x2 grid */}
                        <div className="col-lg-6 product-showcase-grid">
                            {rightGridProducts.map(prod => (
                                <ProductCard key={prod._id} product={prod} />
                            ))}
                        </div>
                    </div>

                    <div className="bestsellers-footer">
                        <button className="shop-now-btn" onClick={() => navigate('/shop')}>Shop Now</button>
                    </div>
                </div>
            </section>

            {/* Find Your Style Section */}
            <section className="find-style">
                <div className="container">
                    <div className="find-style-header">
                        <h2 className="find-style-title">Find Your style</h2>
                        <p className="find-style-subtitle">Browse our curated selection of premium menswear essentials.</p>
                    </div>

                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <div className="filter-tabs">
                            {[
                                { name: 'All', cat: 'all' },
                                { name: 'Pants', cat: 'pants' },
                                { name: 'Shirts', cat: 'shirts' },
                                { name: 'T-Shirts', cat: 't-shirts' },
                                { name: 'Track Pants', cat: 'track-pants' },
                                { name: 'Watch', cat: 'watches' },
                                { name: 'Trousers', cat: 'trousers' },
                                { name: 'Cap', cat: 'hats-caps' }
                            ].map(tab => (
                                <button 
                                    key={tab.name}
                                    className={`filter-tab ${activeFilter === tab.cat ? 'active' : ''}`}
                                    onClick={() => handleFilterClick(tab.cat)}
                                >
                                    {tab.name}
                                </button>
                            ))}
                            
                            <button 
                                className={`filter-tab filter-more-btn ${showMoreDropdown ? 'active' : ''}`} 
                                id="filter-more-btn"
                                onClick={(e) => { e.stopPropagation(); setShowMoreDropdown(!showMoreDropdown); }}
                            >
                                <img src="/assets/more-dots.svg" alt="More" className="more-icon" />
                            </button>
                            
                            <div className={`filter-more-dropdown ${showMoreDropdown ? 'active' : ''}`} id="filter-more-dropdown">
                                {[
                                    { name: 'Activewear', cat: 'activewear' },
                                    { name: 'Shoes', cat: 'shoes' },
                                    { name: 'Outerwear', cat: 'outerwear' },
                                    { name: 'Bags', cat: 'bags' },
                                    { name: 'Socks', cat: 'socks' }
                                ].map(dropItem => (
                                    <button 
                                        key={dropItem.name}
                                        className={`filter-more-dropdown-item ${activeFilter === dropItem.cat ? 'active' : ''}`} 
                                        onClick={() => handleFilterClick(dropItem.cat)}
                                    >
                                        {dropItem.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="view-all-btn" onClick={() => navigate('/shop')}>View All</button>
                    </div>

                    {/* Product Grid */}
                    <div className="find-style-grid">
                        {filteredStyleProducts.map(prod => (
                            <div className="style-item" key={prod._id}>
                                <div className="style-card" onClick={() => navigate(`/product/${prod._id}`)} style={{ cursor: 'pointer' }}>
                                    <img src={prod.image.startsWith('http') ? prod.image : (prod.image.startsWith('uploads/') ? `http://localhost:5000/${prod.image}` : (prod.image.startsWith('/') ? prod.image : `/${prod.image}`))} alt={prod.title} className="style-image" />
                                    <button className="choose-options-btn">Choose Options</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Marquee & Brand Statement Section */}
            <section className="brand-info-section">
                <div className="marquee-ticker">
                    <div className="marquee-track">
                        <div className="marquee-content">
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                        </div>
                        <div className="marquee-content" aria-hidden="true">
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                            <span>Free Shipping Across India</span>
                            <span>Shop Without Limits!</span>
                        </div>
                    </div>
                </div>

                <div className="brand-statement-container">
                    <p className="brand-statement-text" style={{ display: 'inline-block', width: '100%' }}>
                        {renderAnimatedText(textBold, true)}
                        <span style={{ margin: '0 8px' }}></span>
                        {renderAnimatedText(textDimmed, false)}
                    </p>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <div className="container">
                    <div className="testimonials-header">
                        <h2 className="testimonials-title">What Our Customers Say</h2>
                        <p className="testimonials-subtitle">Real experiences from customers who have made Styleora a part of their everyday style.</p>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonials-col">
                            <div className="testimonial-card">
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">"Absolutely impressed with the quality. The fabric feels premium, the fit is perfect, and delivery was faster than expected."</p>
                                <span className="testimonial-author">— Arjun Nair, Kochi</span>
                            </div>
                            <div className="testimonial-card">
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">"Finding premium menswear online is difficult, but Styleora exceeded my expectations."</p>
                                <span className="testimonial-author">— Vishnu Raj, Trivandrum</span>
                            </div>
                        </div>
                        <div className="testimonials-col">
                            <div className="testimonial-card">
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">"Excellent customer service and amazing product quality. Everything arrived exactly as shown on the website."</p>
                                <span className="testimonial-author">— Aditya Sharma, Mumbai</span>
                            </div>
                            <div className="testimonial-card">
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">"The hoodie I ordered is one of the most comfortable pieces in my wardrobe. Premium quality at a great price."</p>
                                <span className="testimonial-author">— Ahmed Faiz, Calicut</span>
                            </div>
                        </div>
                        <div className="testimonials-col">
                            <div className="testimonial-card">
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">"Clean designs, quality materials, and a seamless shopping experience. Highly recommended for anyone looking to upgrade."</p>
                                <span className="testimonial-author">— Rohan Verma, Chennai</span>
                            </div>
                            <div className="testimonial-card">
                                <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">"The designs are modern and stylish without being over the top. I received multiple compliments."</p>
                                <span className="testimonial-author">— Rahul Menon, Bangalore</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
