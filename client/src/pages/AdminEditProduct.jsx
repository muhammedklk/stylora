import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getColorNameFromHex = (hex) => {
    const colorMap = {
        '#000000': 'Black',
        '#ffffff': 'White',
        '#808080': 'Gray',
        '#c0c0c0': 'Silver',
        '#ff0000': 'Red',
        '#800000': 'Maroon',
        '#ffff00': 'Yellow',
        '#808000': 'Olive',
        '#00ff00': 'Lime',
        '#008000': 'Green',
        '#00ffff': 'Aqua/Cyan',
        '#008080': 'Teal',
        '#0000ff': 'Blue',
        '#000080': 'Navy Blue',
        '#ff00ff': 'Fuchsia/Magenta',
        '#800080': 'Purple',
        '#f4e1d2': 'Sand',
        '#f5f5dc': 'Beige',
        '#ffe4c4': 'Bisque',
        '#faebd7': 'Antique White',
        '#ffebcd': 'Blanched Almond',
        '#ff7f50': 'Coral',
        '#ffd700': 'Gold',
        '#daa520': 'Goldenrod',
        '#adff2f': 'Green Yellow',
        '#f0e68c': 'Khaki',
        '#e6e6fa': 'Lavender',
        '#fff0f5': 'Lavender Blush',
        '#ffb6c1': 'Light Pink',
        '#ffa07a': 'Light Salmon',
        '#20b2aa': 'Light Sea Green',
        '#87cefa': 'Light Sky Blue',
        '#778899': 'Light Slate Gray',
        '#b0c4de': 'Light Steel Blue',
        '#ffffe0': 'Light Yellow',
        '#32cd32': 'Lime Green',
        '#faf0e6': 'Linen',
        '#66cdaa': 'Medium Aquamarine',
        '#0000cd': 'Medium Blue',
        '#ba55d3': 'Medium Orchid',
        '#9370db': 'Medium Purple',
        '#3cb371': 'Medium Sea Green',
        '#7b68ee': 'Medium Slate Blue',
        '#00fa9a': 'Medium Spring Green',
        '#48d1cc': 'Medium Turquoise',
        '#c71585': 'Medium Violet Red',
        '#191970': 'Midnight Blue',
        '#f5fffa': 'Mint Cream',
        '#ffe4e1': 'Misty Rose',
        '#ffe4b5': 'Moccasin',
        '#ffdead': 'Navajo White',
        '#fdf5e6': 'Old Lace',
        '#6b8e23': 'Olive Drab',
        '#ffa500': 'Orange',
        '#ff4500': 'Orange Red',
        '#da70d6': 'Orchid',
        '#eee8aa': 'Pale Goldenrod',
        '#98fb98': 'Pale Green',
        '#afeeee': 'Pale Turquoise',
        '#db7093': 'Pale Violet Red',
        '#ffefd5': 'Papaya Whip',
        '#ffdab9': 'Peach Puff',
        '#cd853f': 'Peru',
        '#ffc0cb': 'Pink',
        '#dda0dd': 'Plum',
        '#b0e0e6': 'Powder Blue',
        '#bc8f8f': 'Rosy Brown',
        '#4169e1': 'Royal Blue',
        '#8b4513': 'Saddle Brown',
        '#fa8072': 'Salmon',
        '#f4a460': 'Sandy Brown',
        '#2e8b57': 'Sea Green',
        '#fff5ee': 'Seashell',
        '#a0522d': 'Sienna',
        '#87ceeb': 'Sky Blue',
        '#6a5acd': 'Slate Blue',
        '#708090': 'Slate Gray',
        '#fffafa': 'Snow',
        '#00ff7f': 'Spring Green',
        '#4682b4': 'Steel Blue',
        '#d2b48c': 'Tan',
        '#d8bfd8': 'Thistle',
        '#ff6347': 'Tomato',
        '#40e0d0': 'Turquoise',
        '#ee82ee': 'Violet',
        '#f5deb3': 'Wheat',
        '#f5f5f5': 'White Smoke',
        '#9acd32': 'Yellow Green'
    };

    hex = hex.toLowerCase();
    if (colorMap[hex]) return colorMap[hex];

    const hexToRgb = (h) => {
        const bigint = parseInt(h.substring(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    };

    try {
        const targetRgb = hexToRgb(hex);
        let minDistance = Infinity;
        let closestName = 'Custom Color';

        for (const [key, value] of Object.entries(colorMap)) {
            const rgb = hexToRgb(key);
            const distance = Math.sqrt(
                Math.pow(targetRgb.r - rgb.r, 2) +
                Math.pow(targetRgb.g - rgb.g, 2) +
                Math.pow(targetRgb.b - rgb.b, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestName = value;
            }
        }
        return closestName;
    } catch (e) {
        return 'Custom Color';
    }
};

const AdminEditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form states
    const [title, setTitle] = useState('');
    const [brand, setBrand] = useState('STYLORA');
    const [category, setCategory] = useState('clothing');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [description, setDescription] = useState('');
    const [inventoryCount, setInventoryCount] = useState(100);
    
    // Video states
    const [videoType, setVideoType] = useState('url'); // 'url' or 'file'
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    
    // Image states
    const [imageType, setImageType] = useState('url'); // 'url' or 'file'
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    
    // Dynamic sizes and colors
    const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
    const [colors, setColors] = useState([
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Gray', hex: '#7a7a7a' },
        { name: 'White', hex: '#ffffff' }
    ]);

    // Temp state for adding a color
    const [tempColorName, setTempColorName] = useState('Black');
    const [tempColorHex, setTempColorHex] = useState('#000000');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products/${id}`);
            const prod = res.data.product || res.data;
            if (prod) {
                setTitle(prod.title || '');
                setBrand(prod.brand || 'STYLORA');
                setCategory(prod.category || 'clothing');
                setPrice(prod.price || '');
                setOriginalPrice(prod.originalPrice || '');
                setDescription(prod.description || '');
                setInventoryCount(prod.inventoryCount !== undefined ? prod.inventoryCount : 50);
                
                // Read video url and set standard source selection tab
                const vUrl = prod.videoUrl || '';
                setVideoUrl(vUrl);
                if (vUrl.startsWith('uploads/')) {
                    setVideoType('file');
                } else {
                    setVideoType('url');
                }

                setImageUrl(prod.image || '');
                
                if (prod.sizes && prod.sizes.length > 0) {
                    setSizes(prod.sizes);
                }
                if (prod.colors && prod.colors.length > 0) {
                    setColors(prod.colors);
                }
            } else {
                setError('Failed to resolve product data.');
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            setError('Error loading product details. Please make sure the product ID is correct.');
        } finally {
            setLoading(false);
        }
    };

    const handleSizeToggle = (size) => {
        if (sizes.includes(size)) {
            setSizes(sizes.filter(s => s !== size));
        } else {
            setSizes([...sizes, size]);
        }
    };

    const handleColorHexChange = (e) => {
        const hex = e.target.value;
        setTempColorHex(hex);
        setTempColorName(getColorNameFromHex(hex));
    };

    const handleAddColor = () => {
        if (!tempColorName.trim()) return;
        if (colors.some(c => c.name.toLowerCase() === tempColorName.trim().toLowerCase())) {
            alert('A color with this name already exists.');
            return;
        }
        setColors([...colors, { name: tempColorName.trim(), hex: tempColorHex }]);
    };

    const handleRemoveColor = (nameToRemove) => {
        setColors(colors.filter(c => c.name !== nameToRemove));
    };

    const handleColorNameEdit = (index, newName) => {
        const updated = [...colors];
        updated[index].name = newName;
        setColors(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const formData = new FormData();
            formData.append('title', title);
            formData.append('brand', brand);
            formData.append('category', category);
            formData.append('price', Number(price));
            if (originalPrice) {
                formData.append('originalPrice', Number(originalPrice));
            } else {
                formData.append('originalPrice', '');
            }
            formData.append('description', description);
            formData.append('inventoryCount', Number(inventoryCount));
            
            // Serialize sizes and colors arrays to strings
            formData.append('sizes', JSON.stringify(sizes));
            formData.append('colors', JSON.stringify(colors));

            if (imageType === 'file' && imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', imageUrl);
            }

            if (videoType === 'file' && videoFile) {
                formData.append('video', videoFile);
            } else {
                formData.append('videoUrl', videoUrl);
            }

            await axios.put(`${API_URL}/products/${id}`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Product updated successfully!');
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Error updating product:', err);
            setError(err.response?.data?.message || 'Failed to update product details. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
                <p style={{ fontSize: '14px', color: '#666' }}>Loading product details...</p>
            </div>
        );
    }

    return (
        <main className="account-main">
            {/* Header Hero */}
            <section className="shop-hero" style={{ background: '#0f0f0f' }}>
                <div className="hero-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag" style={{ color: '#d4af37' }}>[ Product Catalog Control ]</span>
                    <h1 className="shop-hero-title" style={{ color: '#fff' }}>Edit Product</h1>
                    <p className="shop-hero-subtitle" style={{ color: '#aaa' }}>Modify catalog attributes, pricing, media, and stock of the selected item.</p>
                </div>
            </section>

            {/* Form Section */}
            <section className="account-section py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="account-panel active p-5" style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                    <h2 className="panel-title" style={{ color: '#111', fontSize: '20px', fontWeight: 700, margin: 0 }}>Modify Details</h2>
                                    <p className="panel-subtitle" style={{ color: '#666', fontSize: '13px', margin: '4px 0 0 0' }}>Update this product's brand, media description, price, sizes, and colors.</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger p-3 mb-4" style={{ fontSize: '13px', backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '4px' }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        {/* Brand & Title */}
                                        <div className="col-md-4">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Brand Name</label>
                                            <input 
                                                type="text" 
                                                className="account-input" 
                                                value={brand} 
                                                onChange={e => setBrand(e.target.value)} 
                                                required 
                                                style={{ height: '52px' }}
                                            />
                                        </div>

                                        <div className="col-md-8">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Product Title</label>
                                            <input 
                                                type="text" 
                                                className="account-input" 
                                                value={title} 
                                                onChange={e => setTitle(e.target.value)} 
                                                required 
                                                style={{ height: '52px' }}
                                            />
                                        </div>

                                        {/* Category & Pricing */}
                                        <div className="col-md-3">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Category</label>
                                            <select 
                                                className="account-input" 
                                                value={category} 
                                                onChange={e => setCategory(e.target.value)}
                                                style={{ height: '52px' }}
                                            >
                                                <option value="clothing">Clothing</option>
                                                <option value="shirts">Shirts</option>
                                                <option value="pants">Pants</option>
                                                <option value="outerwear">Outerwear</option>
                                                <option value="watches">Watches</option>
                                                <option value="shoes">Shoes</option>
                                                <option value="socks">Socks</option>
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Selling Price (₹)</label>
                                            <input 
                                                type="number" 
                                                className="account-input" 
                                                value={price} 
                                                onChange={e => setPrice(e.target.value)} 
                                                required 
                                                min="0"
                                                style={{ height: '52px' }}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Original Price (₹) - <span style={{ color: '#888', textTransform: 'none' }}>Optional</span></label>
                                            <input 
                                                type="number" 
                                                className="account-input" 
                                                value={originalPrice} 
                                                onChange={e => setOriginalPrice(e.target.value)} 
                                                placeholder="e.g. 1999 (to show discount)"
                                                min="0"
                                                style={{ height: '52px' }}
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Inventory Stock</label>
                                            <input 
                                                type="number" 
                                                className="account-input" 
                                                value={inventoryCount} 
                                                onChange={e => setInventoryCount(e.target.value)} 
                                                required
                                                min="0"
                                                style={{ height: '52px' }}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="col-12">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Description</label>
                                            <textarea 
                                                className="account-input" 
                                                rows="3" 
                                                value={description} 
                                                onChange={e => setDescription(e.target.value)} 
                                                required 
                                                style={{ minHeight: '80px', resize: 'vertical' }}
                                            ></textarea>
                                        </div>

                                        {/* Video Source Options */}
                                        <div className="col-12">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Product Video Media</label>
                                            
                                            <div className="d-flex gap-2 mb-3" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                                <button 
                                                    type="button"
                                                    onClick={() => setVideoType('url')}
                                                    style={{
                                                        background: videoType === 'url' ? '#111' : '#f5f5f5',
                                                        color: videoType === 'url' ? '#fff' : '#444',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        borderRadius: '2px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    VIDEO URL / LINK
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setVideoType('file')}
                                                    style={{
                                                        background: videoType === 'file' ? '#111' : '#f5f5f5',
                                                        color: videoType === 'file' ? '#fff' : '#444',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        borderRadius: '2px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    UPLOAD VIDEO FILE
                                                </button>
                                            </div>

                                            {videoType === 'url' ? (
                                                <div>
                                                    <input 
                                                        type="text" 
                                                        className="account-input" 
                                                        placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ or assets/videos/demo.mp4"
                                                        value={videoUrl} 
                                                        onChange={e => setVideoUrl(e.target.value)} 
                                                    />
                                                    <span style={{ fontSize: '11px', color: '#888', marginTop: '6px', display: 'block' }}>Enter a YouTube share link (embed link) or direct video file path.</span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input 
                                                        type="file" 
                                                        accept="video/*"
                                                        className="account-input" 
                                                        onChange={e => setVideoFile(e.target.files[0])}
                                                        style={{ padding: '12px' }}
                                                    />
                                                    <span style={{ fontSize: '11px', color: '#888', marginTop: '6px', display: 'block' }}>Upload a product demo video. Supported formats: MP4, WEBM, MOV. Max 50MB.</span>
                                                </div>
                                            )}

                                            {videoUrl && videoType === 'url' && (
                                                <div className="mt-2 text-muted" style={{ fontSize: '11px' }}>
                                                    Current Video: <code>{videoUrl}</code>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sizes Configuration */}
                                        <div className="col-md-6">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '12px', display: 'block' }}>Available Sizes</label>
                                            <div className="d-flex flex-wrap">
                                                {standardSizes.map(sz => (
                                                    <button
                                                        key={sz}
                                                        type="button"
                                                        onClick={() => handleSizeToggle(sz)}
                                                        style={{
                                                            background: sizes.includes(sz) ? '#1a1a1a' : '#fff',
                                                            color: sizes.includes(sz) ? '#fff' : '#1a1a1a',
                                                            border: '1px solid #1a1a1a',
                                                            padding: '8px 16px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            borderRadius: '2px',
                                                            transition: 'all 0.15s ease',
                                                            marginRight: '8px',
                                                            marginBottom: '8px'
                                                        }}
                                                    >
                                                        {sz}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Colors Configuration */}
                                        <div className="col-md-6">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '12px', display: 'block' }}>Available Colors</label>
                                            
                                            {/* List of active colors */}
                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                {colors.map((c, i) => (
                                                    <div 
                                                        key={i} 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px', 
                                                            backgroundColor: '#fafafa', 
                                                            border: '1px solid #eee', 
                                                            padding: '6px 12px', 
                                                            borderRadius: '20px',
                                                            marginRight: '8px',
                                                            marginBottom: '8px'
                                                        }}
                                                    >
                                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.hex, border: c.name === 'White' ? '1px solid #ddd' : 'none' }}></span>
                                                        <input 
                                                            type="text" 
                                                            value={c.name}
                                                            onChange={(e) => handleColorNameEdit(i, e.target.value)}
                                                            style={{
                                                                border: 'none',
                                                                background: 'transparent',
                                                                fontSize: '11px',
                                                                fontWeight: 500,
                                                                width: '70px',
                                                                outline: 'none',
                                                                padding: 0,
                                                                margin: 0
                                                            }}
                                                            title="Edit color name"
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveColor(c.name)}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', padding: '0 2px', color: '#888', fontWeight: 'bold' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add dynamic color inputs */}
                                            <div className="d-flex gap-2">
                                                <input 
                                                    type="text" 
                                                    className="account-input" 
                                                    placeholder="Color Name" 
                                                    value={tempColorName} 
                                                    onChange={e => setTempColorName(e.target.value)}
                                                    style={{ height: '42px', flex: 1 }}
                                                />
                                                <input 
                                                    type="color" 
                                                    value={tempColorHex} 
                                                    onChange={handleColorHexChange}
                                                    style={{ width: '42px', height: '42px', border: '1px solid #eee', cursor: 'pointer', padding: '2px', borderRadius: '2px', backgroundColor: 'transparent' }}
                                                    title="Select color hex"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddColor}
                                                    style={{
                                                        background: '#1a1a1a',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0 16px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        borderRadius: '2px'
                                                    }}
                                                >
                                                    ADD
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Option */}
                                        <div className="col-12">
                                            <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: '8px', display: 'block' }}>Product Image Media</label>
                                            
                                            <div className="d-flex gap-2 mb-3" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                                <button 
                                                    type="button"
                                                    onClick={() => setImageType('url')}
                                                    style={{
                                                        background: imageType === 'url' ? '#111' : '#f5f5f5',
                                                        color: imageType === 'url' ? '#fff' : '#444',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        borderRadius: '2px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    IMAGE PATH / URL
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setImageType('file')}
                                                    style={{
                                                        background: imageType === 'file' ? '#111' : '#f5f5f5',
                                                        color: imageType === 'file' ? '#fff' : '#444',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        borderRadius: '2px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    UPLOAD NEW FILE
                                                </button>
                                            </div>

                                            {imageType === 'url' ? (
                                                <div>
                                                    <input 
                                                        type="text" 
                                                        className="account-input" 
                                                        placeholder="e.g. assets/find-section-img-1.png or external link" 
                                                        value={imageUrl} 
                                                        onChange={e => setImageUrl(e.target.value)} 
                                                    />
                                                    <span style={{ fontSize: '11px', color: '#888', marginTop: '6px', display: 'block' }}>Provide an existing image file path relative to assets/ or a valid web link.</span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        className="account-input" 
                                                        onChange={e => setImageFile(e.target.files[0])}
                                                        style={{ padding: '12px' }}
                                                    />
                                                    <span style={{ fontSize: '11px', color: '#888', marginTop: '6px', display: 'block' }}>Upload a new image. Supported formats: JPG, PNG, WEBP.</span>
                                                </div>
                                            )}

                                            {imageUrl && (
                                                <div className="mt-3 p-3" style={{ border: '1px dashed #eee', display: 'inline-block', borderRadius: '4px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px' }}>Current Preview:</span>
                                                    <img 
                                                         src={imageUrl.startsWith('http') ? imageUrl : (imageUrl.startsWith('uploads/') ? `http://localhost:5000/${imageUrl}` : (imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`))} 
                                                         alt="Preview" 
                                                         style={{ maxHeight: '100px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons Section */}
                                    <div className="mt-5 pt-4 d-flex justify-content-end gap-3" style={{ borderTop: '1px solid #eee' }}>
                                        <button 
                                            type="button" 
                                            className="buy-now-btn" 
                                            style={{ padding: '14px 28px', width: 'auto', border: '1px solid #000', fontSize: '12px', fontWeight: 600 }} 
                                            onClick={() => navigate('/admin/dashboard')}
                                            disabled={submitting}
                                        >
                                            CANCEL
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="checkout-btn" 
                                            style={{ padding: '14px 28px', width: 'auto', fontSize: '12px', fontWeight: 600 }}
                                            disabled={submitting}
                                        >
                                            {submitting ? 'SAVING...' : 'UPDATE PRODUCT'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AdminEditProduct;
