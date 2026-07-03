import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        try {
            await login(email, password);
            alert('Admin login successful!');
            navigate('/admin/dashboard');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Invalid credentials or access denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="cart-main" style={{ paddingTop: '130px', backgroundColor: '#0a0a0a', minHeight: '90vh' }}>
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-4">
                            <div className="p-5" style={{ 
                                border: '1px solid rgba(255, 255, 255, 0.08)', 
                                backgroundColor: '#121212', 
                                color: '#fff',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}>
                                <div className="text-center mb-4">
                                    <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#d4af37', textTransform: 'uppercase', fontWeight: 600 }}>STYLORA Store Suite</span>
                                    <h3 className="mt-2 mb-4" style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, letterSpacing: '0.02em', fontSize: '22px' }}>Admin Workspace</h3>
                                </div>

                                {errorMsg && (
                                    <div className="alert alert-danger py-2" style={{ fontSize: '13px', borderRadius: 0, backgroundColor: 'rgba(255, 77, 77, 0.1)', borderColor: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d' }}>
                                        {errorMsg}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <label className="mb-1" style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Admin Email</label>
                                        <input 
                                            type="email" 
                                            className="account-input" 
                                            placeholder="admin@styleora.in"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required 
                                            style={{ backgroundColor: '#181818', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label className="mb-1" style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Secret Password</label>
                                        <input 
                                            type="password" 
                                            className="account-input" 
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required 
                                            style={{ backgroundColor: '#181818', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="checkout-btn"
                                        style={{ 
                                            backgroundColor: '#d4af37', 
                                            color: '#000', 
                                            fontWeight: 700, 
                                            border: 'none',
                                            padding: '16px 0',
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? 'AUTHENTICATING...' : 'ENTER SUITE'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AdminLogin;
