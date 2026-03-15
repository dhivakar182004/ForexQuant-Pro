import React, { useState } from 'react';
import { PlayCircle, Loader } from 'lucide-react';

const Backtesting = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleRun = () => {
        setLoading(true);
        setTimeout(() => {
            setResult({
                trades: 124, winRate: 62.5, netProfit: 4500.00, maxDrawdown: 12.4
            });
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="fade-in">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Backtesting Engine</h2>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="glass-card p-4 h-100">
                        <h5 className="text-secondary mb-4">Simulation Setup</h5>
                        <div className="mb-3">
                            <label className="form-label">Select Strategy</label>
                            <select className="form-control dark-input"><option>Moving Average Crossover</option></select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Start Date</label>
                            <input type="date" className="form-control dark-input" defaultValue="2023-01-01" />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">End Date</label>
                            <input type="date" className="form-control dark-input" defaultValue="2024-01-01" />
                        </div>
                        <button className="btn btn-primary-custom w-100" onClick={handleRun} disabled={loading}>
                            {loading ? <Loader className="spin me-2" size={18} /> : <PlayCircle className="me-2" size={18} />}
                            {loading ? 'Running Simulation...' : 'Start Backtest'}
                        </button>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center align-items-center">
                        {!result && !loading && <div className="text-secondary text-center">Run a backtest to view results.</div>}
                        {loading && <div className="text-primary text-center spinner-border" style={{ width: '3rem', height: '3rem' }} role="status"></div>}
                        {result && !loading && (
                            <div className="w-100 fade-in text-center">
                                <h4 className="mb-4 text-profit">Simulation Complete!</h4>
                                <div className="row g-3">
                                    <div className="col-6"><div className="p-3 bg-dark rounded border border-secondary">Total Trades<br /><strong>{result.trades}</strong></div></div>
                                    <div className="col-6"><div className="p-3 bg-dark rounded border border-secondary">Win Rate<br /><strong>{result.winRate}%</strong></div></div>
                                    <div className="col-6"><div className="p-3 bg-dark rounded border border-secondary">Net Profit<br /><strong className="text-profit">${result.netProfit}</strong></div></div>
                                    <div className="col-6"><div className="p-3 bg-dark rounded border border-secondary">Max Drawdown<br /><strong className="text-loss">{result.maxDrawdown}%</strong></div></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Backtesting;
