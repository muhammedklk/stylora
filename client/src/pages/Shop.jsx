import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

const API_URL = 'http://localhost:5000/api';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Shop = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const location = useLocation();
    
    const initialCategory = query.get('category') || 'all';
    const searchQuery = query.get('search') || '';

    const { settings } = useSettings();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState(initialCategory);

    const getHeroBg = (img) => {
        if (!img) return undefined;
        const resolved = img.startsWith('http') 
            ? img 
            : (img.startsWith('uploads/') ? `http://localhost:5000/${img}` : (img.startsWith('/') ? img : `/${img}`));
        return `url("${resolved}")`;
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
            setProducts(res.data);
            applyFilterAndSearch(res.data, initialCategory, searchQuery);
        } catch (err) {
            console.error('Error fetching products', err);
        }
    };

    const applyFilterAndSearch = (allProducts, category, search) => {
        let result = [...allProducts];

        // Apply category filter
        if (category && category !== 'all') {
            if (category === 'new-arrivals') {
                result = result.filter(p => p.tags.includes('New Arrival'));
            } else {
                result = result.filter(p => p.category === category);
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

    return (
        <div>
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
                        {[
                            { name: 'All', cat: 'all' },
                            { name: 'New Arrivals', cat: 'new-arrivals' },
                            { name: 'Clothing', cat: 'clothing' },
                            { name: 'Shoes', cat: 'shoes' },
                            { name: 'Activewear', cat: 'activewear' },
                            { name: 'Outerwear', cat: 'outerwear' },
                            { name: 'Shirts', cat: 'shirts' },
                            { name: 'Pants', cat: 'pants' },
                            { name: 'Shorts', cat: 'shorts' }
                        ].map(tab => (
                            <button 
                                key={tab.name}
                                className={`shop-filter-tab ${activeFilter === tab.cat ? 'active' : ''}`}
                                onClick={() => handleFilterChange(tab.cat)}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div className="shop-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(prod => (
                                <ProductCard product={prod} key={prod._id} />
                            ))
                        ) : (
                            <div className="text-center py-5" style={{ width: '100%', gridColumn: 'span 4' }}>
                                <p style={{ fontSize: '18px', color: '#666' }}>No products found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shop;
