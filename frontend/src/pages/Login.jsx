import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Validation
    const [emailError, setEmailError] = useState('');
    const [passError, setPassError] = useState('');

    const navigate = useNavigate();

    const validateEmail = (val) => {
        if (!val) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email format';
        return '';
    };

    const validatePass = (val) => {
        if (!val) return 'Password is required';
        if (val.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const eErr = validateEmail(email);
        const pErr = validatePass(password);

        setEmailError(eErr);
        setPassError(pErr);

        if (eErr || pErr) return;

        setLoading(true);
        setError('');
        try {
            await authService.login(email, password);
            navigate('/terminal');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card fade-in">
                <div className="text-center mb-4 mb-md-5">
                    <h2 style={{ color: '#7b59d0', fontWeight: 800, letterSpacing: '-1px' }}>GoCharting</h2>
                </div>

                <h1 className="mb-4" style={{ color: '#7b59d0', fontWeight: 700, fontSize: '1.8rem' }}>Sign In</h1>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small border-0" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3 mb-md-4">
                        <label className="form-label small fw-bold text-dark">Email address</label>
                        <div className={`input-group border rounded-3 p-1 ${emailError ? 'border-danger' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Mail size={18} color={emailError ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type="email"
                                className="form-control border-0 shadow-none px-2"
                                placeholder="name@gmail.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(validateEmail(e.target.value));
                                }}
                            />
                        </div>
                        {emailError && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{emailError}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label small fw-bold text-dark">Password</label>
                        <div className={`input-group border rounded-3 p-1 ${passError ? 'border-danger' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Lock size={18} color={passError ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type={showPass ? "text" : "password"}
                                className="form-control border-0 shadow-none px-2"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passError) setPassError(validatePass(e.target.value));
                                }}
                            />
                            <button type="button" className="btn bg-transparent border-0 px-2" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                            </button>
                        </div>
                        {passError && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{passError}</div>}
                    </div>

                    <div className="text-end mb-4">
                        <Link to="#" style={{ color: '#7b59d0', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Forgot your password?</Link>
                    </div>

                    <button className={`go-btn-primary w-100 py-3 mb-4 ${(email && password && !emailError && !passError) ? 'active' : ''}`} disabled={loading}>
                        {loading ? 'Continuing...' : 'Continue >'}
                    </button>
                </form>

                <div className="text-center mb-3 text-muted small py-2 border-bottom position-relative">
                    <span className="px-2 bg-white" style={{ position: 'relative', top: '12px' }}>OR SIGN IN WITH</span>
                </div>

                <div className="row g-2 pt-2">
                    <div className="col-6">
                        <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2 small">
                            <img src="https://www.google.com/favicon.ico" width="16" alt="google" /> Google
                        </button>
                    </div>
                    <div className="col-6">
                        <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2 small">
                            <img src="https://www.apple.com/favicon.ico" width="16" alt="apple" /> Apple
                        </button>
                    </div>
                </div>

                <div className="text-center mt-4 mt-md-5">
                    <Link to="/register" style={{ color: '#7b59d0', textDecoration: 'none', fontWeight: 600 }}>Get started with a free account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
