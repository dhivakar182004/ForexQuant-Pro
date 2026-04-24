import React, { useState } from 'react';
import axios from 'axios';
import { TickerNav } from '../components/TickerNav';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Login State
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signin`, { email, password });
      window.location.href = res.data.requiresTotp ? '/otp-verification' : '/dashboard';
    } catch(err) {
      alert("Invalid credentials! Please check your details.");
    }
  };

  const handleSendOtp = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/request-otp`, { emailOrPhone: email });
      setOtpSent(true);
      alert("OTP Sent! Check your phone/email.");
    } catch(err) {
      alert("Could not send OTP. Make sure you are registered.");
    }
  };

  const handleLoginOtp = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login-otp`, { emailOrPhone: email, otp: otpCode });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch(err) {
      alert("Invalid or expired OTP!");
    }
  };

  return (
    <>
      <TickerNav />
      <div style={{ height: 'calc(100vh - 40px)', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'url(/bull_bear_background.png)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 0 0 0 2000px rgba(10, 14, 23, 0.85)' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 60px', width: '450px', background: 'rgba(20, 24, 35, 0.65)' }}>
          <h2 className="gradient-text" style={{ fontSize: '36px', marginBottom: '10px' }}>ForexQuant Pro</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '35px', fontSize: '15px' }}>Institutional Grade Backtesting & Live Simulator</p>
          
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>EMAIL OR PHONE NUMBER</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email or +1 234..." style={{ width: '100%', marginBottom: '20px' }} disabled={otpSent} />
            
            {!isOtpMode ? (
              <>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SECURE PASSWORD</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', marginBottom: '25px' }} />
                <button onClick={handleLogin} className="btn btn-buy" style={{ width: '100%', fontSize: '16px' }}>Standard Sign In</button>
              </>
            ) : (
              <>
                {otpSent && (
                  <>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>6-DIGIT OTP CODE</label>
                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="000000" maxLength={6} style={{ width: '100%', marginBottom: '25px', textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }} />
                  </>
                )}
                
                {!otpSent ? (
                  <button onClick={handleSendOtp} className="btn btn-buy" style={{ width: '100%', fontSize: '16px' }}>Send Login OTP</button>
                ) : (
                  <button onClick={handleLoginOtp} className="btn btn-buy" style={{ width: '100%', fontSize: '16px' }}>Verify & Login</button>
                )}
              </>
            )}
            
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button onClick={() => { setIsOtpMode(!isOtpMode); setOtpSent(false); setOtpCode(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px' }}>
                {isOtpMode ? "Use Password Login Instead" : "Login with OTP (Passwordless)"}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Don't have an account? <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
