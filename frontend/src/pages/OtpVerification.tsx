import React, { useState, useEffect } from 'react';
import { TickerNav } from '../components/TickerNav';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const OtpVerification = () => {
    const [code, setCode] = useState('');
    const [tempToken, setTempToken] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        if (token) setTempToken(token);
    }, []);

    const submitOtp = async () => {
        try {
            const config = tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {};
            const res = await axios.post(`${API_BASE}/api/auth/verify-totp`, { code }, config);
            localStorage.setItem('token', res.data.token);
            window.location.href = '/dashboard';
        } catch(err) {
            alert('Invalid TOTP Code!');
        }
    };

    return (
        <>
        <TickerNav />
        <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px' }}>
                <h2 style={{ marginBottom: '10px' }}>TOTP Security Layer</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14px' }}>Enter your 6-digit Google Authenticator OTP</p>
                <input type="text" value={code} onChange={e => setCode(e.target.value)} style={{ padding: '20px', fontSize: '28px', textAlign: 'center', letterSpacing: '12px', width: '250px', marginBottom: '25px', fontWeight: 'bold' }} maxLength={6} placeholder="000000" />
                <br/>
                <button onClick={submitOtp} className="btn btn-buy" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>Secure Login</button>
            </div>
        </div>
        </>
    )
}
