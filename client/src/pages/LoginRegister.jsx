import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
    const { login, register, user } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/account');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            if (isLogin) {
                await login(email, password);
                alert('Login successful!');
            } else {
                await register(name, email, password);
                alert('Registration successful!');
            }
            navigate('/account');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Authentication failed. Please check credentials.');
        }
    };

    return (
        <main className="cart-main" style={{ paddingTop: '130px' }}>
            <section style={{ padding: '60px 0 100px 0' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-5">
                            <div className="p-5" style={{ border: '1px solid #eee', backgroundColor: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                             <div className="d-flex justify-content-center mb-4" style={{ gap: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                                <button 
                                    type="button"
                                    style={{ 
                                        color: isLogin ? '#000' : '#888', 
                                        fontWeight: isLogin ? 700 : 500,
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: isLogin ? '2px solid #000' : 'none',
                                        fontSize: '15px',
                                        padding: '5px 15px',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-primary)'
                                    }}
                                    onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                                >
                                    LOGIN
                                </button>
                                <button 
                                    type="button"
                                    style={{ 
                                        color: !isLogin ? '#000' : '#888', 
                                        fontWeight: !isLogin ? 700 : 500,
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: !isLogin ? '2px solid #000' : 'none',
                                        fontSize: '15px',
                                        padding: '5px 15px',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-primary)'
                                    }}
                                    onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                                >
                                    REGISTER
                                </button>
                            </div>

                            {errorMsg && <div className="alert alert-danger py-2" style={{ fontSize: '13px', borderRadius: 0 }}>{errorMsg}</div>}

                            <form onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <div className="form-group mb-3">
                                        <label className="mb-1" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full Name</label>
                                        <input 
                                            type="text" 
                                            className="account-input" 
                                            placeholder="e.g. Rahul Menon"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required 
                                        />
                                    </div>
                                )}
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
                                <div className="form-group mb-3">
                                    <label className="mb-1" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className="account-input" 
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required 
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '4px'
                                            }}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="text-end mb-3">
                                        <Link to="/forgot-password" style={{ fontSize: '12px', color: '#666' }}>Forgot Password?</Link>
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="checkout-btn mt-2"
                                >
                                    {isLogin ? 'LOGIN' : 'REGISTER'}
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

export default LoginRegister;
