import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { API_URL } from '../config';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Accessories = () => {
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
            // Get all products, we will filter for accessories tags/categories
            const res = await axios.get(`${API_URL}/products`);
            
            // Accessories categories list
            const accessoryCats = ['watches', 'bags', 'sunglasses', 'belts-wallets', 'hats-caps', 'jewelry', 'socks'];
            const accessoriesOnly = res.data.filter(p => p.tags.includes('Accessories') || accessoryCats.includes(p.category));
            
            setProducts(accessoriesOnly);
            applyFilterAndSearch(accessoriesOnly, initialCategory, searchQuery);
        } catch (err) {
            console.error('Error fetching accessories', err);
        }
    };

    const applyFilterAndSearch = (allProducts, category, search) => {
        let result = [...allProducts];

        // Apply category filter
        if (category && category !== 'all') {
            result = result.filter(p => p.category === category);
        }

        // Apply search query
        if (search) {
            result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }

        setFilteredProducts(result);
    };

    const handleFilterChange = (category) => {
        navigate(`/accessories?category=${category}${searchQuery ? `&search=${searchQuery}` : ''}`);
    };

    return (
        <div>
            {/* Accessories Hero Section */}
            <section className="shop-hero" style={{ backgroundImage: getHeroBg(settings?.accessoriesHeroImage) }}>
                <div className="shop-hero-overlay"></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag">[ Accessories ]</span>
                    <h1 className="shop-hero-title">Accessories Collection</h1>
                    <p className="shop-hero-subtitle">Complete your look with premium accessories, detailed watchcraft, and high-end accents.</p>
                </div>
            </section>

            {/* Shop Filters and Grid */}
            <section className="shop-section">
                <div className="container">
                    {/* Filter Tabs */}
                    <div className="shop-filter-bar">
                        {[
                            { name: 'All', cat: 'all' },
                            { name: 'Watches', cat: 'watches' },
                            { name: 'Bags', cat: 'bags' },
                            { name: 'Sunglasses', cat: 'sunglasses' },
                            { name: 'Belts & Wallets', cat: 'belts-wallets' },
                            { name: 'Hats & Caps', cat: 'hats-caps' },
                            { name: 'Jewelry', cat: 'jewelry' },
                            { name: 'Socks', cat: 'socks' }
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

export default Accessories;
