import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation States
    const [emailTouched, setEmailTouched] = useState(false);
    const [passTouched, setPassTouched] = useState(false);

    const navigate = useNavigate();

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };

    const isEmailValid = validateEmail(email);
    const isPassValid = password.length >= 6;

    const handleLogin = async (e) => {
        e.preventDefault();
        setEmailTouched(true);
        setPassTouched(true);

        if (!isEmailValid || !isPassValid) return;

        setError('');
        setLoading(true);
        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Technical error: Invalid credentials or server offline.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg px-3">
            <div className="glass-card p-4 p-md-5 auth-card fade-in">
                <div className="text-center mb-4">
                    <h2 className="mb-1" style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.04em' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>FX</span>Quant
                    </h2>
                    <p className="text-muted small">Sign in to continue</p>
                </div>

                {error && (
                    <div className="alert border-0 p-2 mb-4 d-flex align-items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--trade-loss)', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3">
                        <label className="form-label mb-1">Email</label>
                        <div className="position-relative">
                            <input
                                type="email"
                                className={`form-control dark-input ${emailTouched && !isEmailValid ? 'is-invalid' : ''} ${emailTouched && isEmailValid ? 'is-valid-custom' : ''}`}
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setEmailTouched(true)}
                            />
                            {emailTouched && isEmailValid && <CheckCircle2 size={16} className="position-absolute end-0 top-50 translate-middle-y me-2 text-success" />}
                        </div>
                        {emailTouched && !isEmailValid && <div className="invalid-feedback">Please enter a valid email address.</div>}
                    </div>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between">
                            <label className="form-label mb-1">Password</label>
                            <Link to="#" className="small text-muted text-decoration-none hover-cyan">Forgot?</Link>
                        </div>
                        <div className="position-relative">
                            <input
                                type="password"
                                className={`form-control dark-input ${passTouched && !isPassValid ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setPassTouched(true)}
                            />
                        </div>
                        {passTouched && !isPassValid && <div className="invalid-feedback">Password must be at least 6 characters.</div>}
                    </div>

                    <button className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : <><LogIn size={18} /> Sign In</>}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-muted small">New to FXQuant? </span>
                    <Link to="/register" className="small fw-bold text-decoration-none" style={{ color: 'var(--accent-primary)' }}>Create Account</Link>
                </div>
            </div>

            <style>{`
        .is-valid-custom { border-color: var(--trade-profit) !important; }
        .hover-cyan:hover { color: var(--accent-primary) !important; }
        .auth-card { box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
      `}</style>
        </div>
    );
};

export default Login;
