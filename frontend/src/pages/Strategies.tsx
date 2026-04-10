import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Strategies = () => {
    const [strategies, setStrategies] = useState<any[]>([]);
    const [newStrategy, setNewStrategy] = useState({ name: '', description: '', configJson: '{"rsi_period": 14, "buy_threshold": 30, "sell_threshold": 70}' });

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            // Hardcoded user ID 1 for demo purposes
            const res = await axios.get(`${API_BASE}/api/strategies/user/1`);
            setStrategies(res.data);
        } catch(err) { console.error(err); }
    };

    const handleCreate = async () => {
        try {
            await axios.post(`${API_BASE}/api/strategies/save`, { ...newStrategy, userId: 1 });
            setNewStrategy({ name: '', description: '', configJson: '{"rsi_period": 14, "buy_threshold": 30, "sell_threshold": 70}' });
            fetchStrategies();
        } catch(err) { console.error(err); }
    };

    const handleToggle = async (id: number) => {
        try {
            await axios.post(`${API_BASE}/api/strategies/toggle/${id}`);
            fetchStrategies();
        } catch(err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_BASE}/api/strategies/${id}`);
            fetchStrategies();
        } catch(err) { console.error(err); }
    };

    return (
        <div style={{ padding: '30px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '5px' }}>Strategic Automator</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Define and deploy automated algorithmic execution models</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '25px' }}>
                    <h4 style={{ marginBottom: '20px' }}>NEW STRATEGY</h4>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NAME</label>
                            <input type="text" value={newStrategy.name} onChange={e => setNewStrategy({...newStrategy, name: e.target.value})} placeholder="e.g. RSI Mean Reversion" style={{ width: '100%', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                            <textarea value={newStrategy.description} onChange={e => setNewStrategy({...newStrategy, description: e.target.value})} placeholder="Describe your logic..." style={{ width: '100%', marginTop: '5px', height: '80px', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border)', padding: '10px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JSON CONFIG</label>
                            <textarea value={newStrategy.configJson} onChange={e => setNewStrategy({...newStrategy, configJson: e.target.value})} style={{ width: '100%', marginTop: '5px', height: '120px', background: 'var(--bg-secondary)', color: 'var(--success)', fontFamily: 'monospace', border: '1px solid var(--border)', padding: '10px' }} />
                        </div>
                        <button className="btn btn-primary" onClick={handleCreate}>Create Strategy</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {strategies.map(s => (
                        <div key={s.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: s.active ? '4px solid var(--success)' : '4px solid #444' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{s.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.description}</div>
                                <div style={{ fontSize: '11px', marginTop: '10px', color: s.active ? 'var(--success)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                    {s.active ? 'RUNNING ON LIVE DATA' : 'INACTIVE / DORMANT'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={`btn btn-sm ${s.active ? 'btn-danger' : 'btn-buy'}`} onClick={() => handleToggle(s.id)}>
                                    {s.active ? 'STOP' : 'RUN'}
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>DELETE</button>
                            </div>
                        </div>
                    ))}
                    {strategies.length === 0 && <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No strategies defined. Create your first algorithmic rule above.</div>}
                </div>
            </div>
        </div>
    );
};
