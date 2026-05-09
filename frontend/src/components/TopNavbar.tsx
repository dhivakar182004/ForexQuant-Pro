import React from 'react';

export const TopNavbar = () => {
    return (
        <div className="exness-navbar">
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--exness-yellow)', borderRadius: '2px' }}></div>
                    <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.5px' }}>ForexQuant Pro</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '5px', fontWeight: '400' }}>TERMINAL</span>
                </div>
                
                <nav style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: '500' }}>
                    <a href="/dashboard" style={{ color: 'var(--exness-yellow)', textDecoration: 'none' }}>Trading</a>
                    <a href="/strategies" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Personal Area</a>
                </nav>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div 
                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                    style={{ width: '32px', height: '32px', background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', title: 'Logout' }}>
                    D
                </div>
            </div>
        </div>
    );
};
