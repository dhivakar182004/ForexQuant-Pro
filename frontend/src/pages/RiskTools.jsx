import React from 'react';

const RiskTools = () => {
    return (
        <div className="fade-in">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Risk Management Tools</h2>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="glass-card p-4">
                        <h5 className="text-secondary mb-4">Position Size Calculator</h5>
                        <div className="mb-3">
                            <label className="form-label">Account Balance ($)</label>
                            <input type="number" className="form-control dark-input" defaultValue="10000" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Risk Percentage (%)</label>
                            <input type="number" className="form-control dark-input" defaultValue="1" />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Stop Loss (Pips)</label>
                            <input type="number" className="form-control dark-input" defaultValue="50" />
                        </div>
                        <button className="btn btn-primary-custom w-100 mb-3">Calculate Lot Size</button>
                        <div className="p-3 border border-success rounded text-center bg-dark text-profit">
                            <strong>Recommended Size: 0.20 Lots</strong>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="glass-card p-4">
                        <h5 className="text-secondary mb-4">Risk Reward Ratio</h5>
                        <div className="mb-3">
                            <label className="form-label">Entry Price</label>
                            <input type="number" className="form-control dark-input" defaultValue="1.1000" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Stop Loss Price</label>
                            <input type="number" className="form-control dark-input" defaultValue="1.0950" />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Take Profit Price</label>
                            <input type="number" className="form-control dark-input" defaultValue="1.1150" />
                        </div>
                        <button className="btn btn-secondary w-100 mb-3 text-white">Analyze Ratio</button>
                        <div className="p-3 border border-secondary rounded text-center bg-dark">
                            <strong>Ratio: 1:3</strong> (Excellent)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskTools;
