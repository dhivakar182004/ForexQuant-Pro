import React, { useEffect, useState } from 'react';

const parseDateTime = (val: any): Date => {
    if (!val) return new Date();
    if (Array.isArray(val)) {
        // [year, month, day, hour = 0, minute = 0, second = 0]
        const [year, month, day, hour = 0, minute = 0, second = 0] = val;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
        return d;
    }
    try {
        const cleaned = String(val).replace(' ', 'T');
        const fallbackDate = new Date(cleaned);
        if (!isNaN(fallbackDate.getTime())) {
            return fallbackDate;
        }
    } catch (e) {}
    return new Date();
};

const formatTime = (val: any): string => {
    if (!val) return '--';
    const date = parseDateTime(val);
    return date.toLocaleString();
};

interface Trade {
  id: number;
  symbol: string;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  tradeType: 'BUY' | 'SELL';
  pnl: number;
}

export const History: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking trade data for immediate visual feedback
    const mockTrades: Trade[] = [
      { id: 1, symbol: 'EUR/USD', entryTime: '2026-04-07 10:00', exitTime: '2026-04-07 10:30', entryPrice: 1.0850, exitPrice: 1.0875, positionSize: 100000, tradeType: 'BUY', pnl: 250.00 },
      { id: 2, symbol: 'GBP/JPY', entryTime: '2026-04-07 11:15', exitTime: '2026-04-07 11:45', entryPrice: 190.25, exitPrice: 190.10, positionSize: 50000, tradeType: 'SELL', pnl: 75.00 },
      { id: 3, symbol: 'XAU/USD', entryTime: '2026-04-07 12:00', exitTime: '2026-04-07 12:15', entryPrice: 2350.50, exitPrice: 2348.00, positionSize: 100, tradeType: 'BUY', pnl: -250.00 },
    ];

    setTrades(mockTrades);
    setLoading(false);

    // Real API Fetch (uncomment when live)
    /*
    fetch('http://localhost:8081/api/trades/all')
      .then(res => res.json())
      .then(data => {
        setTrades(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
    */
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Portfolio History</h1>
          <p className="text-gray-400">Institutional trade tracking and performance metrics.</p>
        </div>
        <div className="flex gap-4">
          <div className="fq-card p-4 px-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <span className="text-gray-400 text-sm block">Total Equity</span>
            <span className="text-xl font-mono text-green-400 font-bold">$10,075.00</span>
          </div>
          <div className="fq-card p-4 px-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <span className="text-gray-400 text-sm block">Win Rate</span>
            <span className="text-xl font-mono text-blue-400 font-bold">66.7%</span>
          </div>
        </div>
      </div>

      <div className="fq-card overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 uppercase text-xs tracking-wider font-semibold">
              <th className="p-4">Symbol</th>
              <th className="p-4">Type</th>
              <th className="p-4">Entry</th>
              <th className="p-4">Exit</th>
              <th className="p-4">Size</th>
              <th className="p-4">Result</th>
              <th className="p-4 text-right">PnL</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-12 text-center text-gray-500">Loading portfolio data...</td></tr>
            ) : (
              trades.map(trade => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-mono text-sm">
                  <td className="p-4 text-white font-bold">{trade.symbol}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${trade.tradeType === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {trade.tradeType}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-100">{trade.entryPrice.toFixed(4)}</div>
                    <div className="text-[10px] text-gray-500">{formatTime(trade.entryTime)}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-100">{trade.exitPrice.toFixed(4)}</div>
                    <div className="text-[10px] text-gray-500">{formatTime(trade.exitTime)}</div>
                  </td>
                  <td className="p-4 text-gray-400">{trade.positionSize.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {trade.pnl >= 0 ? '✓ WIN' : '✗ LOSS'}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
