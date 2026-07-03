import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <main className="cart-main" style={{ paddingTop: '130px' }}>
            <section style={{ padding: '60px 0 100px 0' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-5">
                            <div className="p-5" style={{ border: '1px solid #eee', backgroundColor: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                <h3 className="text-center mb-3" style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, letterSpacing: '0.02em', fontSize: '20px' }}>Reset Password</h3>
                                
                                {!submitted ? (
                                    <form onSubmit={handleSubmit}>
                                        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginBottom: '20px' }}>
                                            Enter your email address and we'll send you a link to reset your password.
                                        </p>
                                        <div className="form-group mb-3">
                                            <label className="mb-1" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email Address</label>
                                            <input 
                                                type="email" 
                                                className="account-input" 
                                                placeholder="e.g. rahul@example.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required 
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="checkout-btn mt-3"
                                        >
                                            SEND RESET LINK
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center">
                                        <div className="alert alert-success" style={{ borderRadius: 0, fontSize: '13px' }}>
                                            A password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
                                        </div>
                                        <Link to="/login" className="checkout-btn mt-3" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                                            BACK TO LOGIN
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ForgotPassword;
