import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { API_URL, resolveImageUrl } from '../config';
import { productsData } from '../products-data';

import { SUB_CATEGORIES } from '../config/categories';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const CACHE_KEY = 'stylora_products_cache';

// Skeleton card for loading state
const SkeletonCard = () => (
    <div style={{ 
        borderRadius: '4px', 
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #eee'
    }}>
        <div style={{ width: '100%', paddingTop: '125%', background: '#f0f0f0', animation: 'shimmer 1.5s infinite linear' }}></div>
        <div style={{ padding: '12px' }}>
            <div style={{ height: '14px', width: '80%', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px', animation: 'shimmer 1.5s infinite linear' }}></div>
            <div style={{ height: '14px', width: '40%', background: '#f0f0f0', borderRadius: '4px', animation: 'shimmer 1.5s infinite linear' }}></div>
        </div>
    </div>
);

const isMockProduct = (p) => {
    const num = Number(p._id);
    return !isNaN(num) && num >= 1 && num <= 20;
};

const getInitialProducts = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data } = JSON.parse(cached);
            if (Array.isArray(data)) {
                const deletedIds = JSON.parse(localStorage.getItem('stylora_deleted_ids') || '[]');
                return data.filter(p => !deletedIds.includes(String(p._id)) && !isMockProduct(p));
            }
        }
    } catch (e) {}
    const customProds = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
    const deletedIds = JSON.parse(localStorage.getItem('stylora_deleted_ids') || '[]');
    return customProds.filter(p => !deletedIds.includes(String(p._id)) && !isMockProduct(p));
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
    const [activeSubCategory, setActiveSubCategory] = useState('all');
    const [loading, setLoading] = useState(false);

    // Amazon/Flipkart Style Sidebar Filter States
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'rating'
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(50000);
    const [minDiscount, setMinDiscount] = useState(0);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [inStockOnly, setInStockOnly] = useState(false);

    // Calculate active sidebar filter count
    const activeSidebarFilterCount = [
        sortBy !== 'newest',
        priceMin > 0 || priceMax < 50000,
        minDiscount > 0,
        selectedSizes.length > 0,
        selectedColors.length > 0,
        inStockOnly
    ].filter(Boolean).length;

    const resetSidebarFilters = () => {
        setSortBy('newest');
        setPriceMin(0);
        setPriceMax(50000);
        setMinDiscount(0);
        setSelectedSizes([]);
        setSelectedColors([]);
        setInStockOnly(false);
    };

    const getHeroBg = (img) => {
        if (!img) return undefined;
        return `url("${resolveImageUrl(img)}")`;
    };

    useEffect(() => {
        fetchProducts();

        const handleSync = () => {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const { data } = JSON.parse(cached);
                    if (Array.isArray(data)) {
                        setProducts(data);
                    }
                } catch(e) {}
            }
        };
        window.addEventListener('stylora_products_updated', handleSync);
        return () => window.removeEventListener('stylora_products_updated', handleSync);
    }, []);

    useEffect(() => {
        const cat = query.get('category') || 'all';
        setActiveFilter(cat);
        applyFilterAndSearch(
            products, 
            cat, 
            query.get('search') || '',
            sortBy,
            priceMin,
            priceMax,
            minDiscount,
            selectedSizes,
            selectedColors,
            inStockOnly
        );
    }, [location.search, products, sortBy, priceMin, priceMax, minDiscount, selectedSizes, selectedColors, inStockOnly]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            const rawData = Array.isArray(res.data) ? res.data : [];
            const customProds = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
            const merged = [...customProds, ...rawData];
            const deletedIds = JSON.parse(localStorage.getItem('stylora_deleted_ids') || '[]');
            const data = merged.filter(p => !deletedIds.includes(String(p._id)) && !isMockProduct(p));

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
            setProducts(data);
            applyFilterAndSearch(
                data, 
                initialCategory, 
                searchQuery,
                sortBy,
                priceMin,
                priceMax,
                minDiscount,
                selectedSizes,
                selectedColors,
                inStockOnly
            );
        } catch (err) {
            console.warn('Error fetching products from API server:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilterAndSearch = (
        allProducts, 
        category, 
        search, 
        sortVal = sortBy, 
        pMin = priceMin, 
        pMax = priceMax, 
        discMin = minDiscount, 
        sizesArr = selectedSizes, 
        colorsArr = selectedColors, 
        stockOnly = inStockOnly
    ) => {
        let result = [...allProducts];

        // 1. Category Filter
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

        // 1.5. Sub-Category Filter
        if (activeSubCategory && activeSubCategory !== 'all') {
            const targetSub = activeSubCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
            result = result.filter(p => {
                const subMatch = p.subCategory && p.subCategory.toLowerCase().replace(/[^a-z0-9]/g, '') === targetSub;
                const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().replace(/[^a-z0-9]/g, '') === targetSub);
                const titleMatch = p.title && p.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(targetSub);
                return subMatch || tagMatch || titleMatch;
            });
        }

        // 2. Search Query Filter
        if (search) {
            result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }

        // 3. Price Range Filter
        result = result.filter(p => p.price >= pMin && (pMax >= 50000 || p.price <= pMax));

        // 4. Minimum Discount Filter
        if (discMin > 0) {
            result = result.filter(p => {
                if (!p.originalPrice || p.originalPrice <= p.price) return false;
                const discPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                return discPercent >= discMin;
            });
        }

        // 5. Sizes Filter
        if (sizesArr.length > 0) {
            result = result.filter(p => p.sizes && p.sizes.some(s => sizesArr.includes(s)));
        }

        // 6. Colors Filter
        if (colorsArr.length > 0) {
            result = result.filter(p => p.colors && p.colors.some(c => colorsArr.some(sc => sc.toLowerCase() === c.name.toLowerCase())));
        }

        // 7. In Stock Filter
        if (stockOnly) {
            result = result.filter(p => p.inventoryCount > 0);
        }

        // 8. Sorting
        if (sortVal === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortVal === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortVal === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
            {/* Shimmer & FadeIn Animations */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
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

            {/* Shop Filters & Grid */}
            <section className="shop-section">
                <div className="container">

                    {/* Filter Bar Row with Right-Side Filter Button */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginBottom: '30px'
                    }}>
                        {/* Left Side: Scrollable Category Tabs */}
                        <div className="shop-filter-bar" style={{ flex: 1, margin: 0 }}>
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
                                        {tab.name} {count !== null && <span style={{ opacity: 0.8, fontSize: '10px', marginLeft: '4px', fontWeight: 600 }}>({count})</span>}
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

                        {/* Dynamic Sub-Category Filter Pills */}
                        {SUB_CATEGORIES[activeFilter] && (
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0 4px 0', width: '100%', borderTop: '1px solid #f3f4f6', marginTop: '12px' }}>
                                <button
                                    onClick={() => setActiveSubCategory('all')}
                                    style={{
                                        padding: '5px 14px',
                                        borderRadius: '16px',
                                        fontSize: '11px',
                                        fontWeight: activeSubCategory === 'all' ? 700 : 500,
                                        border: activeSubCategory === 'all' ? '1px solid #000' : '1px solid #e5e7eb',
                                        backgroundColor: activeSubCategory === 'all' ? '#000' : '#ffffff',
                                        color: activeSubCategory === 'all' ? '#fff' : '#4b5563',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    All {activeFilter.toUpperCase()}
                                </button>
                                {SUB_CATEGORIES[activeFilter].map(sub => (
                                    <button
                                        key={sub}
                                        onClick={() => setActiveSubCategory(sub)}
                                        style={{
                                            padding: '5px 14px',
                                            borderRadius: '16px',
                                            fontSize: '11px',
                                            fontWeight: activeSubCategory === sub ? 700 : 500,
                                            border: activeSubCategory === sub ? '1px solid #000' : '1px solid #e5e7eb',
                                            backgroundColor: activeSubCategory === sub ? '#000' : '#ffffff',
                                            color: activeSubCategory === sub ? '#fff' : '#4b5563',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Right Side: Amazon/Flipkart Style Filters Button */}
                        <button 
                            type="button"
                            onClick={() => setFilterDrawerOpen(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                backgroundColor: '#0f0f0f',
                                color: '#fff',
                                border: '1px solid #000',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                            <span>Filters</span>
                            {activeSidebarFilterCount > 0 && (
                                <span style={{
                                    backgroundColor: '#d4af37',
                                    color: '#000',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1
                                }}>
                                    {activeSidebarFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Products Grid */}
                    <div className="shop-grid">
                        {loading && products.length === 0 ? (
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
                                    {loading ? 'Loading products...' : 'No products found matching your filter criteria.'}
                                </p>
                                {activeSidebarFilterCount > 0 && (
                                    <button 
                                        onClick={resetSidebarFilters}
                                        style={{
                                            marginTop: '12px',
                                            padding: '8px 20px',
                                            backgroundColor: '#000',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Amazon / Flipkart Style Slide-Over Filter Drawer Backdrop */}
            {filterDrawerOpen && (
                <div 
                    onClick={() => setFilterDrawerOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 99998,
                        animation: 'fadeIn 0.2s ease'
                    }}
                />
            )}

            {/* Slide-Over Filter Panel Drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#fff',
                zIndex: 99999,
                boxShadow: '-6px 0 30px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                transform: filterDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: 'Inter, sans-serif'
            }}>
                {/* Drawer Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#0f0f0f',
                    color: '#fff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>
                            Refine & Filter
                        </h3>
                        {activeSidebarFilterCount > 0 && (
                            <span style={{
                                backgroundColor: '#d4af37',
                                color: '#000',
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '12px'
                            }}>
                                {activeSidebarFilterCount} active
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={() => setFilterDrawerOpen(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '22px',
                            cursor: 'pointer',
                            lineHeight: 1,
                            padding: '4px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Drawer Body (Scrollable Filters) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {/* 1. SORT BY */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', marginBottom: '12px' }}>
                            Sort By
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { label: 'Newest', value: 'newest' },
                                { label: 'Price: Low to High', value: 'price-asc' },
                                { label: 'Price: High to Low', value: 'price-desc' },
                                { label: 'Top Rated', value: 'rating' }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setSortBy(opt.value)}
                                    style={{
                                        padding: '10px 12px',
                                        fontSize: '11px',
                                        fontWeight: sortBy === opt.value ? 700 : 500,
                                        borderRadius: '4px',
                                        border: sortBy === opt.value ? '1.5px solid #000' : '1px solid #e0e0e0',
                                        backgroundColor: sortBy === opt.value ? '#111' : '#fff',
                                        color: sortBy === opt.value ? '#fff' : '#444',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />

                    {/* 2. PRICE RANGE */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', margin: 0 }}>
                                Price Range (₹)
                            </h4>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>
                                ₹{priceMin} - ₹{priceMax === 50000 ? '50,000+' : priceMax}
                            </span>
                        </div>

                        {/* Quick Presets */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {[
                                { label: 'Under ₹1,000', min: 0, max: 1000 },
                                { label: '₹1,000 - ₹3,000', min: 1000, max: 3000 },
                                { label: '₹3,000 - ₹5,000', min: 3000, max: 5000 },
                                { label: 'Above ₹5,000', min: 5000, max: 50000 }
                            ].map(p => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => { setPriceMin(p.min); setPriceMax(p.max); }}
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        border: priceMin === p.min && priceMax === p.max ? '1px solid #000' : '1px solid #eee',
                                        backgroundColor: priceMin === p.min && priceMax === p.max ? '#1a1a1a' : '#f8f8f8',
                                        color: priceMin === p.min && priceMax === p.max ? '#fff' : '#555',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Min & Max Range Inputs */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#777', display: 'block', marginBottom: '4px', fontWeight: 600 }}>MIN PRICE</label>
                                <input 
                                    type="number" 
                                    value={priceMin}
                                    onChange={e => setPriceMin(Number(e.target.value))}
                                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <span style={{ color: '#aaa', marginTop: '16px' }}>–</span>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '10px', color: '#777', display: 'block', marginBottom: '4px', fontWeight: 600 }}>MAX PRICE</label>
                                <input 
                                    type="number" 
                                    value={priceMax}
                                    onChange={e => setPriceMax(Number(e.target.value))}
                                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />

                    {/* 3. MINIMUM DISCOUNT OFFER */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', marginBottom: '12px' }}>
                            Discount Offer
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[
                                { label: 'All Deals', value: 0 },
                                { label: '10% or more', value: 10 },
                                { label: '20% or more', value: 20 },
                                { label: '30% or more', value: 30 },
                                { label: '40% or more', value: 40 }
                            ].map(d => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setMinDiscount(d.value)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        fontWeight: minDiscount === d.value ? 700 : 500,
                                        borderRadius: '4px',
                                        border: minDiscount === d.value ? '1px solid #d4af37' : '1px solid #eee',
                                        backgroundColor: minDiscount === d.value ? '#fefce8' : '#fff',
                                        color: minDiscount === d.value ? '#854d0e' : '#444',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />

                    {/* 4. SIZES */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', marginBottom: '12px' }}>
                            Select Sizes
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => {
                                const isSelected = selectedSizes.includes(sz);
                                return (
                                    <button
                                        key={sz}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedSizes(selectedSizes.filter(s => s !== sz));
                                            } else {
                                                setSelectedSizes([...selectedSizes, sz]);
                                            }
                                        }}
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            border: isSelected ? '2px solid #000' : '1px solid #ddd',
                                            backgroundColor: isSelected ? '#000' : '#fff',
                                            color: isSelected ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {sz}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />

                    {/* 5. COLORS */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', marginBottom: '12px' }}>
                            Select Colors
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[
                                { name: 'Black', hex: '#1a1a1a' },
                                { name: 'White', hex: '#ffffff' },
                                { name: 'Gray', hex: '#7a7a7a' },
                                { name: 'Red', hex: '#ef4444' },
                                { name: 'Blue', hex: '#3b82f6' },
                                { name: 'Green', hex: '#22c55e' },
                                { name: 'Navy', hex: '#1e3a8a' },
                                { name: 'Sand', hex: '#d4b996' }
                            ].map(col => {
                                const isSelected = selectedColors.includes(col.name);
                                return (
                                    <button
                                        key={col.name}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedColors(selectedColors.filter(c => c !== col.name));
                                            } else {
                                                setSelectedColors([...selectedColors, col.name]);
                                            }
                                        }}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            fontSize: '11px',
                                            fontWeight: isSelected ? 700 : 500,
                                            borderRadius: '20px',
                                            border: isSelected ? '1.5px solid #000' : '1px solid #eee',
                                            backgroundColor: isSelected ? '#f4f4f4' : '#fff',
                                            color: '#111',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            backgroundColor: col.hex,
                                            border: col.name === 'White' ? '1px solid #ccc' : 'none',
                                            display: 'inline-block'
                                        }} />
                                        {col.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />

                    {/* 6. IN STOCK AVAILABILITY */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={inStockOnly} 
                                onChange={e => setInStockOnly(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#000', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>
                                Show In Stock Products Only
                            </span>
                        </label>
                    </div>

                </div>

                {/* Drawer Footer Actions */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <button
                        type="button"
                        onClick={resetSidebarFilters}
                        style={{
                            flex: 1,
                            padding: '14px 0',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            color: '#333',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear All
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterDrawerOpen(false)}
                        style={{
                            flex: 2,
                            padding: '14px 0',
                            border: 'none',
                            backgroundColor: '#000',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Show ({filteredProducts.length}) Items
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shop;
