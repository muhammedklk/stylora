import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { API_URL, resolveImageUrl } from '../config';
import { productsData } from '../products-data';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const CACHE_KEY = 'stylora_products_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Skeleton card for loading state
const SkeletonCard = () => (
    <div style={{ 
        borderRadius: '4px', 
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #f0f0f0'
    }}>
        <div style={{ 
            width: '100%', 
            paddingBottom: '125%', 
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
        }} />
        <div style={{ padding: '12px' }}>
            <div style={{ height: '10px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px', width: '60%', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }} />
            <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '4px', width: '40%', animation: 'shimmer 1.5s infinite' }} />
        </div>
    </div>
);

const getInitialProducts = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data } = JSON.parse(cached);
            if (Array.isArray(data) && data.length > 0) {
                return data;
            }
        }
    } catch (e) {}
    return productsData;
};

const Shop = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const location = useLocation();
    
    const initialCategory = query.get('category') || 'all';
    const searchQuery = query.get('search') || '';

    const { settings } = useSettings();
    const [products, setProducts] = useState(() => getInitialProducts());
    const [filteredProducts, setFilteredProducts] = useState(() => getInitialProducts());
    const [activeFilter, setActiveFilter] = useState(initialCategory);
    const [loading, setLoading] = useState(false);

    const getHeroBg = (img) => {
        if (!img) return undefined;
        return `url("${resolveImageUrl(img)}")`;
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const cat = query.get('category') || 'all';
        setActiveFilter(cat);
        applyFilterAndSearch(products, cat, query.get('search') || '');
    }, [location.search, products]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            const data = Array.isArray(res.data) ? res.data : [];
            if (data.length === 0) {
                throw new Error('Empty products list from API server');
            }
            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            setProducts(data);
            applyFilterAndSearch(data, initialCategory, searchQuery);
        } catch (err) {
            console.warn('Error fetching products, falling back to static local data:', err.message);
            // Only use static data if cache is also empty
            if (products.length === 0) {
                setProducts(productsData);
                applyFilterAndSearch(productsData, initialCategory, searchQuery);
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilterAndSearch = (allProducts, category, search) => {
        let result = [...allProducts];

        // Apply category filter
        if (category && category !== 'all') {
            if (category === 'new-arrivals') {
                result = result.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === 'new arrival'));
            } else if (category === 'clothing') {
                const apparelCats = ['clothing', 'shirts', 'pants', 'shorts', 'outerwear', 'activewear'];
                result = result.filter(p => apparelCats.includes(p.category) || (p.tags && p.tags.includes('Clothing')));
            } else {
                const target = category.toLowerCase().replace(/-/g, '');
                result = result.filter(p => {
                    const catMatch = p.category && p.category.toLowerCase().replace(/-/g, '') === target;
                    const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().replace(/[^a-z0-9]/g, '') === target);
                    return catMatch || tagMatch;
                });
            }
        }

        // Apply search query
        if (search) {
            result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }

        setFilteredProducts(result);
    };

    const handleFilterChange = (category) => {
        navigate(`/shop?category=${category}${searchQuery ? `&search=${searchQuery}` : ''}`);
    };

    // Count products per category for "Not Available" badge
    const countForCategory = (cat) => {
        if (cat === 'all') return products.length;
        if (cat === 'new-arrivals') return products.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === 'new arrival')).length;
        if (cat === 'clothing') {
            const apparelCats = ['clothing', 'shirts', 'pants', 'shorts', 'outerwear', 'activewear'];
            return products.filter(p => apparelCats.includes(p.category) || (p.tags && p.tags.includes('Clothing'))).length;
        }
        const target = cat.toLowerCase().replace(/-/g, '');
        return products.filter(p => {
            const catMatch = p.category && p.category.toLowerCase().replace(/-/g, '') === target;
            const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().replace(/[^a-z0-9]/g, '') === target);
            return catMatch || tagMatch;
        }).length;
    };

    const showNotAvailableBadge = settings?.showNotAvailableBadge === true;

    const filterTabs = [
        { name: 'All', cat: 'all' },
        { name: 'New Arrivals', cat: 'new-arrivals' },
        { name: 'Clothing', cat: 'clothing' },
        { name: 'Shoes', cat: 'shoes' },
        { name: 'Activewear', cat: 'activewear' },
        { name: 'Outerwear', cat: 'outerwear' },
        { name: 'Shirts', cat: 'shirts' },
        { name: 'Pants', cat: 'pants' },
        { name: 'Shorts', cat: 'shorts' }
    ];

    return (
        <div>
            {/* Shimmer animation style */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            {/* Shop Hero Section */}
            <section className="shop-hero" style={{ backgroundImage: getHeroBg(settings?.shopHeroImage) }}>
                <div className="shop-hero-overlay"></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag">[ Men's Collection ]</span>
                    <h1 className="shop-hero-title">
                        {searchQuery ? `Search Results for "${searchQuery}"` : "Men's Collection"}
                    </h1>
                    <p className="shop-hero-subtitle">Discover essentials designed for motion, simplicity, and premium comfort.</p>
                </div>
            </section>

            {/* Shop Filters and Grid */}
            <section className="shop-section">
                <div className="container">
                    {/* Filter Tabs */}
                    <div className="shop-filter-bar">
                        {filterTabs.map(tab => {
                            const count = !loading ? countForCategory(tab.cat) : null;
                            const isEmpty = count !== null && count === 0;
                            return (
                                <button 
                                    key={tab.name}
                                    className={`shop-filter-tab ${activeFilter === tab.cat ? 'active' : ''}`}
                                    onClick={() => handleFilterChange(tab.cat)}
                                    style={{ position: 'relative' }}
                                >
                                    {tab.name}
                                    {showNotAvailableBadge && isEmpty && (
                                        <span style={{
                                            marginLeft: '6px',
                                            fontSize: '9px',
                                            fontWeight: 700,
                                            backgroundColor: '#fee2e2',
                                            color: '#dc2626',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            letterSpacing: '0.03em',
                                            verticalAlign: 'middle',
                                            textTransform: 'uppercase'
                                        }}>
                                            N/A
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Products Grid */}
                    <div className="shop-grid">
                        {loading && products.length === 0 ? (
                            // Show skeleton cards on first load when cache is empty
                            Array.from({ length: 8 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map(prod => (
                                <ProductCard product={prod} key={prod._id} />
                            ))
                        ) : (
                            <div className="text-center py-5" style={{ width: '100%', gridColumn: 'span 4' }}>
                                <p style={{ fontSize: '18px', color: '#666' }}>
                                    {loading ? 'Loading products...' : 'No products found in this category.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shop;
