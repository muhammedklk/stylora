import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const About = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();

    const getHeroBg = (img) => {
        if (!img) return undefined;
        const resolved = img.startsWith('http') 
            ? img 
            : (img.startsWith('uploads/') ? `http://localhost:5000/${img}` : (img.startsWith('/') ? img : `/${img}`));
        return `url("${resolved}")`;
    };

    return (
        <div>
            {/* About Hero Section */}
            <section className="about-hero" style={{ backgroundImage: getHeroBg(settings?.aboutHeroImage) }}>
                <div className="about-hero-overlay"></div>
                <div className="about-hero-content">
                    <span className="about-hero-tag">[ Our Story ]</span>
                    <h1 className="about-hero-title">Style meets substance.</h1>
                    <p className="about-hero-subtitle">Redefining modern menswear with timeless simplicity, premium materials, and thoughtful design.</p>
                </div>
            </section>

            {/* The Vision (Split Section) */}
            <section className="about-split">
                <div className="container">
                    <div className="row about-split-grid">
                        <div className="col-md-6 about-split-text-col">
                            <span className="section-tag">[ The Vision ]</span>
                            <h2 className="about-split-title">{settings.aboutTitle || 'Free-spirited fashion for the modern man.'}</h2>
                            <p className="about-split-desc">{settings.aboutContent || 'We believe that dressing well should feel effortless. Stylora was born from a desire to bridge the gap between high-end catalog design and relatable, everyday comfort.'}</p>
                            <p className="about-split-desc">{settings.aboutSubContent || 'Our garments are crafted to move with you, bringing together minimal aesthetics and maximum utility. We exemplify premium quality without the premium markups, offered in conveniently located, friendly spaces.'}</p>
                        </div>
                        <div className="col-md-6 about-split-img-col">
                            <div className="about-img-frame">
                                <img src="/assets/find-section-img-1.png" alt="Styleora Vision" className="about-img" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Philosophy (3 columns) */}
            <section className="about-philosophy">
                <div className="container">
                    <div className="about-philosophy-header">
                        <span className="section-tag">[ Core Pillars ]</span>
                        <h2 className="about-philosophy-title">Our Philosophy</h2>
                    </div>

                    <div className="row about-philosophy-grid">
                        {/* Pillar 1 */}
                        <div className="col-md-4 philosophy-card">
                            <h3 className="pillar-title">Minimalism</h3>
                            <p className="pillar-desc">Clean lines, neutral tones, and simple silhouettes. We focus on creating versatile essentials that integrate seamlessly into any wardrobe.</p>
                        </div>
                        {/* Pillar 2 */}
                        <div className="col-md-4 philosophy-card">
                            <h3 className="pillar-title">Craftsmanship</h3>
                            <p className="pillar-desc">Every stitch, button, and seam is carefully considered. We select premium fabrics that feel luxurious and are designed to stand the test of time.</p>
                        </div>
                        {/* Pillar 3 */}
                        <div className="col-md-4 philosophy-card">
                            <h3 className="pillar-title">Relatability</h3>
                            <p className="pillar-desc">High fashion shouldn't feel exclusive or cold. We design relatable, welcoming styles that allow you to express your individual personality.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Designed for Motion (Split Section, inverted layout) */}
            <section className="about-split split-inverted">
                <div className="container">
                    <div className="row about-split-grid">
                        <div className="col-md-6 about-split-img-col">
                            <div className="about-img-frame">
                                <img src="/assets/find-section-img-3.png" alt="Styleora Motion" className="about-img" />
                            </div>
                        </div>
                        <div className="col-md-6 about-split-text-col">
                            <span className="section-tag">[ The Process ]</span>
                            <h2 className="about-split-title">Crafted for everyday utility.</h2>
                            <p className="about-split-desc">From our essential hoodies to tailored utility pants, our pieces undergo rigorous testing to ensure comfort, fit, and durability under any conditions.</p>
                            <p className="about-split-desc">We pay absolute attention to the micro-details: dynamic colorways, elasticated fits, functional pocket systems, and breathability. It's not just fashion; it's apparel designed for life in motion.</p>
                            <button className="shop-story-btn" onClick={() => navigate('/')}>Explore Bestsellers</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
