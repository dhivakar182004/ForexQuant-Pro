import React, { useState } from 'react';
import { Save, Play } from 'lucide-react';

const Strategies = () => {
    const [strategy, setStrategy] = useState({
        name: '', pair: 'EUR/USD', timeframe: '1H', entryRule: '', exitRule: '', stopLoss: '', takeProfit: ''
    });

    const handleChange = (e) => setStrategy({ ...strategy, [e.target.name]: e.target.value });

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ fontWeight: 600 }}>Strategy Builder</h2>
                <div>
                    <button className="btn btn-secondary me-2"><Save size={18} className="me-2" />Save Draft</button>
                    <button className="btn btn-primary-custom"><Play size={18} className="me-2" />Save & Test</button>
                </div>
            </div>

            <div className="glass-card p-4">
                <h5 className="mb-4 text-secondary">Strategy Configuration</h5>
                <div className="row g-4">
                    <div className="col-md-4">
                        <label className="form-label">Strategy Name</label>
                        <input name="name" type="text" className="form-control dark-input" placeholder="e.g. MACD Crossover" value={strategy.name} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Currency Pair</label>
                        <select name="pair" className="form-control dark-input" value={strategy.pair} onChange={handleChange}>
                            <option>EUR/USD</option><option>GBP/USD</option><option>USD/JPY</option><option>AUD/USD</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Timeframe</label>
                        <select name="timeframe" className="form-control dark-input" value={strategy.timeframe} onChange={handleChange}>
                            <option>5M</option><option>15M</option><option>1H</option><option>4H</option><option>1D</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Entry Rule</label>
                        <textarea name="entryRule" className="form-control dark-input" rows="3" placeholder="Define entry conditions..." value={strategy.entryRule} onChange={handleChange}></textarea>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Exit Rule</label>
                        <textarea name="exitRule" className="form-control dark-input" rows="3" placeholder="Define exit conditions..." value={strategy.exitRule} onChange={handleChange}></textarea>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Stop Loss (Pips)</label>
                        <input name="stopLoss" type="number" className="form-control dark-input" placeholder="e.g. 50" value={strategy.stopLoss} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Take Profit (Pips)</label>
                        <input name="takeProfit" type="number" className="form-control dark-input" placeholder="e.g. 150" value={strategy.takeProfit} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Strategies;
