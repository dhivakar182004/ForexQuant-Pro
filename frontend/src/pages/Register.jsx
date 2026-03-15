import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

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
        if (touched[name]) {
            setErrors({ ...errors, [name]: validate(name, value) });
        }
        if (name === 'password' && touched.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? 'Passwords do not match' : '' }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

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
            await authService.sendOtp(formData.email);
            setSuccess(true);
            setTimeout(() => navigate('/verify-otp', { state: { email: formData.email } }), 2000);
        } catch (err) {
            console.error(err);
            if (!err.response) {
                setError('Server is not reachable. Ensure the backend container is running.');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Try again.');
            }
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="go-auth-bg">
                <div className="go-auth-card text-center p-5 fade-in">
                    <CheckCircle2 size={64} color="#00b894" className="mb-4 mx-auto pulse" />
                    <h2 className="mb-3" style={{ fontWeight: 700 }}>Account Created!</h2>
                    <p className="text-muted">Redirecting you to the login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card fade-in-up">
                <div className="text-center mb-4">
                    <h2 style={{ color: 'var(--fq-accent)', fontWeight: 800, letterSpacing: '-1px' }}>ForexQuant Pro</h2>
                </div>

                <h1 className="mb-4" style={{ color: 'var(--fq-accent)', fontWeight: 700, fontSize: '1.8rem' }}>Get Started</h1>

                {error && (
                    <div className="alert alert-danger d-flex align-items-start gap-2 py-3 mb-4 small border-0" style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
                        <AlertCircle size={18} className="mt-1 flex-shrink-0" />
                        <div>
                            <div className="fw-bold">Connection Issue</div>
                            {error}
                        </div>
                    </div>
                )}

                <form onSubmit={handleRegister} noValidate>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Full Name</label>
                        <div className={`input-group border rounded-3 p-1 transition-all ${touched.name && errors.name ? 'border-danger shadow-sm' : ''}`}>
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
                        <div className={`input-group border rounded-3 p-1 transition-all ${touched.email && errors.email ? 'border-danger shadow-sm' : ''}`}>
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
                            <div className={`input-group border rounded-3 p-1 transition-all ${touched.password && errors.password ? 'border-danger' : ''}`}>
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
                            <div className={`input-group border rounded-3 p-1 transition-all ${touched.confirmPassword && errors.confirmPassword ? 'border-danger' : ''}`}>
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
                        {loading ? <div className="d-flex align-items-center justify-content-center gap-2"><Loader2 size={18} className="animate-spin" /> Verifying...</div> : 'Create Account >'}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-muted small">Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--fq-accent)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Register;
