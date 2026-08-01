import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { resolveImageUrl } from '../config';

const About = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [activePillar, setActivePillar] = useState(0);

    const getHeroBg = (img) => {
        if (!img) return undefined;
        return `url("${resolveImageUrl(img)}")`;
    };

    const pillars = [
        {
            num: "01",
            title: "Minimalist Aesthetics",
            subtitle: "Purity of form",
            desc: "Clean silhouettes, neutral earth tones, and uncompromised structural cuts. We create versatile staples designed to seamlessly integrate into any modern wardrobe without loud branding.",
            stat: "100% Timeless"
        },
        {
            num: "02",
            title: "Master Craftsmanship",
            subtitle: "Precision engineering",
            desc: "Every stitch, seam, and pocket placement undergoes rigorous quality audits. We collaborate with generational artisans to craft garments that hold their form season after season.",
            stat: "40+ Workshops"
        },
        {
            num: "03",
            title: "Architectural Utility",
            subtitle: "Apparel in motion",
            desc: "Fashion should never restrict motion. Our tailored trousers, hoodies, and outerwear feature elasticated waistbands, hidden zipper compartments, and ergonomic stretch weaves.",
            stat: "360° Comfort"
        },
        {
            num: "04",
            title: "Ethical Transparency",
            subtitle: "Sustainable future",
            desc: "From certified organic cotton to zero-waste packaging, we maintain 100% radical transparency across our global supply chain, eliminating middleman markups.",
            stat: "Zero Waste"
        }
    ];

    const materials = [
        {
            name: "Heavyweight Organic Cotton",
            detail: "380 GSM combed cotton spun for structural drape and pill-free durability.",
            tag: "SUSTAINABLE FABRIC",
            img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"
        },
        {
            name: "Spun Breathable Linen",
            detail: "Premium long-staple flax woven for lightweight airflow during warm summer days.",
            tag: "NATURAL WEAVE",
            img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"
        },
        {
            name: "Tailored Wool Blend",
            detail: "Insulated wool composite offering refined outerwear warmth with cinematic drape.",
            tag: "LUXURY TEXTILE",
            img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80"
        }
    ];

    return (
        <div className="about-page-wrapper light-theme" style={{ backgroundColor: '#faf9f6', color: '#111' }}>
            {/* 1. HERO BANNER */}
            <section className="cpage-hero" style={{ backgroundImage: getHeroBg(settings?.aboutHeroImage) }}>
                <div className="cpage-hero-overlay"></div>
                <div className="cpage-hero-inner">
                    <span className="cpage-hero-eyebrow">THE STYLORA NARRATIVE</span>
                    <h1 className="cpage-hero-title">Crafted for Motion.<br />Born to Endure.</h1>
                    <p className="cpage-hero-sub">
                        Redefining modern menswear through understated luxury, ethical craftsmanship, and relentless attention to architectural detail.
                    </p>
                </div>
            </section>

            {/* 2. ELEVATED STATS GRID */}
            <section className="about-stats" style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Certified Organic & Recycled Materials</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">40+</span>
                            <span className="stat-label">Artisanal Workshop Partners Worldwide</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">15K+</span>
                            <span className="stat-label">Global Community of Fashion Enthusiasts</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">0%</span>
                            <span className="stat-label">Compromise on Fit & Tailoring Quality</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. MANIFESTO & BRAND VISION */}
            <section className="about-split" style={{ padding: '120px 0' }}>
                <div className="container">
                    <div className="about-split-grid">
                        <div className="about-split-text-col">
                            <span className="section-tag">[ THE VISION ]</span>
                            <h2 className="about-split-title">
                                {settings?.aboutTitle || 'Free-spirited fashion for the modern individual.'}
                            </h2>
                            <p className="about-split-desc">
                                {settings?.aboutContent || 'We believe that dressing well should feel natural and effortless. STYLORA was born from a desire to eliminate the traditional markups of luxury fashion while maintaining absolute architectural purity in every garment.'}
                            </p>
                            <p className="about-split-desc">
                                {settings?.aboutSubContent || 'Our garments are engineered to move with you, bringing together minimal aesthetics and maximum everyday utility. We deliver luxury quality directly from artisanal looms to your personal wardrobe.'}
                            </p>
                            
                            <blockquote className="story-quote" style={{
                                marginTop: '30px',
                                paddingLeft: '24px',
                                borderLeft: '3px solid #c59b27',
                                fontStyle: 'italic',
                                fontSize: '16px',
                                color: '#333',
                                lineHeight: '1.6'
                            }}>
                                "High fashion shouldn't feel cold or exclusive. It should feel empowering, relatable, and built for real life."
                            </blockquote>
                        </div>
                        <div className="about-split-img-col">
                            <div className="about-img-frame">
                                <img 
                                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80" 
                                    alt="Stylora Editorial Vision" 
                                    className="about-img" 
                                />
                                <div className="about-img-overlay-glow"></div>
                                <div className="img-badge-overlay" style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    right: '20px',
                                    background: 'rgba(0,0,0,0.85)',
                                    color: '#fff',
                                    padding: '8px 16px',
                                    fontSize: '11px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    backdropFilter: 'blur(8px)'
                                }}>
                                    AUTUMN / WINTER 2026
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. INTERACTIVE PHILOSOPHY PILLARS */}
            <section className="about-pillars" style={{ background: '#ffffff', padding: '120px 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="container">
                    <div className="about-pillars-header" style={{ textAlign: 'center', marginBottom: '70px' }}>
                        <span className="section-tag">[ BRAND PHILOSOPHY ]</span>
                        <h2 className="about-pillars-title" style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                            Our Four Core Pillars
                        </h2>
                    </div>

                    <div className="about-pillars-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
                        {pillars.map((pillar, idx) => (
                            <div 
                                key={pillar.num} 
                                className={`pillar-card ${activePillar === idx ? 'active-pillar' : ''}`}
                                onMouseEnter={() => setActivePillar(idx)}
                                style={{
                                    background: activePillar === idx ? '#111111' : '#fcfbf9',
                                    color: activePillar === idx ? '#ffffff' : '#111111',
                                    padding: '45px 35px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: activePillar === idx ? '0 20px 40px rgba(0,0,0,0.15)' : 'none',
                                    transform: activePillar === idx ? 'translateY(-6px)' : 'none'
                                }}
                            >
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    color: activePillar === idx ? '#c59b27' : '#999999',
                                    marginBottom: '20px'
                                }}>
                                    {pillar.num} / {pillar.subtitle.toUpperCase()}
                                </div>
                                <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '16px' }}>{pillar.title}</h3>
                                <p style={{ fontSize: '14px', lineHeight: '1.7', opacity: activePillar === idx ? 0.9 : 0.75, marginBottom: '25px' }}>
                                    {pillar.desc}
                                </p>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    borderBottom: activePillar === idx ? '1px solid #c59b27' : '1px solid rgba(0,0,0,0.2)',
                                    paddingBottom: '4px',
                                    color: activePillar === idx ? '#c59b27' : '#555555'
                                }}>
                                    {pillar.stat}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. CRAFTSMANSHIP & MATERIALS SPOTLIGHT */}
            <section style={{ padding: '120px 0', background: '#faf9f6' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '70px' }}>
                        <span className="section-tag">[ TEXTILE EXCELLENCE ]</span>
                        <h2 style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '8px' }}>
                            Signature Materials
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {materials.map((item, index) => (
                            <div key={index} className="material-card" style={{
                                background: '#ffffff',
                                border: '1px solid #eaeaea',
                                overflow: 'hidden',
                                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
                            }}>
                                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                        src={item.img} 
                                        alt={item.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '15px',
                                        left: '15px',
                                        background: 'rgba(0,0,0,0.8)',
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        letterSpacing: '0.12em',
                                        padding: '4px 10px',
                                        borderRadius: '2px'
                                    }}>
                                        {item.tag}
                                    </span>
                                </div>
                                <div style={{ padding: '30px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>{item.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. BRAND EVOLUTION TIMELINE */}
            <section className="about-timeline" style={{ background: '#ffffff', padding: '120px 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="container">
                    <div className="timeline-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <span className="section-tag">[ EVOLUTION ]</span>
                        <h2 className="timeline-title" style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                            The STYLORA Journey
                        </h2>
                    </div>

                    <div className="timeline-container">
                        <div className="timeline-line"></div>
                        
                        <div className="timeline-item left">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content" style={{ background: '#faf9f6', padding: '30px', border: '1px solid #eaeaea' }}>
                                <span className="timeline-year" style={{ color: '#c59b27', fontWeight: 700 }}>2024</span>
                                <h4 className="timeline-item-title" style={{ fontSize: '18px', margin: '8px 0' }}>Conception & Spark</h4>
                                <p className="timeline-item-desc" style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                    STYLORA was founded with a singular mission: to challenge traditional luxury markups and make architectural menswear accessible.
                                </p>
                            </div>
                        </div>
                        
                        <div className="timeline-item right">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content" style={{ background: '#faf9f6', padding: '30px', border: '1px solid #eaeaea' }}>
                                <span className="timeline-year" style={{ color: '#c59b27', fontWeight: 700 }}>2025</span>
                                <h4 className="timeline-item-title" style={{ fontSize: '18px', margin: '8px 0' }}>Sustainable Pipeline</h4>
                                <p className="timeline-item-desc" style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                    Transitioned our entire production line to certified organic cotton and recycled fibers, achieving zero-plastic packaging.
                                </p>
                            </div>
                        </div>
                        
                        <div className="timeline-item left">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content" style={{ background: '#faf9f6', padding: '30px', border: '1px solid #eaeaea' }}>
                                <span className="timeline-year" style={{ color: '#c59b27', fontWeight: 700 }}>2026</span>
                                <h4 className="timeline-item-title" style={{ fontSize: '18px', margin: '8px 0' }}>Global Flagship Launch</h4>
                                <p className="timeline-item-desc" style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                    Expanded into global digital storefronts and physical experiential showrooms, serving discerning customers across 40+ countries.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. ARCHITECTURAL UTILITY & CALL TO ACTION */}
            <section className="about-split split-inverted" style={{ padding: '120px 0', background: '#111111', color: '#ffffff' }}>
                <div className="container">
                    <div className="about-split-grid">
                        <div className="about-split-img-col">
                            <div className="about-img-frame" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <img 
                                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80" 
                                    alt="Stylora Showroom" 
                                    className="about-img" 
                                />
                            </div>
                        </div>
                        <div className="about-split-text-col">
                            <span className="section-tag" style={{ color: '#c59b27' }}>[ ARCHITECTURAL UTILITY ]</span>
                            <h2 className="about-split-title" style={{ color: '#ffffff' }}>Crafted for life in motion.</h2>
                            <p className="about-split-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                From essential heavyweight hoodies to structured smart trousers, every piece in our collection undergoes multi-phase stress testing for fit, comfort, and longevity.
                            </p>
                            <p className="about-split-desc" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                Experience the intersection of minimalist aesthetics and everyday functionality.
                            </p>
                            <button 
                                className="shop-story-btn" 
                                onClick={() => navigate('/shop')}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#111111',
                                    border: '1px solid #ffffff',
                                    marginTop: '30px'
                                }}
                            >
                                EXPLORE THE COLLECTION <span className="arrow-span">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
