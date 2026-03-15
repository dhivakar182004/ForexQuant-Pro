import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Validation
    const [errors, setErrors] = useState({ name: '', email: '', password: '' });

    const navigate = useNavigate();

    const validate = (name, value) => {
        if (name === 'name' && !value) return 'Name is required';
        if (name === 'email') {
            if (!value) return 'Email is required';
            if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        }
        if (name === 'password') {
            if (!value) return 'Password is required';
            if (value.length < 6) return 'Password must be at least 6 characters';
        }
        return '';
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const nErr = validate('name', formData.name);
        const eErr = validate('email', formData.email);
        const pErr = validate('password', formData.password);

        setErrors({ name: nErr, email: eErr, password: pErr });

        if (nErr || eErr || pErr) return;

        setLoading(true);
        setError('');
        try {
            await authService.register(formData.name, formData.email, formData.password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
            setLoading(false);
        }
    };

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card fade-in">
                <div className="text-center mb-4 mb-md-5">
                    <h2 style={{ color: '#7b59d0', fontWeight: 800, letterSpacing: '-1px' }}>GoCharting</h2>
                </div>

                <h1 className="mb-4" style={{ color: '#7b59d0', fontWeight: 700, fontSize: '1.8rem' }}>Get Started</h1>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small border-0" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} noValidate>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Full Name</label>
                        <div className={`input-group border rounded-3 p-1 ${errors.name ? 'border-danger' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><User size={18} color={errors.name ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type="text"
                                className="form-control border-0 shadow-none px-2"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: validate('name', e.target.value) });
                                }}
                            />
                        </div>
                        {errors.name && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{errors.name}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Email address</label>
                        <div className={`input-group border rounded-3 p-1 ${errors.email ? 'border-danger' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Mail size={18} color={errors.email ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type="email"
                                className="form-control border-0 shadow-none px-2"
                                placeholder="name@gmail.com"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: validate('email', e.target.value) });
                                }}
                            />
                        </div>
                        {errors.email && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{errors.email}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-dark">Password</label>
                        <div className={`input-group border rounded-3 p-1 ${errors.password ? 'border-danger' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Lock size={18} color={errors.password ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type="password"
                                className="form-control border-0 shadow-none px-2"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: validate('password', e.target.value) });
                                }}
                            />
                        </div>
                        {errors.password && <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{errors.password}</div>}
                    </div>

                    <button className={`go-btn-primary w-100 py-3 mb-4 ${(formData.name && formData.email && formData.password.length >= 6 && !errors.name && !errors.email && !errors.password) ? 'active' : ''}`} disabled={loading}>
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
