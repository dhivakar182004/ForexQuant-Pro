import React, { useState } from 'react';
import { PlayCircle, Loader2, BarChart2, Activity, ListChecks, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Backtesting = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleRun = () => {
        setLoading(true);
        setTimeout(() => {
            setResult({
                trades: 124,
                winRate: 62.5,
                netProfit: 4500.00,
                maxDrawdown: 12.4,
                history: [
                    { pair: 'EUR/USD', side: 'BUY', result: 250 },
                    { pair: 'GBP/USD', side: 'SELL', result: -120 },
                    { pair: 'USD/JPY', side: 'BUY', result: 480 }
                ]
            });
            setLoading(false);
        }, 2500);
    };

    return (
        <div className="fade-in">
            <div className="mb-4">
                <h2 style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Backtesting Engine</h2>
                <p className="text-muted small">Execute simulations and analyze historical performance.</p>
            </div>

            <div className="row g-4">
                <div className="col-xl-4">
                    <div className="glass-card p-4 h-100">
                        <h5 className="text-secondary mb-4 d-flex align-items-center gap-2">
                            <Activity size={20} className="text-cyan" /> Simulation Environment
                        </h5>
                        <div className="mb-3">
                            <label className="form-label">Select Strategy</label>
                            <select className="form-control dark-input"><option>Trend Rider v1</option><option>EMA Cross-Over</option></select>
                        </div>
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label">Start Date</label>
                                <input type="date" className="form-control dark-input" defaultValue="2023-01-01" />
                            </div>
                            <div className="col-6">
                                <label className="form-label">End Date</label>
                                <input type="date" className="form-control dark-input" defaultValue="2024-01-01" />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Initial Balance ($)</label>
                            <input type="number" className="form-control dark-input" defaultValue="10000" />
                        </div>
                        <button className="btn btn-primary-custom w-100 py-3 d-flex align-items-center justify-content-center gap-2" onClick={handleRun} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                            {loading ? 'Simulating Market...' : 'Run Analysis'}
                        </button>
                    </div>
                </div>

                <div className="col-xl-8">
                    <div className="glass-card p-4 h-100 min-vh-50 d-flex flex-column align-items-center justify-content-center">
                        {!result && !loading && (
                            <div className="text-center py-5">
                                <BarChart2 size={48} className="text-muted opacity-25 mb-3" />
                                <h5 className="text-muted">Start simulation to view performance metrics.</h5>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-cyan mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                                <h5 className="text-cyan">Processing Historical Data...</h5>
                            </div>
                        )}

                        {result && !loading && (
                            <div className="w-100 fade-in">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-3 col-6">
                                        <div className="p-3 bg-dark border border-secondary rounded text-center">
                                            <div className="text-muted small mb-1">Total Trades</div>
                                            <div className="h4 mb-0 fw-bold">{result.trades}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6">
                                        <div className="p-3 bg-dark border border-secondary rounded text-center">
                                            <div className="text-muted small mb-1">Win Rate</div>
                                            <div className="h4 mb-0 fw-bold text-success">{result.winRate}%</div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6">
                                        <div className="p-3 bg-dark border border-secondary rounded text-center">
                                            <div className="text-muted small mb-1">Net Profit</div>
                                            <div className="h4 mb-0 fw-bold text-cyan">${result.netProfit}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6">
                                        <div className="p-3 bg-dark border border-secondary rounded text-center">
                                            <div className="text-muted small mb-1">Drawdown</div>
                                            <div className="h4 mb-0 fw-bold text-danger">{result.maxDrawdown}%</div>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="text-secondary mb-3 d-flex align-items-center gap-2">
                                    <ListChecks size={18} /> Recent Simulation Trades
                                </h6>
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                                        <thead>
                                            <tr>
                                                <th className="border-dark text-muted bg-transparent">Pair</th>
                                                <th className="border-dark text-muted bg-transparent">Side</th>
                                                <th className="border-dark text-muted bg-transparent">P/L</th>
                                                <th className="border-dark text-muted bg-transparent">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.history.map((t, i) => (
                                                <tr key={i}>
                                                    <td className="border-dark bg-transparent font-monospace">{t.pair}</td>
                                                    <td className="border-dark bg-transparent">
                                                        <span className={`badge ${t.side === 'BUY' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {t.side}
                                                        </span>
                                                    </td>
                                                    <td className={`border-dark bg-transparent ${t.result > 0 ? 'text-success' : 'text-danger'} fw-bold`}>
                                                        {t.result > 0 ? <ArrowUpRight size={14} className="me-1" /> : <ArrowDownRight size={14} className="me-1" />}
                                                        ${Math.abs(t.result)}
                                                    </td>
                                                    <td className="border-dark bg-transparent">
                                                        <div className="p-1 rounded-circle bg-success shadow-sm d-inline-block" style={{ width: 8, height: 8 }}></div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .text-cyan { color: var(--accent-primary); }
        .bg-success-subtle { background: rgba(34, 197, 94, 0.1); }
        .bg-danger-subtle { background: rgba(239, 68, 68, 0.1); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
        </div>
    );
};

export default Backtesting;
