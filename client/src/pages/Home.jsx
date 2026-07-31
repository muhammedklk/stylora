import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { API_URL, resolveImageUrl } from '../config';
import { productsData } from '../products-data';

const CACHE_KEY = 'stylora_products_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Skeleton placeholder for bestseller cards
const SkeletonCard = ({ isFeatured = false }) => (
    <div style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden',
        height: isFeatured ? '480px' : '220px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'homeShimmer 1.5s infinite'
    }} />
);

const getInitialProducts = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data } = JSON.parse(cached);
            if (Array.isArray(data)) {
                return data;
            }
        }
    } catch (e) {}
    return productsData;
};

const Home = () => {
    const { settings } = useSettings();
    const [products, setProducts] = useState(() => getInitialProducts());
    const [bestsellers, setBestsellers] = useState(() => {
        const initial = getInitialProducts();
        return initial.filter(p => p.tags && p.tags.includes('Bestseller'));
    });
    const [activeFilter, setActiveFilter] = useState('all');
    const charRefs = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();

        const handleSync = () => {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { data } = JSON.parse(cached);
                    if (Array.isArray(data)) {
                        setProducts(data);
                        const bests = data.filter(p => p.tags && p.tags.includes('Bestseller'));
                        setBestsellers(bests);
                    }
                } catch(e) {}
            }
        };
        window.addEventListener('stylora_products_updated', handleSync);
        return () => window.removeEventListener('stylora_products_updated', handleSync);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            const rawData = Array.isArray(res.data) ? res.data : [];
            const deletedIds = JSON.parse(localStorage.getItem('stylora_deleted_ids') || '[]');
            const data = rawData.filter(p => !deletedIds.includes(String(p._id)));

            // Update cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            setProducts(data);
            
            // Extract bestsellers
            const bests = data.filter(p => p.tags && p.tags.includes('Bestseller'));
            setBestsellers(bests);
        } catch (err) {
            console.warn('Error fetching products from API:', err.message);
        }
    };

    // Filter Logic for Find Your Style
    const handleFilterClick = (category) => {
        setActiveFilter(category);
        setShowMoreDropdown(false);
        if (category === 'all') {
            setFilteredStyleProducts(findStyleProducts);
        } else if (category === 'clothing') {
            const apparelCats = ['clothing', 'shirts', 'pants', 'shorts', 'outerwear', 'activewear'];
            const filtered = findStyleProducts.filter(p => apparelCats.includes(p.category) || (p.tags && p.tags.includes('Clothing')));
            setFilteredStyleProducts(filtered);
        } else {
            const target = category.toLowerCase().replace(/-/g, '');
            const filtered = findStyleProducts.filter(p => {
                const catMatch = p.category && p.category.toLowerCase().replace(/-/g, '') === target;
                const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().replace(/[^a-z0-9]/g, '') === target);
                return catMatch || tagMatch;
            });
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
        return { backgroundImage: `url("${resolveImageUrl(img)}")` };
    };

    return (
        <div>
            {/* Shimmer keyframe */}
            <style>{`
                @keyframes homeShimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
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

            {/* Find Your Style (Category Cards Grid) Section */}
            <section className="find-style">
                <div className="container">
                    <div className="find-style-header">
                        <h2 className="find-style-title">Find Your style</h2>
                        <p className="find-style-subtitle">Explore our curated collections by category and discover your perfect look.</p>
                    </div>

                    {/* Filter Bar / Category Navigation Tabs */}
                    <div className="filter-bar">
                        <div className="filter-tabs">
                            {[
                                { name: 'All Categories', cat: 'all' },
                                { name: 'Pants', cat: 'pants' },
                                { name: 'Shirts', cat: 'shirts' },
                                { name: 'Shoes', cat: 'shoes' },
                                { name: 'Outerwear', cat: 'outerwear' },
                                { name: 'Activewear', cat: 'activewear' },
                                { name: 'Watches', cat: 'watches' }
                            ].map(tab => (
                                <button 
                                    key={tab.name}
                                    className={`filter-tab ${activeFilter === tab.cat ? 'active' : ''}`}
                                    onClick={() => navigate(`/shop?category=${tab.cat}`)}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                        <button className="view-all-btn" onClick={() => navigate('/shop')}>View All Products</button>
                    </div>

                    {/* Category Cards Grid */}
                    <div className="find-style-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {[
                            { id: 'shirts', name: 'Shirts', tag: 'Essential Menswear', cat: 'shirts', fallback: '/assets/find-section-img-3.png' },
                            { id: 'pants', name: 'Pants & Trousers', tag: 'Tailored Bottoms', cat: 'pants', fallback: '/assets/find-section-img-2.png' },
                            { id: 'outerwear', name: 'Coats & Jackets', tag: 'Outerwear', cat: 'outerwear', fallback: '/assets/find-section-img-1.png' },
                            { id: 'shoes', name: 'Shoes & Sneakers', tag: 'Footwear', cat: 'shoes', fallback: '/assets/find-section-img-4.png' },
                            { id: 'activewear', name: 'Activewear', tag: 'Gym & Sports', cat: 'activewear', fallback: '/assets/find-section-img-1.png' },
                            { id: 'watches', name: 'Watches & Accessories', tag: 'Timepieces', cat: 'watches', fallback: '/assets/find-section-img-3.png' }
                        ].map(catItem => {
                            const customImg = settings?.categoryImages?.[catItem.id];
                            const matchingProd = products.find(p => 
                                (p.category && p.category.toLowerCase() === catItem.cat) ||
                                (p.tags && p.tags.some(t => t.toLowerCase() === catItem.cat))
                            );
                            const imgUrl = customImg ? resolveImageUrl(customImg) : (matchingProd ? resolveImageUrl(matchingProd.image) : catItem.fallback);

                            return (
                                <div 
                                    className="style-item" 
                                    key={catItem.id}
                                    onClick={() => navigate(`/shop?category=${catItem.cat}`)}
                                    style={{ cursor: 'pointer', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}
                                >
                                    <div className="style-card" style={{ height: '420px', position: 'relative', width: '100%' }}>
                                        <img 
                                            src={imgUrl} 
                                            alt={catItem.name} 
                                            className="style-image" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = catItem.fallback;
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '24px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)',
                                            color: '#fff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#d4af37', fontWeight: 700, marginBottom: '6px' }}>
                                                {catItem.tag}
                                            </span>
                                            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                                                {catItem.name}
                                            </h3>
                                            <div style={{
                                                width: '100%',
                                                padding: '12px 0',
                                                backgroundColor: '#fff',
                                                color: '#000',
                                                border: 'none',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                borderRadius: '2px',
                                                textAlign: 'center',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}>
                                                Explore {catItem.name} →
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
