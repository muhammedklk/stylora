import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';
import { productsData } from '../products-data';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [related, setRelated] = useState([]);
    const [bestsellers, setBestsellers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Black');
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
    
    // Review form inputs
    const [ratingInput, setRatingInput] = useState(5);
    const [commentInput, setCommentInput] = useState('');
    const [userNameInput, setUserNameInput] = useState('');

    // Accordions
    const [activeAccordion, setActiveAccordion] = useState('specifications');

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products/${id}`);
            const prod = res.data.product;
            if (!prod) {
                throw new Error('Product not found in API response');
            }
            setProduct(prod);
            setReviews(res.data.reviews || []);

            if (prod.sizes && prod.sizes.length > 0) {
                setSelectedSize(prod.sizes[0]);
            }
            if (prod.colors && prod.colors.length > 0) {
                setSelectedColor(prod.colors[0].name);
            }
            setMediaType('image'); // reset media tab on product change

            // Fetch related and bestsellers
            const allRes = await axios.get(`${API_URL}/products`);
            const allProducts = Array.isArray(allRes.data) ? allRes.data : [];

            // Related: same category, excluding current
            const rel = allProducts.filter(p => p.category === prod.category && p._id !== prod._id).slice(0, 4);
            setRelated(rel);

            // Bestsellers
            const bests = allProducts.filter(p => p.tags && p.tags.includes('Bestseller')).slice(0, 4);
            setBestsellers(bests);
        } catch (err) {
            console.warn('Error fetching product details, falling back to static local data:', err.message);
            const fallbackProd = productsData.find(p => p._id === id || String(p._id) === String(id));
            if (fallbackProd) {
                setProduct(fallbackProd);
                setReviews([]);

                if (fallbackProd.sizes && fallbackProd.sizes.length > 0) {
                    setSelectedSize(fallbackProd.sizes[0]);
                }
                if (fallbackProd.colors && fallbackProd.colors.length > 0) {
                    setSelectedColor(fallbackProd.colors[0].name);
                }
                setMediaType('image');

                // Filter related and bestsellers from fallback list
                const rel = productsData.filter(p => p.category === fallbackProd.category && p._id !== fallbackProd._id).slice(0, 4);
                setRelated(rel);

                const bests = productsData.filter(p => p.tags && p.tags.includes('Bestseller')).slice(0, 4);
                setBestsellers(bests);
            } else {
                setProduct(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product._id, 1, selectedSize, selectedColor);
        showToast(`${product.title} added to cart!`, 'success');
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart(product._id, 1, selectedSize, selectedColor);
        navigate('/cart');
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please login to leave a review.', 'error');
                return;
            }
            const res = await axios.post(`${API_URL}/products/${id}/reviews`, {
                rating: ratingInput,
                comment: commentInput,
                userName: userNameInput.trim() || 'Anonymous'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(prev => [res.data, ...prev]);
            setCommentInput('');
            setUserNameInput('');
            showToast('Review submitted successfully!', 'success');
            fetchProductDetails(); // refresh totals
        } catch (err) {
            console.error('Error adding review', err);
            showToast(err.response?.data?.message || 'Error submitting review', 'error');
        }
    };

    if (loading) {
        return <div className="container py-5 text-center">Loading product details...</div>;
    }

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <h2>Product Not Found</h2>
                <p>We couldn't find the product you're looking for. <Link to="/">Return Home</Link></p>
            </div>
        );
    }

    return (
        <main className="product-detail-main" style={{ paddingTop: '150px' }}>
            {/* Breadcrumbs */}
            <div className="container breadcrumbs-container">
                <span className="breadcrumb-item"><Link to="/">Home</Link></span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item"><Link to="/shop">Collection</Link></span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item active">{product.title}</span>
            </div>

            {/* Main Product Section */}
            <section className="product-view-section">
                <div className="container">
                    <div className="row product-view-grid">
                        {/* Left Side: Image / Video Display */}
                        <div className="col-md-6 product-image-display">
                            <div className="product-main-img-frame" style={{ position: 'relative', overflow: 'hidden' }}>
                                {mediaType === 'image' ? (
                                    <img 
                                        src={product.image.startsWith('http') ? product.image : (product.image.startsWith('uploads/') ? `http://localhost:5000/${product.image}` : (product.image.startsWith('/') ? product.image : `/${product.image}`))} 
                                        alt={product.title} 
                                        id="product-main-img" 
                                    />
                                ) : (
                                    product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                                        <iframe
                                            width="100%"
                                            height="450px"
                                            src={product.videoUrl.includes('embed') ? product.videoUrl : `https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || product.videoUrl.split('/').pop()}`}
                                            title="Product video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            style={{ borderRadius: '2px', minHeight: '400px' }}
                                        ></iframe>
                                    ) : (
                                        <video 
                                            controls 
                                            src={product.videoUrl.startsWith('http') ? product.videoUrl : (product.videoUrl.startsWith('uploads/') ? `http://localhost:5000/${product.videoUrl}` : (product.videoUrl.startsWith('/') ? product.videoUrl : `/${product.videoUrl}`))} 
                                            style={{ width: '100%', height: 'auto', maxHeight: '450px', borderRadius: '2px', display: 'block' }}
                                            autoPlay
                                            muted
                                        ></video>
                                    )
                                )}
                            </div>
                            {product.videoUrl && (
                                <div className="d-flex gap-2 justify-content-center mt-3">
                                    <button 
                                        type="button"
                                        onClick={() => setMediaType('image')}
                                        style={{
                                            padding: '8px 18px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: mediaType === 'image' ? '#111' : '#f5f5f5',
                                            color: mediaType === 'image' ? '#fff' : '#111',
                                            border: '1px solid #ccc',
                                            cursor: 'pointer',
                                            borderRadius: '2px',
                                            transition: 'all 0.2s',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        IMAGE PREVIEW
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setMediaType('video')}
                                        style={{
                                            padding: '8px 18px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: mediaType === 'video' ? '#111' : '#f5f5f5',
                                            color: mediaType === 'video' ? '#fff' : '#111',
                                            border: '1px solid #ccc',
                                            cursor: 'pointer',
                                            borderRadius: '2px',
                                            transition: 'all 0.2s',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        VIDEO DEMO
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Info & Config */}
                        <div className="col-md-6 product-info-display">
                            <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#d4af37', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                                {product.brand || 'STYLORA'}
                            </span>
                            <span className="product-info-cat">{product.category.toUpperCase()}</span>
                            <h1 className="product-info-title">{product.title}</h1>
                            
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <span className="product-info-price" style={{ margin: 0 }}>₹{product.price}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <>
                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px', fontWeight: 500 }}>₹{product.originalPrice}</span>
                                        <span style={{ color: '#d4af37', fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em', border: '1px solid #d4af37', padding: '2px 8px', borderRadius: '2px' }}>
                                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                            
                            <p className="product-info-desc">{product.description}</p>

                            {/* Configurators */}
                            <div className="product-config-block">
                                <div className="config-group">
                                    <label className="config-label">Select Size</label>
                                    <div className="config-options size-options-row">
                                        {(product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL']).map(sz => (
                                            <span 
                                                key={sz} 
                                                className={`config-size-pill ${selectedSize === sz ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(sz)}
                                            >
                                                {sz}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="config-group">
                                    <label className="config-label">Select Color</label>
                                    <div className="config-options color-dots-row">
                                        {(product.colors && product.colors.length > 0 ? product.colors : [
                                            { name: 'Black', hex: '#1a1a1a' },
                                            { name: 'Gray', hex: '#7a7a7a' },
                                            { name: 'Sand', hex: '#f4e1d2' }
                                        ]).map(col => (
                                            <span 
                                                key={col.name}
                                                className={`config-color-dot ${selectedColor === col.name ? 'active' : ''}`}
                                                style={{ backgroundColor: col.hex, border: col.name === 'White' ? '1px solid #ddd' : 'none' }}
                                                title={col.name}
                                                onClick={() => setSelectedColor(col.name)}
                                            ></span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Actions */}
                            <div className="product-actions">
                                <button className="add-to-cart-btn" onClick={handleAddToCart}>ADD TO CART</button>
                                <button className="buy-now-btn" onClick={handleBuyNow}>BUY NOW</button>
                            </div>

                            {/* Accordion Blocks */}
                            <div className="product-accordions">
                                <div className={`accordion-item ${activeAccordion === 'specifications' ? 'active' : ''}`}>
                                    <button 
                                        className="accordion-header" 
                                        onClick={() => setActiveAccordion(activeAccordion === 'specifications' ? '' : 'specifications')}
                                    >
                                        Specifications <span className="accordion-arrow"></span>
                                    </button>
                                    <div className="accordion-content">
                                        <ul>
                                            <li>Premium comfort fit with elasticated stretch</li>
                                            <li>100% spun heavyweight long-staple fibers</li>
                                            <li>Crafted and tailored dynamically for lifetime style</li>
                                            <li>Machine wash cold, tumble dry low</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className={`accordion-item ${activeAccordion === 'shipping' ? 'active' : ''}`}>
                                    <button 
                                        className="accordion-header" 
                                        onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? '' : 'shipping')}
                                    >
                                        Shipping & Returns <span className="accordion-arrow"></span>
                                    </button>
                                    <div className="accordion-content">
                                        <p>Enjoy free standard shipping on all orders across India. 14 days easy returns policy available if garments are unworn and tags remain intact.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Reviews Section */}
            <section className="product-reviews-section py-5" style={{ borderTop: '1px solid #eee', marginTop: '40px' }}>
                <div className="container">
                    <div className="row">
                        {/* Reviews list */}
                        <div className="col-md-7">
                            <h3 className="mb-4" style={{ fontFamily: 'var(--font-primary)', fontWeight: 600 }}>Customer Reviews ({reviews.length})</h3>
                            {reviews.length > 0 ? (
                                <div className="reviews-list">
                                    {reviews.map((rev, index) => (
                                        <div key={index} className="review-card py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <div className="d-flex justify-content-between mb-1">
                                                <strong style={{ fontSize: '14px' }}>{rev.userName}</strong>
                                                <span style={{ color: '#ffc107', fontSize: '12px' }}>
                                                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>{rev.comment}</p>
                                            <small style={{ color: '#aaa', fontSize: '11px' }}>{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999', fontSize: '14px' }}>No reviews yet. Be the first to leave a review!</p>
                            )}
                        </div>

                        {/* Submit review */}
                        <div className="col-md-5">
                            <div className="add-review-box p-4" style={{ backgroundColor: '#fafafa', border: '1px solid #eee' }}>
                                <h4 className="mb-3" style={{ fontFamily: 'var(--font-primary)', fontWeight: 600 }}>Leave a Review</h4>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="form-group mb-3">
                                        <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your Name</label>
                                        <input 
                                            type="text" 
                                            className="account-input" 
                                            placeholder="e.g. Rahul M." 
                                            value={userNameInput}
                                            onChange={(e) => setUserNameInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Rating</label>
                                        <select 
                                            className="account-input" 
                                            value={ratingInput}
                                            onChange={(e) => setRatingInput(Number(e.target.value))}
                                        >
                                            <option value="5">5 Stars - Excellent</option>
                                            <option value="4">4 Stars - Very Good</option>
                                            <option value="3">3 Stars - Good</option>
                                            <option value="2">2 Stars - Fair</option>
                                            <option value="1">1 Star - Poor</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Comment</label>
                                        <textarea 
                                            className="account-input" 
                                            rows="4" 
                                            placeholder="What did you think of the product?" 
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="checkout-btn" 
                                    >
                                        SUBMIT REVIEW
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Recommendations Grid */}
            {related.length > 0 && (
                <section className="related-section">
                    <div className="container">
                        <div className="section-divider-title">
                            <span className="section-tag">[ Recommendations ]</span>
                            <h2 className="sub-section-title">You May Also Like</h2>
                        </div>
                        <div className="shop-grid">
                            {related.map(prod => (
                                <ProductCard product={prod} key={prod._id} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Bestsellers Recommendations Grid */}
            {bestsellers.length > 0 && (
                <section className="related-section bestsellers-section">
                    <div className="container">
                        <div className="section-divider-title">
                            <span className="section-tag">[ Popular ]</span>
                            <h2 className="sub-section-title">Bestseller Products</h2>
                        </div>
                        <div className="shop-grid">
                            {bestsellers.map(prod => (
                                <ProductCard product={prod} key={prod._id} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default ProductDetails;
