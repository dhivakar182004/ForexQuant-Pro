import React, { useState, useEffect } from 'react';
import { TickerNav } from '../components/TickerNav';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const OtpVerification = () => {
    const [code, setCode] = useState('');
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [newQrCode, setNewQrCode] = useState<string | null>(null);

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

    const regenerateOtp = async () => {
        try {
            const config = tempToken ? { headers: { Authorization: `Bearer ${tempToken}` } } : {};
            const res = await axios.post(`${API_BASE}/api/auth/regenerate-totp`, {}, config);
            setNewQrCode(res.data.qrCode);
            alert("New secret generated! Please scan the new QR code with your authenticator app.");
        } catch(err) {
            alert('Failed to regenerate TOTP secret. Please try again.');
        }
    };

    return (
        <>
        <TickerNav />
        <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="fq-card" style={{ textAlign: 'center', padding: '50px', width: '450px' }}>
                <h2 style={{ marginBottom: '10px' }}>TOTP Security Layer</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14px' }}>Enter your 6-digit Google Authenticator OTP</p>
                
                {newQrCode && (
                    <div style={{ marginBottom: '20px' }}>
                        <img src={newQrCode} alt="TOTP QR Code" style={{ width: '200px', height: '200px', borderRadius: '10px', border: '5px solid white' }} />
                        <p style={{ color: 'var(--fq-gold)', fontSize: '12px', marginTop: '10px' }}>Scan this new QR code in your Authenticator app</p>
                    </div>
                )}

                <input type="text" value={code} onChange={e => setCode(e.target.value)} style={{ padding: '20px', fontSize: '28px', textAlign: 'center', letterSpacing: '12px', width: '250px', marginBottom: '25px', fontWeight: 'bold', background: '#1a1a1a', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }} maxLength={6} placeholder="000000" />
                <br/>
                <button onClick={submitOtp} className="btn-fq btn-fq-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', marginBottom: '20px' }}>Secure Login</button>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Lost access to your authenticator app?</p>
                    <button onClick={regenerateOtp} className="btn-fq btn-fq-outline" style={{ color: 'var(--fq-gold)', borderColor: 'var(--fq-gold)', width: '100%', padding: '10px', fontSize: '14px' }}>Regenerate OTP Secret</button>
                </div>
            </div>
        </div>
        </>
    )
}
