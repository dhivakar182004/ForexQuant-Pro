import React from 'react';

export const TopNavbar = () => {
    const activePath = window.location.pathname;

    const navItems = [
        { name: 'Trading Terminal', path: '/dashboard' },
        { name: 'Strategy Tester', path: '/strategies' },
        { name: 'Optimizer', path: '/optimizer' },
        { name: 'Performance Ledger', path: '/trade-history' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Risk Toolkit', path: '/risk-tools' }
    ];

    return (
        <div className="exness-navbar" style={{ padding: '0 24px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '/dashboard'}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--exness-yellow)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '14px' }}>F</div>
                    <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.5px' }}>ForexQuant Pro</span>
                </div>
                
                <nav style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '600', height: '100%' }}>
                    {navItems.map(item => {
                        const isActive = activePath === item.path;
                        return (
                            <a 
                                key={item.path}
                                href={item.path} 
                                style={{ 
                                    color: isActive ? '#fff' : 'var(--text-muted)', 
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                    padding: '0 4px',
                                    borderBottom: isActive ? '3px solid var(--exness-yellow)' : '3px solid transparent',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: isActive ? '700' : '600'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                            >
                                {item.name}
                            </a>
                        );
                    })}
                </nav>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div 
                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                    style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: '#1a1a1a', 
                        border: '1px solid var(--border)',
                        color: 'var(--exness-yellow)',
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--exness-yellow)';
                        e.currentTarget.style.background = 'var(--exness-yellow)';
                        e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.color = 'var(--exness-yellow)';
                    }}
                    title="Sign Out"
                >
                    Q
                </div>
            </div>
        </div>
    );
};
