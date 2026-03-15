import React from 'react';

const TradeHistory = () => {
    const trades = [
        { id: '#TRD-8491', pair: 'EUR/USD', type: 'BUY', entry: '1.0950', exit: '1.1020', pnl: 70.0, date: '2023-11-01' },
        { id: '#TRD-8492', pair: 'GBP/USD', type: 'SELL', entry: '1.2500', exit: '1.2550', pnl: -50.0, date: '2023-11-02' },
        { id: '#TRD-8493', pair: 'USD/JPY', type: 'BUY', entry: '149.20', exit: '150.10', pnl: 90.0, date: '2023-11-03' }
    ];

    return (
        <div className="fade-in">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Trade History</h2>
            <div className="glass-card p-0 overflow-hidden">
                <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
                    <input type="text" className="form-control dark-input w-25" placeholder="Filter Pair..." />
                </div>
                <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                    <thead>
                        <tr>
                            <th className="border-secondary text-muted">ID</th>
                            <th className="border-secondary text-muted">Pair</th>
                            <th className="border-secondary text-muted">Type</th>
                            <th className="border-secondary text-muted">Entry</th>
                            <th className="border-secondary text-muted">Exit</th>
                            <th className="border-secondary text-muted">P/L ($)</th>
                            <th className="border-secondary text-muted">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(t => (
                            <tr key={t.id}>
                                <td className="border-secondary">{t.id}</td>
                                <td className="border-secondary fw-bold">{t.pair}</td>
                                <td className="border-secondary">{t.type}</td>
                                <td className="border-secondary">{t.entry}</td>
                                <td className="border-secondary">{t.exit}</td>
                                <td className={`border-secondary fw-bold ${t.pnl > 0 ? 'text-profit' : 'text-loss'}`}>{t.pnl > 0 ? '+' : ''}{t.pnl}</td>
                                <td className="border-secondary text-muted">{t.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TradeHistory;
