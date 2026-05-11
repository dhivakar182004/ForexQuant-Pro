import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpMessage, setDevOtpMessage] = useState('');
  
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signin`, { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = res.data.requiresTotp ? '/otp-verification' : '/dashboard';
    } catch(err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Invalid credentials! Please check your details.";
      alert(`Login failed: ${errorMsg}`);
    }
  };

  const handleSendOtp = async () => {
    try {
      setDevOtpMessage('');
      const res = await axios.post(`${API_BASE}/api/auth/request-otp`, { emailOrPhone: email });
      setOtpSent(true);
      if (res.data.devOtp) {
          setDevOtpMessage(`[Simulator] Your OTP code is: ${res.data.devOtp}`);
          setOtpCode(res.data.devOtp); // Auto-fill for convenience
      }
    } catch(err: any) {
      if (err.response?.status === 404) {
          alert("Phone number not registered. Please create an account first.");
      } else {
          alert("Could not send OTP. Please try again.");
      }
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
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div className="dynamic-bg"></div>
      
      {/* Header */}
      <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--exness-yellow)', borderRadius: '2px' }}></div>
              <span style={{ fontWeight: '700', fontSize: '28px', letterSpacing: '-0.5px' }}>ForexQuant Pro</span>
          </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px' }}>
        <div className="exness-card animate-up" style={{ width: '400px', padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Sign in</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Enter your credentials to continue to Terminal</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isOtpMode ? "PHONE NUMBER OR EMAIL" : "EMAIL OR PHONE"}
              </label>
              <input 
                type="text" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder={isOtpMode ? "+1 234 567 8900" : "email@example.com"} 
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }} 
                disabled={otpSent} 
              />
            </div>
            
            {!isOtpMode ? (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>PASSWORD</label>
                    <a href="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '11px', textDecoration: 'none' }}>Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Enter password"
                    maxLength={8}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }} 
                  />
                </div>
                <button onClick={handleLogin} className="btn-exness btn-exness-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>Continue</button>
              </>
            ) : (
              <>
                {otpSent && (
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>OTP CODE</label>
                    <input 
                      type="text" 
                      value={otpCode} 
                      onChange={e => setOtpCode(e.target.value)} 
                      placeholder="000000" 
                      maxLength={6} 
                      style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold', color: '#fff' }} 
                    />
                  </div>
                )}
                
                {!otpSent ? (
                  <button onClick={handleSendOtp} className="btn-exness btn-exness-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>Send Verification Code</button>
                ) : (
                  <>
                    <button onClick={handleLoginOtp} className="btn-exness btn-exness-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>Verify and Continue</button>
                    {devOtpMessage && (
                      <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(0, 200, 83, 0.1)', color: 'var(--success)', borderRadius: '4px', textAlign: 'center', fontSize: '13px', border: '1px solid var(--success)', fontWeight: '600' }}>
                        {devOtpMessage}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            
            <button 
              onClick={() => { setIsOtpMode(!isOtpMode); setOtpSent(false); setOtpCode(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--exness-yellow)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', marginTop: '10px' }}
            >
              {isOtpMode ? "Sign in with password" : "Sign in with phone code"}
            </button>
          </div>
          
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Not a member? </span>
            <a href="/register" style={{ color: 'var(--exness-yellow)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}
