import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const OtpVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(59);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'your@email.com';

    const inputRefs = useRef([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return;

        setLoading(true);
        setError('');
        try {
            await authService.verifyOtp(email, code);
            navigate('/terminal');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setLoading(true);
        try {
            await authService.sendOtp(email);
            setTimer(59);
            setError('');
        } catch (err) {
            setError('Failed to resend OTP. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="go-auth-bg">
            <div className="go-auth-card fade-in-up">
                <button
                    onClick={() => navigate(-1)}
                    className="btn border-0 p-0 text-muted mb-4 d-flex align-items-center gap-2 small fw-medium"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="text-center mb-4">
                    <div className="bg-brand-light d-inline-flex p-3 rounded-circle mb-3">
                        <Mail size={32} color="var(--fq-accent)" />
                    </div>
                    <h2 style={{ fontWeight: 800 }}>Verify your email</h2>
                    <p className="text-muted small px-4">
                        We've sent a 6-digit code to <span className="fw-bold text-dark">{email}</span>.
                        Enter it below to continue.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4 small border-0" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleVerify}>
                    <div className="d-flex justify-content-between gap-2 mb-4 px-1">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                className="form-control text-center p-0"
                                style={{
                                    width: '45px',
                                    height: '54px',
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    borderRadius: '8px',
                                    border: '2px solid #e5e7eb',
                                    background: '#f9fafb'
                                }}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onFocus={(e) => e.target.select()}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className={`go-btn-primary w-100 py-3 mb-4 ${otp.join('').length === 6 ? 'active' : ''}`}
                        disabled={loading || otp.join('').length < 6}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin mx-auto" strokeWidth={3} /> : 'Verify Account >'}
                    </button>
                </form>

                <div className="text-center mt-2">
                    <p className="small text-muted mb-0">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0 || loading}
                        className={`btn btn-link p-0 small fw-bold text-decoration-none ${timer > 0 ? 'text-muted' : ''}`}
                        style={{ color: timer > 0 ? '' : 'var(--fq-accent)' }}
                    >
                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                    </button>
                </div>
            </div>

            <style>{`
                .bg-brand-light { background: var(--fq-accent-light); }
                .animate-spin { animation: spin 1s linear infinite; }
                input:focus { border-color: var(--fq-accent) !important; outline: none; background: #fff !important; box-shadow: 0 0 0 4px var(--fq-accent-light) !important; }
            `}</style>
        </div>
    );
};

export default OtpVerification;
