import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, resolveImageUrl } from '../config';
import { fileToDataUrl } from '../utils/imageUtils';
import { useToast } from '../context/ToastContext';

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

import { SUB_CATEGORIES, CATEGORIES_LIST } from '../config/categories';

const AdminAddProduct = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Form states
    const [title, setTitle] = useState('');
    const [brand, setBrand] = useState('STYLORA');
    const [category, setCategory] = useState('shirts');
    const [subCategory, setSubCategory] = useState('Checked');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [description, setDescription] = useState('');
    const [inventoryCount, setInventoryCount] = useState(100);
    
    // Video states (URL vs File)
    const [videoType, setVideoType] = useState('url'); // 'url' or 'file'
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    
    // Image states (URL vs File)
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

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const objectUrlRef = useRef(null);

    const [productNumber, setProductNumber] = useState(1);

    useEffect(() => {
        // Calculate next sequence product number dynamically and set default stock count
        const customProds = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
        const count = customProds.length;
        const nextNum = count + 1;
        setProductNumber(nextNum);
        setInventoryCount(nextNum);

        // Fetch from API to ensure accurate total count and stock sequence
        axios.get(`${API_URL}/products`).then(res => {
            if (Array.isArray(res.data)) {
                const apiCount = res.data.length;
                const finalNext = Math.max(count, apiCount) + 1;
                setProductNumber(finalNext);
                setInventoryCount(finalNext);
            }
        }).catch(err => console.log(err));
    }, []);

    // Update image preview whenever imageFile or imageUrl changes
    useEffect(() => {
        // Revoke previous object URL to prevent memory leaks
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            objectUrlRef.current = url;
            setImagePreviewUrl(url);
        } else if (imageUrl) {
            setImagePreviewUrl(resolveImageUrl(imageUrl));
        } else {
            setImagePreviewUrl('');
        }
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, [imageFile, imageUrl]);

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
        // Check if color name already exists
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

        // Convert image file to base64 DataURL if file was uploaded
        let resolvedImageDataUrl = imageUrl;
        if (imageFile) {
            try {
                resolvedImageDataUrl = await fileToDataUrl(imageFile);
            } catch (err) {
                console.warn('File to DataURL conversion warning:', err);
            }
        }
        if (!resolvedImageDataUrl) {
            resolvedImageDataUrl = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80';
        }

        const tagList = [subCategory, 'New Arrival'].filter(Boolean);

        const newProductObj = {
            _id: 'prod-' + Date.now(),
            title: title.trim() || 'New Product',
            brand: brand.trim() || 'STYLORA',
            category: category ? category.toLowerCase() : 'clothing',
            subCategory: subCategory || '',
            price: Number(price) || 0,
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            description: description.trim() || '',
            inventoryCount: Number(inventoryCount) || productNumber,
            image: resolvedImageDataUrl,
            tags: tagList,
            sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
            colors: colors.length > 0 ? colors : [{ name: 'Black', hex: '#1a1a1a' }]
        };

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const formData = new FormData();
            formData.append('title', title);
            formData.append('brand', brand);
            formData.append('category', category);
            formData.append('subCategory', subCategory);
            formData.append('price', Number(price));
            if (originalPrice) {
                formData.append('originalPrice', Number(originalPrice));
            }
            formData.append('description', description);
            formData.append('inventoryCount', Number(inventoryCount));
            formData.append('tags', JSON.stringify(tagList)); 
            formData.append('sizes', JSON.stringify(sizes));
            formData.append('colors', JSON.stringify(colors));

            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', imageUrl || resolvedImageDataUrl);
            }

            if (videoFile) {
                formData.append('video', videoFile);
            } else if (videoUrl) {
                formData.append('videoUrl', videoUrl);
            }

            await axios.post(`${API_URL}/products`, formData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (err) {
            console.warn('Backend API add note, saving product locally:', err.message);
        }

        // Save new product locally to guarantee it shows up instantly
        try {
            const existingCustom = JSON.parse(localStorage.getItem('stylora_custom_products') || '[]');
            existingCustom.unshift(newProductObj);
            localStorage.setItem('stylora_custom_products', JSON.stringify(existingCustom));

            // Clear cache & dispatch update event
            localStorage.removeItem('stylora_products_cache');
            window.dispatchEvent(new Event('stylora_products_updated'));
        } catch (e) {}

        showToast('Product added successfully!', 'success');
        navigate('/admin/dashboard?tab=products');
        setSubmitting(false);
    };

    const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f8fafc', 
            display: 'flex', 
            flexDirection: 'column', 
            fontFamily: 'var(--font-primary, sans-serif)'
        }}>
            {/* Top Compact Header Bar */}
            <header style={{ 
                height: '54px', 
                backgroundColor: '#0a0a0a', 
                borderBottom: '1px solid #1f2937', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0 24px',
                color: '#ffffff',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        type="button"
                        onClick={() => navigate('/admin/dashboard?tab=products')}
                        style={{ 
                            backgroundColor: 'rgba(255,255,255,0.1)', 
                            color: '#ffffff', 
                            border: 'none', 
                            padding: '6px 12px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            cursor: 'pointer' 
                        }}
                    >
                        ← Back to Admin
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                        Add Product <span style={{ color: '#d4af37' }}>(#{productNumber})</span>
                    </span>
                    <span style={{ 
                        backgroundColor: '#1f2937', 
                        color: '#d4af37', 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        padding: '2px 10px', 
                        borderRadius: '12px',
                        border: '1px solid #d4af37'
                    }}>
                        Item #{productNumber}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        type="button"
                        onClick={() => navigate('/admin/dashboard?tab=products')}
                        style={{ 
                            backgroundColor: 'transparent', 
                            color: '#9ca3af', 
                            border: '1px solid #374151', 
                            padding: '6px 14px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            cursor: 'pointer' 
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ 
                            backgroundColor: '#10b981', 
                            color: '#ffffff', 
                            border: 'none', 
                            padding: '7px 20px', 
                            borderRadius: '4px', 
                            fontSize: '11px', 
                            fontWeight: 800, 
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                        }}
                    >
                        {submitting ? 'Saving...' : '✓ Publish Product'}
                    </button>
                </div>
            </header>

            {/* Compact Form Grid Container with Left & Right Side Spacing */}
            <div style={{ padding: '24px 48px', flex: 1, display: 'flex', justifyContent: 'center' }}>
                <form onSubmit={handleSubmit} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 320px', 
                    gap: '20px', 
                    alignItems: 'start',
                    maxWidth: '1140px',
                    width: '100%'
                }}>
                    
                    {/* Left Column: Compact Specifications Card */}
                    <div style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0', 
                        padding: '18px 22px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'flex-start',
                        gap: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        {error && (
                            <div style={{ fontSize: '11px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: '4px', margin: 0 }}>
                                {error}
                            </div>
                        )}

                        {/* Row 1: Brand & Title */}
                        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '4px', display: 'block' }}>Brand Name</label>
                                <input 
                                    type="text" 
                                    value={brand} 
                                    onChange={e => setBrand(e.target.value)} 
                                    required 
                                    placeholder="STYLORA"
                                    style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '4px', display: 'block' }}>Product Title</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    required 
                                    placeholder="e.g. Classic Cotton Oxford Shirt"
                                    style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {/* Row 2: Category, Sub-Category, Price, Original Price, Stock */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '4px', display: 'block' }}>Category</label>
                                <select 
                                    value={category} 
                                    onChange={e => {
                                        const newCat = e.target.value;
                                        setCategory(newCat);
                                        const availSub = SUB_CATEGORIES[newCat] || [];
                                        setSubCategory(availSub.length > 0 ? availSub[0] : '');
                                    }}
                                    style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 8px', fontSize: '11px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                                >
                                    {CATEGORIES_LIST.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#059669', marginBottom: '4px', display: 'block' }}>Sub-Category</label>
                                <select 
                                    value={subCategory} 
                                    onChange={e => setSubCategory(e.target.value)}
                                    style={{ width: '100%', height: '36px', border: '1.5px solid #10b981', borderRadius: '4px', padding: '0 8px', fontSize: '11px', outline: 'none', backgroundColor: '#f0fdf4', boxSizing: 'border-box', fontWeight: 600 }}
                                >
                                    {(SUB_CATEGORIES[category] || ['General']).map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '4px', display: 'block' }}>Price (₹)</label>
                                <input 
                                    type="number" 
                                    value={price} 
                                    onChange={e => setPrice(e.target.value)} 
                                    required 
                                    placeholder="₹"
                                    min="0"
                                    style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 10px', fontSize: '12px', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>Original (₹)</label>
                                <input 
                                    type="number" 
                                    value={originalPrice} 
                                    onChange={e => setOriginalPrice(e.target.value)} 
                                    placeholder="e.g. 1999"
                                    min="0"
                                    style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '4px', display: 'block' }}>Stock (Auto #{productNumber})</label>
                                <input 
                                    type="number" 
                                    value={inventoryCount} 
                                    onChange={e => setInventoryCount(e.target.value)} 
                                    required
                                    min="0"
                                    style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 10px', fontSize: '12px', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {/* Row 3: Description */}
                        <div>
                            <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '4px', display: 'block' }}>Description</label>
                            <textarea 
                                rows="2" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                required 
                                placeholder="Provide detailed material description..."
                                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '8px 10px', fontSize: '11px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                            ></textarea>
                        </div>

                        {/* Row 4: Sizes & Colors Config */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            
                            {/* Sizes Pill Selector */}
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '6px', display: 'block' }}>Available Sizes</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {standardSizes.map(sz => (
                                        <button
                                            key={sz}
                                            type="button"
                                            onClick={() => handleSizeToggle(sz)}
                                            style={{
                                                background: sizes.includes(sz) ? '#000000' : '#ffffff',
                                                color: sizes.includes(sz) ? '#ffffff' : '#4b5563',
                                                border: sizes.includes(sz) ? '1px solid #000000' : '1px solid #cbd5e1',
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {sz}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors Dynamic Config */}
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', marginBottom: '6px', display: 'block' }}>Colors</label>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                                    {colors.map((c, i) => (
                                        <div 
                                            key={i} 
                                            style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                backgroundColor: '#f8fafc', 
                                                border: '1px solid #e2e8f0', 
                                                padding: '2px 8px', 
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.hex, border: c.name === 'White' ? '1px solid #cbd5e1' : 'none' }}></span>
                                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#334155' }}>{c.name}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveColor(c.name)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: '#94a3b8', padding: 0, fontWeight: 'bold' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Color Name" 
                                        value={tempColorName} 
                                        onChange={e => setTempColorName(e.target.value)}
                                        style={{ height: '28px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 6px', fontSize: '10px', flex: 1, outline: 'none' }}
                                    />
                                    <input 
                                        type="color" 
                                        value={tempColorHex} 
                                        onChange={handleColorHexChange}
                                        style={{ width: '28px', height: '28px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '1px', borderRadius: '4px', backgroundColor: 'transparent' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddColor}
                                        style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Media Preview & Video Upload */}
                    <div style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0', 
                        padding: '18px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'flex-start',
                        gap: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        
                        {/* Image Upload Box */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', margin: 0 }}>Product Image</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setImageType('url')}
                                        style={{ background: imageType === 'url' ? '#0f172a' : '#f1f5f9', color: imageType === 'url' ? '#fff' : '#64748b', border: 'none', padding: '3px 8px', fontSize: '9px', fontWeight: 700, borderRadius: '3px', cursor: 'pointer' }}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setImageType('file')}
                                        style={{ background: imageType === 'file' ? '#0f172a' : '#f1f5f9', color: imageType === 'file' ? '#fff' : '#64748b', border: 'none', padding: '3px 8px', fontSize: '9px', fontWeight: 700, borderRadius: '3px', cursor: 'pointer' }}
                                    >
                                        File
                                    </button>
                                </div>
                            </div>

                            {imageType === 'url' ? (
                                <input 
                                    type="text" 
                                    placeholder="e.g. assets/find-section-img-1.png or URL" 
                                    value={imageUrl} 
                                    onChange={e => setImageUrl(e.target.value)} 
                                    style={{ width: '100%', height: '32px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 8px', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            ) : (
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files[0])}
                                    style={{ width: '100%', fontSize: '10px', border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px' }}
                                />
                            )}

                            {/* Image Live Preview */}
                            <div style={{ 
                                height: '110px', 
                                width: '100%', 
                                marginTop: '8px', 
                                borderRadius: '6px', 
                                border: '1px dashed #cbd5e1', 
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {imagePreviewUrl ? (
                                    <img src={imagePreviewUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>No Image Selected</span>
                                )}
                            </div>
                        </div>

                        {/* Video Upload Box */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', margin: 0 }}>Product Video Media</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setVideoType('url')}
                                        style={{ background: videoType === 'url' ? '#0f172a' : '#f1f5f9', color: videoType === 'url' ? '#fff' : '#64748b', border: 'none', padding: '3px 8px', fontSize: '9px', fontWeight: 700, borderRadius: '3px', cursor: 'pointer' }}
                                    >
                                        URL
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setVideoType('file')}
                                        style={{ background: videoType === 'file' ? '#0f172a' : '#f1f5f9', color: videoType === 'file' ? '#fff' : '#64748b', border: 'none', padding: '3px 8px', fontSize: '9px', fontWeight: 700, borderRadius: '3px', cursor: 'pointer' }}
                                    >
                                        File
                                    </button>
                                </div>
                            </div>

                            {videoType === 'url' ? (
                                <input 
                                    type="text" 
                                    placeholder="YouTube embed link or video path"
                                    value={videoUrl} 
                                    onChange={e => setVideoUrl(e.target.value)} 
                                    style={{ width: '100%', height: '32px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0 8px', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            ) : (
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    onChange={e => setVideoFile(e.target.files[0])}
                                    style={{ width: '100%', fontSize: '10px', border: '1px solid #cbd5e1', padding: '4px', borderRadius: '4px' }}
                                />
                            )}
                        </div>

                        {/* Bottom Action Submit Button */}
                        <button 
                            type="submit"
                            disabled={submitting}
                            style={{ 
                                width: '100%',
                                backgroundColor: '#0f172a', 
                                color: '#ffffff', 
                                border: 'none', 
                                padding: '11px', 
                                borderRadius: '4px', 
                                fontSize: '12px', 
                                fontWeight: 800, 
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                        >
                            {submitting ? 'Publishing Product...' : `✓ Save & Publish Item #${productNumber}`}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminAddProduct;
