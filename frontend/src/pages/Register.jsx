import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) return;
        setLoading(true);
        try {
            await authService.register(formData.name, formData.email, formData.password);
            navigate('/login');
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

                <h1 className="mb-4" style={{ color: '#7b59d0', fontWeight: 700, fontSize: '2rem' }}>Get Started</h1>

                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Full Name</label>
                        <div className="input-group border rounded-3 p-1">
                            <span className="input-group-text bg-transparent border-0"><User size={18} color="#9ca3af" /></span>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Email address</label>
                        <div className="input-group border rounded-3 p-1">
                            <span className="input-group-text bg-transparent border-0"><Mail size={18} color="#9ca3af" /></span>
                            <input
                                type="email"
                                className="form-control border-0 shadow-none"
                                placeholder="name@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-dark">Password</label>
                        <div className="input-group border rounded-3 p-1">
                            <span className="input-group-text bg-transparent border-0"><Lock size={18} color="#9ca3af" /></span>
                            <input
                                type="password"
                                className="form-control border-0 shadow-none"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button className={`go-btn-primary w-100 py-3 mb-4 ${(formData.name && formData.email && formData.password.length >= 6) ? 'active' : ''}`} disabled={loading || !formData.name || formData.password.length < 6}>
                        {loading ? 'Creating Account...' : 'Sign Up >'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-muted small">Already have an account? </span>
                    <Link to="/login" style={{ color: '#7b59d0', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
