import React, { useState } from 'react';
import axios from 'axios';
import { TickerNav } from '../components/TickerNav';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const Optimizer = () => {
    const [results, setResults] = useState<any[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const runSweep = async () => {
        setIsOptimizing(true);
        try {
            const res = await axios.post(`${API_BASE}/api/optimization/run?userId=1&strategyName=RSI_Auto`, {
                rsi_period: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            });
            setResults(res.data);
        } catch(err) { console.error(err); }
        setIsOptimizing(false);
    };

    return (
        <>
            <TickerNav />
            <div style={{ padding: '30px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '5px' }}>Backtest Optimizer</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Iterate through parameter sets to find the optimal trading edge</p>
                    </div>
                    <button className="btn btn-buy" onClick={runSweep} disabled={isOptimizing} style={{ padding: '12px 30px' }}>
                        {isOptimizing ? 'Sweeping Parameters...' : 'Run Optimization'}
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '30px', minHeight: '400px' }}>
                    <h4 style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>PARAMETER PERFORMANCE (PROFIT FACTOR)</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '250px', borderBottom: '1px solid var(--border)' }}>
                        {results.map((r, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '100%', 
                                    height: `${(r.profitFactor / 2) * 100}%`, 
                                    background: r.profitFactor > 1.5 ? 'var(--success)' : 'var(--primary)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s ease-out'
                                }}></div>
                                <div style={{ fontSize: '10px', marginTop: '10px', color: 'var(--text-muted)' }}>P-{r.parameter}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {results.length > 0 && results.map((r, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PERIOD {r.parameter}</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: r.profitFactor > 1.5 ? 'var(--success)' : '#fff' }}>PF: {r.profitFactor.toFixed(2)}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WIN: {r.winRate.toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                    
                    {results.length === 0 && !isOptimizing && (
                         <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>
                             Select a strategy and parameter range to begin optimization.
                         </div>
                    )}
                </div>
            </div>
        </>
    );
};
