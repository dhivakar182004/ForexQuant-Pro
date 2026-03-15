import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null); // 'google' or 'apple'
    const [showSocialModal, setShowSocialModal] = useState(false);
    const [error, setError] = useState('');

    // Validation
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const navigate = useNavigate();

    const validate = (name, value) => {
        if (name === 'email') {
            return !value ? 'Email is required' : !/\S+@\S+\.\S+/.test(value) ? 'Invalid email format' : '';
        }
        if (name === 'password') {
            return !value ? 'Password is required' : '';
        }
        return '';
    };

    const handleBlur = (name, value) => {
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const eErr = validate('email', email);
        const pErr = validate('password', password);

        setErrors({ email: eErr, password: pErr });
        setTouched({ email: true, password: true });

        if (eErr || pErr) return;

        setLoading(true);
        setError('');
        try {
            // In a high-security replica like GoCharting, login triggers an OTP
            await authService.login(email, password);
            await authService.sendOtp(email);
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            console.error(err);
            if (!err.response) {
                setError('Server is not reachable. Please check if your backend is running on port 8080.');
            } else {
                setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
            }
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        setSocialLoading(provider);
        setError('');
        setShowSocialModal(true);

        // Simulating the social OAuth flow for the GoCharting replica demo
        setTimeout(() => {
            if (provider === 'google') {
                // In a real app, you'd redirect to window.location.href = API_URL + 'oauth2/google'
                console.log('Redirecting to Google OAuth...');
                // Mock success for the replica feel
                localStorage.setItem('user', JSON.stringify({
                    name: 'Google User',
                    email: 'google@gmail.com',
                    token: 'mock-google-token'
                }));
                navigate('/terminal');
            } else if (provider === 'apple') {
                setError('Apple Sign-In is currently in sandbox mode. Please use Google or Email.');
                setSocialLoading(null);
                setShowSocialModal(false);
            }
        }, 2000);
    };

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card fade-in-up">
                <div className="text-center mb-5">
                    <h2 style={{ color: '#7b59d0', fontWeight: 800, letterSpacing: '-1px' }}>GoCharting</h2>
                </div>

                <h1 className="mb-4" style={{ color: '#7b59d0', fontWeight: 700, fontSize: '1.8rem' }}>Sign In</h1>

                {error && (
                    <div className="alert alert-danger d-flex align-items-start gap-2 py-3 mb-4 small border-0" style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
                        <AlertCircle size={18} className="mt-1 flex-shrink-0" />
                        <div>
                            <div className="fw-bold">Connection Issue</div>
                            {error}
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-dark">Email address</label>
                        <div className={`input-group border rounded-3 p-1 transition-all ${touched.email && errors.email ? 'border-danger shadow-sm' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Mail size={18} color={touched.email && errors.email ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type="email"
                                className="form-control border-0 shadow-none px-1"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (touched.email) setErrors({ ...errors, email: validate('email', e.target.value) });
                                }}
                                onBlur={(e) => handleBlur('email', e.target.value)}
                            />
                        </div>
                        {touched.email && errors.email && <div className="text-danger small mt-1 ps-1" style={{ fontSize: '0.7rem' }}>{errors.email}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label small fw-bold text-dark">Password</label>
                        <div className={`input-group border rounded-3 p-1 transition-all ${touched.password && errors.password ? 'border-danger shadow-sm' : ''}`}>
                            <span className="input-group-text bg-transparent border-0"><Lock size={18} color={touched.password && errors.password ? '#ef4444' : '#9ca3af'} /></span>
                            <input
                                type={showPass ? "text" : "password"}
                                className="form-control border-0 shadow-none px-1"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (touched.password) setErrors({ ...errors, password: validate('password', e.target.value) });
                                }}
                                onBlur={(e) => handleBlur('password', e.target.value)}
                            />
                            <button type="button" className="btn bg-transparent border-0 px-2" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                            </button>
                        </div>
                        {touched.password && errors.password && <div className="text-danger small mt-1 ps-1" style={{ fontSize: '0.7rem' }}>{errors.password}</div>}
                    </div>

                    <div className="text-end mb-4">
                        <Link to="#" style={{ color: '#7b59d0', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Forgot your password?</Link>
                    </div>

                    <button
                        type="submit"
                        className={`go-btn-primary w-100 py-3 mb-4 ${(email && password && !errors.email && !errors.password) ? 'active' : ''}`}
                        disabled={loading || socialLoading}
                    >
                        {loading ? <div className="d-flex align-items-center justify-content-center gap-2"><Loader2 size={18} className="animate-spin" /> Connecting...</div> : 'Sign In >'}
                    </button>
                </form>

                <div className="text-center mb-3 text-muted small py-2 border-bottom position-relative">
                    <span className="px-2 bg-white" style={{ position: 'relative', top: '12px' }}>OR SIGN IN WITH</span>
                </div>

                <div className="row g-2 pt-2">
                    <div className="col-6">
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2 small fw-medium"
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading || socialLoading}
                        >
                            {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <img src="https://www.google.com/favicon.ico" width="16" alt="google" />} Google
                        </button>
                    </div>
                    <div className="col-6">
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2 small fw-medium"
                            onClick={() => handleSocialLogin('apple')}
                            disabled={loading || socialLoading}
                        >
                            {socialLoading === 'apple' ? <Loader2 size={16} className="animate-spin" /> : <img src="https://www.apple.com/favicon.ico" width="16" alt="apple" />} Apple
                        </button>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <Link to="/register" style={{ color: '#7b59d0', textDecoration: 'none', fontWeight: 600 }}>Get started with a free account</Link>
                </div>
            </div>

            {/* Simulated Social Auth Modal */}
            {showSocialModal && (
                <div className="position-fixed inset-0 d-flex align-items-center justify-content-center z-max fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ width: '320px' }}>
                        <div className="spinner-border text-info mb-3" role="status"></div>
                        <h5 className="fw-bold">Connecting...</h5>
                        <p className="small text-muted mb-0">Authenticating with {socialLoading === 'google' ? 'Google' : 'Apple'}</p>
                    </div>
                </div>
            )}

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Login;
