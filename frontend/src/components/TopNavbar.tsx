import React from 'react';

export const TopNavbar = () => {
    return (
        <div className="exness-navbar">
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--exness-yellow)', borderRadius: '2px' }}></div>
                    <span style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.5px' }}>EXNESS</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '5px', fontWeight: '400' }}>TERMINAL</span>
                </div>
                
                <nav style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: '500' }}>
                    <a href="/dashboard" style={{ color: 'var(--exness-yellow)', textDecoration: 'none' }}>Trading</a>
                    <a href="/strategies" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Personal Area</a>
                    <a href="/optimizer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Analytics</a>
                    <a href="/trade-history" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>History</a>
                </nav>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>100 000.00 USD</div>
                    <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>REAL • MT5</div>
                </div>
                <button className="btn-exness btn-exness-outline" style={{ padding: '8px 16px' }} onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Deposit</button>
                <div style={{ width: '32px', height: '32px', background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px' }}>D</div>
            </div>
        </div>
    );
};
