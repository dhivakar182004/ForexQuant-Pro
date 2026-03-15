import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);
        }
    };

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card">
                <div className="text-center mb-5">
                    <h2 style={{ color: '#7b59d0', fontWeight: 800, letterSpacing: '-1px' }}>GoCharting</h2>
                </div>

                <h1 className="mb-4" style={{ color: '#7b59d0', fontWeight: 700, fontSize: '2rem' }}>Sign In</h1>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-dark">Email address</label>
                        <div className="input-group border rounded-3 p-1">
                            <span className="input-group-text bg-transparent border-0"><Mail size={18} color="#9ca3af" /></span>
                            <input
                                type="email"
                                className="form-control border-0 shadow-none"
                                placeholder="name@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="form-label small fw-bold text-dark">Password</label>
                        <div className="input-group border rounded-3 p-1">
                            <span className="input-group-text bg-transparent border-0"><Lock size={18} color="#9ca3af" /></span>
                            <input
                                type="password"
                                className="form-control border-0 shadow-none"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="button" className="btn bg-transparent border-0" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                            </button>
                        </div>
                    </div>

                    <div className="text-end mb-4">
                        <Link to="#" style={{ color: '#7b59d0', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Forgot your password?</Link>
                    </div>

                    <button className={`go-btn-primary w-100 py-3 mb-4 ${(email && password) ? 'active' : ''}`} disabled={loading || !email || !password}>
                        {loading ? 'Continuing...' : 'Continue >'}
                    </button>
                </form>

                <div className="text-center mb-4 text-muted small py-2 border-bottom position-relative">
                    <span className="px-2 bg-white" style={{ position: 'relative', top: '12px' }}>OR SIGN IN WITH</span>
                </div>

                <div className="row g-2 pt-2">
                    <div className="col-6">
                        <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                            <img src="https://www.google.com/favicon.ico" width="16" alt="google" /> Google
                        </button>
                    </div>
                    <div className="col-6">
                        <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                            <img src="https://www.apple.com/favicon.ico" width="16" alt="apple" /> Apple
                        </button>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <Link to="/register" style={{ color: '#7b59d0', textDecoration: 'none', fontWeight: 600 }}>Get started with a free account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
