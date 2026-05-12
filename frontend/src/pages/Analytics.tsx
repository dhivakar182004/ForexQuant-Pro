import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const Analytics = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
        axios.get(`${API_BASE}/api/dashboard/analytics`)
             .then(res => setStats(res.data))
             .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '30px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '5px' }}>Global Platform Analytics</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Real-time institutional liquidity and execution reporting</p>
            
            {stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                    <div className="fq-card" style={{ padding: '25px', borderTop: '3px solid var(--primary)', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div style={{color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px'}}>TOTAL VOLUME TRADED</div>
                        <div style={{fontSize: '32px', fontWeight: 'bold'}}>${stats.totalVolumeTraded?.toLocaleString()}</div>
                    </div>
                    <div className="fq-card" style={{ padding: '25px', borderTop: '3px solid var(--success)', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div style={{color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px'}}>ACTIVE ALGORITHMIC SESSIONS</div>
                        <div style={{fontSize: '32px', fontWeight: 'bold'}}>{stats.activeSessions}</div>
                    </div>
                    <div className="fq-card" style={{ padding: '25px', borderTop: '3px solid var(--danger)', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div style={{color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px'}}>AVG. SYSTEM LATENCY</div>
                        <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--success)'}}>{stats.latencyMs}ms</div>
                    </div>
                </div>
            ) : (
                <div style={{ color: 'var(--text-muted)' }}>Loading aggregated metrics...</div>
            )}
        </div>
    );
};
