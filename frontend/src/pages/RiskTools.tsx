import React from 'react';

export const RiskTools = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Risk Management Toolkit</h3>
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '15px', fontSize: '14px', color: 'var(--primary)' }}>POSITION SIZE CALCULATOR</h4>
                <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACCOUNT BALANCE ($)</label>
                        <input type="number" defaultValue={100000} style={{ width: '100%', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STRATEGY RISK (%)</label>
                        <input type="number" defaultValue={1} style={{ width: '100%', marginTop: '5px' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STOP LOSS (PIPS)</label>
                        <input type="number" defaultValue={20} style={{ width: '100%', marginTop: '5px' }} />
                    </div>
                    <div style={{ padding: '15px', border: '1px dashed var(--border)', borderRadius: '4px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RECOMMENDED UNITS</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>5.00 LOTS</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
