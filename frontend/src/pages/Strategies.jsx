import React, { useState } from 'react';
import { Save, Play, Plus, Trash2, Info } from 'lucide-react';

const Strategies = () => {
    const [strategy, setStrategy] = useState({
        name: '', pair: 'EUR/USD', timeframe: '1H', entryRule: '', exitRule: '', stopLoss: '50', takeProfit: '150'
    });

    const handleChange = (e) => setStrategy({ ...strategy, [e.target.name]: e.target.value });

    return (
        <div className="fade-in">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Strategy Builder</h2>
                    <p className="text-muted small mb-0">Define your technical rules and risk parameters.</p>
                </div>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <button className="btn btn-dark border-secondary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2">
                        <Save size={18} /> <span className="d-none d-sm-inline">Save Draft</span>
                    </button>
                    <button className="btn btn-primary-custom flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2">
                        <Play size={18} /> <span>Deploy to Test</span>
                    </button>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="glass-card p-4 mb-4">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Plus size={20} className="text-cyan" />
                            <h5 className="mb-0">Trading Logic</h5>
                        </div>

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Strategy Name</label>
                                <input name="name" type="text" className="form-control dark-input" placeholder="e.g. Trend Rider v1" value={strategy.name} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Currency Pair</label>
                                <select name="pair" className="form-control dark-input" value={strategy.pair} onChange={handleChange}>
                                    <option>EUR/USD</option><option>GBP/USD</option><option>USD/JPY</option><option>BTC/USD</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Timeframe</label>
                                <select name="timeframe" className="form-control dark-input" value={strategy.timeframe} onChange={handleChange}>
                                    <option>1M</option><option>5M</option><option>15M</option><option>1H</option><option>4H</option><option>1D</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Entry Conditions (JSON or Script)</label>
                                <textarea name="entryRule" className="form-control dark-input font-monospace" rows="4" placeholder="{ 'indicator': 'RSI', 'condition': '< 30' }" value={strategy.entryRule} onChange={handleChange}></textarea>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Exit Conditions</label>
                                <textarea name="exitRule" className="form-control dark-input font-monospace" rows="4" placeholder="{ 'indicator': 'EMA', 'cross': 'down' }" value={strategy.exitRule} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="glass-card p-4">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <ShieldAlert size={20} className="text-cyan" />
                            <h5 className="mb-0">Risk Management</h5>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Stop Loss (Pips)</label>
                            <input name="stopLoss" type="number" className="form-control dark-input" value={strategy.stopLoss} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Take Profit (Pips)</label>
                            <input name="takeProfit" type="number" className="form-control dark-input" value={strategy.takeProfit} onChange={handleChange} />
                        </div>

                        <div className="p-3 bg-dark rounded border border-secondary mb-4">
                            <div className="d-flex justify-content-between small mb-2">
                                <span className="text-muted">R/R Ratio</span>
                                <span className="text-cyan fw-bold">1:{(strategy.takeProfit / strategy.stopLoss).toFixed(1)}</span>
                            </div>
                            <div className="progress bg-secondary" style={{ height: 6 }}>
                                <div className="progress-bar bg-cyan" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        <div className="alert bg-secondary border-0 small d-flex gap-2">
                            <Info size={16} className="flex-shrink-0" />
                            <span className="text-muted">Tip: A risk-reward ratio above 1:2 is recommended for long-term edge.</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .text-cyan { color: var(--accent-primary); }
        .bg-cyan { background-color: var(--accent-primary); }
        .font-monospace { font-family: 'SF Mono', 'Fira Code', monospace !important; font-size: 0.85rem; }
      `}</style>
        </div>
    );
};

import { ShieldAlert } from 'lucide-react';
export default Strategies;
