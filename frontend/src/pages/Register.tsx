import React, { useState } from 'react';
import axios from 'axios';
import { TickerNav } from '../components/TickerNav';

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
        <>
            <TickerNav />
            <div style={{ height: 'calc(100vh - 40px)', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'url(/bull_bear_background.png)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'inset 0 0 0 2000px rgba(10, 14, 23, 0.85)' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 60px', width: '450px', background: 'rgba(20, 24, 35, 0.65)' }}>
                    <h2 className="gradient-text" style={{ fontSize: '36px', marginBottom: '10px' }}>Join ForexQuant</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '35px', fontSize: '15px' }}>Start defining your algorithmic edge today</p>
                    
                    <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email Address" style={{ width: '100%', marginBottom: '20px' }} />
                        
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>PHONE NUMBER (OPTIONAL)</label>
                        <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 234 567 8900" style={{ width: '100%', marginBottom: '20px' }} />

                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>PASSWORD</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Password" style={{ width: '100%', marginBottom: '20px' }} />

                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>CONFIRM PASSWORD</label>
                        <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm Password" style={{ width: '100%', marginBottom: '25px' }} />
                        
                        <button onClick={handleRegister} className="btn btn-buy" style={{ width: '100%', fontSize: '16px', padding: '16px' }}>Create Secure Account</button>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Already have an account? <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login here</a>
                    </p>
                </div>
            </div>
        </>
    );
};
