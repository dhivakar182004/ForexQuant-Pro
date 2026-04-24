import React, { useState } from 'react';
import axios from 'axios';
import { TickerNav } from '../components/TickerNav';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signin`, { email, password });
      window.location.href = res.data.requiresTotp ? '/otp-verification' : '/dashboard';
    } catch(err) {
      alert("Invalid credentials! Please check your details.");
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
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>ACCOUNT EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" style={{ width: '100%', marginBottom: '20px' }} />
            
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SECURE PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', marginBottom: '25px' }} />
            
            <button onClick={handleLogin} className="btn btn-buy" style={{ width: '100%', fontSize: '16px' }}>Standard Sign In</button>
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Don't have an account? <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
