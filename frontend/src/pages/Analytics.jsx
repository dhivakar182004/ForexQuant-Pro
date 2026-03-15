import React from 'react';
import { Bar } from 'react-chartjs-2';

const Analytics = () => {
    const pnlData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Profit/Loss ($)',
            data: [1200, -400, 800, 2100],
            backgroundColor: (context) => context.raw > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        }]
    };

    return (
        <div className="fade-in">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Performance Analytics</h2>
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="glass-card p-4" style={{ height: 350 }}>
                        <h5 className="text-secondary">Weekly Result Distribution</h5>
                        <div style={{ height: 250 }}><Bar data={pnlData} options={{ maintainAspectRatio: false }} /></div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-card p-4" style={{ height: 350 }}>
                        <h5 className="text-secondary">Risk Analysis</h5>
                        <div className="d-flex h-100 flex-column justify-content-center">
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                                <span className="text-muted">Sharpe Ratio</span><strong>1.84</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                                <span className="text-muted">Profit Factor</span><strong>1.45</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2 border-secondary">
                                <span className="text-muted">Average Win</span><strong className="text-profit">$154.20</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Average Loss</span><strong className="text-loss">-$106.30</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
