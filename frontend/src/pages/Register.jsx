import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await authService.register(name, email, password);
            setSuccess('Registration successful! You can now login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register.');
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'var(--bg-primary)' }}>
            <div className="glass-card p-5" style={{ width: '450px' }}>
                <div className="text-center mb-4">
                    <h2 className="navbar-brand mb-2" style={{ fontSize: '2.2rem' }}>FXQuant Pro</h2>
                    <p className="text-secondary">Create your professional account</p>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--trade-loss)', color: 'var(--trade-loss)' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--trade-profit)', color: 'var(--trade-profit)' }}>
                        <CheckCircle size={18} />
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary"><User size={18} color="var(--text-muted)" /></span>
                            <input
                                type="text"
                                className="form-control dark-input"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary"><Mail size={18} color="var(--text-muted)" /></span>
                            <input
                                type="email"
                                className="form-control dark-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-dark border-secondary"><Lock size={18} color="var(--text-muted)" /></span>
                            <input
                                type="password"
                                className="form-control dark-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button className="btn btn-primary-custom w-100 py-3 mb-4" disabled={loading}>
                        {loading ? 'Creating Account...' : <><UserPlus size={18} className="me-2" /> Register</>}
                    </button>
                </form>

                <div className="text-center">
                    <span className="text-secondary">Already have an account? </span>
                    <Link to="/login" className="fw-bold">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
