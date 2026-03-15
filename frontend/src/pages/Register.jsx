import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validation
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const navigate = useNavigate();

    const validate = (name, value) => {
        switch (name) {
            case 'name':
                return !value ? 'Full name is required' : '';
            case 'email':
                return !value ? 'Email is required' : !/\S+@\S+\.\S+/.test(value) ? 'Invalid email format' : '';
            case 'password':
                return !value ? 'Password is required' : value.length < 6 ? 'Min 6 characters required' : '';
            case 'confirmPassword':
                return !value ? 'Please confirm your password' : value !== formData.password ? 'Passwords do not match' : '';
            default:
                return '';
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Real-time validation if already touched
        if (touched[name]) {
            setErrors({ ...errors, [name]: validate(name, value) });
        }
        // Special case for password match when changing password
        if (name === 'password' && touched.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? 'Passwords do not match' : '' }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {
            name: validate('name', formData.name),
            email: validate('email', formData.email),
            password: validate('password', formData.password),
            confirmPassword: validate('confirmPassword', formData.confirmPassword)
        };

        setErrors(newErrors);
        setTouched({ name: true, email: true, password: true, confirmPassword: true });

        if (Object.values(newErrors).some(err => err !== '')) return;

        setLoading(true);
        setError('');
        try {
            await authService.register(formData.name, formData.email, formData.password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. The server might be unreachable.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="go-auth-bg">
                <div className="go-auth-card text-center p-5 fade-in">
                    <CheckCircle2 size={64} color="#00b894" className="mb-4 mx-auto" />
                    <h2 className="mb-3" style={{ fontWeight: 700 }}>Account Created!</h2>
                    <p className="text-muted">Redirecting you to the login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card fade-in">
                <div className="text-center mb-4">
                    <h2 style={{ color: '#7b59d0', fontWeight: 800, letterSpacing: '-1px' }}>GoCharting</h2>
                </div>

                <h1 className="mb-4" style={{ color: '#7b59d0', fontWeight: 700, fontSize: '1.8rem' }}>Get Started</h1>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4 small border-0" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} noValidate>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Full Name</label>
                        <div className={`input-group border rounded-3 p-1 transition-all ${touched.name && errors.name ? 'border-danger shadow-sm' : ''} ${touched.name && !errors.name ? 'border-success' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><User size={18} color={touched.name && errors.name ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                name="name"
                                type="text"
                                className="form-control border-0 shadow-none px-1"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </div>
                        {touched.name && errors.name && <div className="text-danger small mt-1 ps-1" style={{ fontSize: '0.7rem' }}>{errors.name}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Email address</label>
                        <div className={`input-group border rounded-3 p-1 transition-all ${touched.email && errors.email ? 'border-danger shadow-sm' : ''} ${touched.email && !errors.email ? 'border-success' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Mail size={18} color={touched.email && errors.email ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                name="email"
                                type="email"
                                className="form-control border-0 shadow-none px-1"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </div>
                        {touched.email && errors.email && <div className="text-danger small mt-1 ps-1" style={{ fontSize: '0.7rem' }}>{errors.email}</div>}
                    </div>

                    <div className="row g-2 mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label small fw-bold text-dark">Password</label>
                            <div className={`input-group border rounded-3 p-1 transition-all ${touched.password && errors.password ? 'border-danger' : ''} ${touched.password && !errors.password ? 'border-success' : ''}`}>
                                <span className="input-group-text bg-transparent border-0"><Lock size={18} color={touched.password && errors.password ? '#ef4444' : '#9ca3af'} /></span>
                                <input
                                    name="password"
                                    type="password"
                                    className="form-control border-0 shadow-none px-1"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                            {touched.password && errors.password && <div className="text-danger small mt-1 ps-1" style={{ fontSize: '0.7rem' }}>{errors.password}</div>}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-dark">Confirm Password</label>
                            <div className={`input-group border rounded-3 p-1 transition-all ${touched.confirmPassword && errors.confirmPassword ? 'border-danger' : ''} ${touched.confirmPassword && !errors.confirmPassword ? 'border-success' : ''}`}>
                                <span className="input-group-text bg-transparent border-0"><ShieldCheck size={18} color={touched.confirmPassword && errors.confirmPassword ? '#ef4444' : '#9ca3af'} /></span>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    className="form-control border-0 shadow-none px-1"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && <div className="text-danger small mt-1 ps-1" style={{ fontSize: '0.7rem' }}>{errors.confirmPassword}</div>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`go-btn-primary w-100 py-3 mb-4 ${(!Object.values(errors).some(x => x !== '') && formData.confirmPassword) ? 'active' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Create Account >'}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-muted small">Already have an account? </span>
                    <Link to="/login" style={{ color: '#7b59d0', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>

            <style>{`
                .transition-all { transition: all 0.2s ease-in-out; }
                .border-danger { border-color: #ef4444 !important; }
                .border-success { border-color: #00b894 !important; }
                @media (max-width: 768px) {
                    .go-auth-card { margin: 0; border-radius: 0; min-height: 100vh; overflow-y: auto; padding: 2rem 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Register;
