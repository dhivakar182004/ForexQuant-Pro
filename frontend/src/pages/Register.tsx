import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Register = () => {
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', phoneNumber: '' });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (formData.password.length < 8) {
            alert("Password must be at least 8 characters long!");
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
                  <div style={{ width: '32px', height: '32px', background: 'var(--fq-gold)', borderRadius: '2px' }}></div>
                  <span style={{ fontWeight: '700', fontSize: '28px', letterSpacing: '-0.5px' }}>ForexQuant Pro</span>
              </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px' }}>
            <div className="fq-card animate-up" style={{ width: '450px', padding: '40px' }}>
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
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }} 
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PHONE NUMBER (OPTIONAL)</label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                    placeholder="+1 234 567 8900" 
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', color: '#fff' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PASSWORD</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="Create password"
                      style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', paddingRight: '40px', borderRadius: '4px', color: '#fff' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                      placeholder="Confirm password"
                      style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px', paddingRight: '40px', borderRadius: '4px', color: '#fff' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button onClick={handleRegister} className="btn-fq btn-fq-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>Create account</button>
              </div>
              
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Already have an account? </span>
                <a href="/login" style={{ color: 'var(--fq-gold)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Sign in</a>
              </div>
            </div>
          </div>
        </div>
    );
};
