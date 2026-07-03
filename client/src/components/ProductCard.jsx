import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product, isFeatured = false }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const availableSizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ['S', 'M', 'L', 'XL'];
    const availableColors = (product.colors && product.colors.length > 0) ? product.colors : [
        { name: 'Black', hex: '#1a1a1a' },
        { name: 'Gray', hex: '#7a7a7a' },
        { name: 'White', hex: '#ffffff' }
    ];

    const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
    const [selectedColor, setSelectedColor] = useState(availableColors[0]?.name || 'Black');

    const handleQuickAdd = (e) => {
        e.stopPropagation();
        addToCart(product._id, 1, selectedSize, selectedColor);
        showToast(`${product.title} added to cart!`, 'success');
    };

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    return (
        <div className="product-item">
            <div className={`product-card ${isFeatured ? 'featured-card' : ''}`}>
                {hasDiscount && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#d4af37',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '2px',
                        letterSpacing: '0.05em',
                        zIndex: 3
                    }}>
                        {discountPercentage}% OFF
                    </div>
                )}
                <div className="card-inner">
                    {/* Front Face */}
                    <div className="card-front">
                        <div 
                            className="card-image-wrapper" 
                            onClick={() => navigate(`/product/${product._id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img 
                                src={product.image.startsWith('http') ? product.image : (product.image.startsWith('uploads/') ? `http://localhost:5000/${product.image}` : (product.image.startsWith('/') ? product.image : `/${product.image}`))} 
                                alt={product.title} 
                                className="product-image" 
                            />
                        </div>
                        {isFeatured && (
                            <div 
                                className="select-options-overlay" 
                                onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="overlay-text">Select Options</span>
                                <img src="/assets/right-arrow.svg" alt="Arrow" className="arrow-icon" />
                            </div>
                        )}
                    </div>

                    {/* Back Face */}
                    <div className="card-back" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
                        <div className="card-back-content">
                            <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#d4af37', fontWeight: 600, display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                                {product.brand || 'STYLORA'}
                            </span>
                            <h4 className="back-title">{product.title}</h4>
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <span className="back-price">₹{product.price}</span>
                                {hasDiscount && (
                                    <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '11px' }}>₹{product.originalPrice}</span>
                                )}
                            </div>
                            
                            <div className="product-options">
                                <div className="option-label">Select Size</div>
                                <div className="size-options">
                                    {availableSizes.map(sz => (
                                        <span 
                                            key={sz} 
                                            className={`size-pill ${selectedSize === sz ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedSize(sz); }}
                                        >
                                            {sz}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="option-label">Select Color</div>
                                <div className="color-options">
                                    {availableColors.map(col => (
                                        <span 
                                            key={col.name} 
                                            className={`color-dot ${selectedColor === col.name ? 'active' : ''}`}
                                            style={{ backgroundColor: col.hex, border: col.name === 'White' ? '1px solid #ddd' : 'none' }}
                                            title={col.name}
                                            onClick={(e) => { e.stopPropagation(); setSelectedColor(col.name); }}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                            
                            <button className="quick-add-btn" onClick={handleQuickAdd}>Quick Add</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="product-info">
                <span className="product-card-brand" style={{ fontSize: '9px', letterSpacing: '0.05em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                    {product.brand || 'STYLORA'}
                </span>
                <h3 
                    className="product-title" 
                    onClick={() => navigate(`/product/${product._id}`)}
                    style={{ cursor: 'pointer' }}
                >
                    {product.title}
                </h3>
                <div className="d-flex align-items-center gap-2">
                    <span className="product-price">₹{product.price}</span>
                    {hasDiscount && (
                        <>
                            <span className="product-original-price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>₹{product.originalPrice}</span>
                            <span className="product-discount-badge" style={{ color: '#d4af37', fontSize: '11px', fontWeight: 600 }}>({discountPercentage}% OFF)</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
