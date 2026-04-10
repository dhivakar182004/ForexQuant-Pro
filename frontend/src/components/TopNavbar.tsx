import React from 'react';

export const TopNavbar = () => {
    return (
        <div style={{ background: '#1A1C24', borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>FOREXQUANT PRO</span>
                <nav style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                    <a href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Terminal</a>
                    <a href="/strategies" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Strategies</a>
                    <a href="/optimizer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Optimizer</a>
                    <a href="/analytics" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Analytics</a>
                    <a href="/trade-history" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>History</a>
                </nav>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ background: 'rgba(38, 166, 154, 0.1)', color: 'var(--success)', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    REAL ACCOUNT • $100,000.00
                </div>
                <button className="btn btn-sm" style={{ padding: '5px 15px', fontSize: '12px' }} onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Logout</button>
            </div>
        </div>
    );
};
