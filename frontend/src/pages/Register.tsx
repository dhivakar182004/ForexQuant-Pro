import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Register = () => {
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', phoneNumber: '' });

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await axios.post(`${API_BASE}/api/auth/signup`, { 
                email: formData.email, 
                password: formData.password,
                phoneNumber: formData.phoneNumber
            });
            alert("Registration successful! Please log in.");
            window.location.href = '/login';
        } catch(err) {
            alert("Registration failed. Email or Phone may already be in use.");
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
          <div className="dynamic-bg"></div>
          
          <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--exness-yellow)', borderRadius: '2px' }}></div>
                  <span style={{ fontWeight: '700', fontSize: '28px', letterSpacing: '-0.5px' }}>ForexQuant Pro</span>
              </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px' }}>
            <div className="exness-card animate-up" style={{ width: '450px', padding: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Create account</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Join the global trading community</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="email@example.com" 
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px' }} 
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PHONE NUMBER (OPTIONAL)</label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                    placeholder="+1 234 567 8900" 
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder="Create password" 
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                    placeholder="Confirm password" 
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px' }} 
                  />
                </div>

                <button onClick={handleRegister} className="btn-exness btn-exness-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>Create account</button>
              </div>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Already have an account? </span>
                <a href="/login" style={{ color: 'var(--exness-yellow)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Sign in</a>
              </div>
            </div>
          </div>
        </div>
    );
};
