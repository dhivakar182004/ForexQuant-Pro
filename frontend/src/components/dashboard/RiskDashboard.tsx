import React, { useMemo } from 'react';

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

export interface TradeRecord {
  id: number;
  symbol: string;
  entryTime: string;
  exitTime?: string;
  entryPrice: number;
  exitPrice?: number;
  positionSize: number;
  tradeType: 'BUY' | 'SELL';
  pnl?: number;
}

interface RiskDashboardProps {
  trades: TradeRecord[];
  onCloseTrade?: (id: number) => void;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ trades, onCloseTrade }) => {

  const metrics = useMemo(() => {
    let totalPnl = 0;
    let winningTrades = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let peakEquity = 0;
    let currentEquity = 0;
    let maxDrawdown = 0;

    trades.forEach(t => {
      const pnl = t.pnl || 0;
      totalPnl += pnl;
      currentEquity += pnl;

      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const drawdown = peakEquity - currentEquity;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;

      if (pnl > 0) {
        winningTrades++;
        grossProfit += pnl;
      } else if (pnl < 0) {
        grossLoss += Math.abs(pnl);
      }
    });

    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? Number.POSITIVE_INFINITY : 0);
    // Rough estimation of Sharpe Ratio for demo purposes (assuming 0 risk free rate)
    const avgReturn = trades.length > 0 ? totalPnl / trades.length : 0;
    const stdDev = trades.length > 0 ? Math.sqrt(trades.reduce((sq, t) => sq + Math.pow((t.pnl || 0) - avgReturn, 2), 0) / trades.length) : 0;
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return { totalPnl, winRate, maxDrawdown, profitFactor, sharpeRatio };
  }, [trades]);

  return (
    <div className="risk-dashboard" style={{ 
      padding: '24px', 
      backgroundColor: 'rgba(30, 34, 45, 0.7)', 
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff', 
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    }}>
      <h3 style={{ fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '20px' }}>Risk Management & Analytics</h3>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '15px' }}>
        <div>
          <span style={{ color: '#8b8e96' }}>Total P&L</span>
          <h4 style={{ color: metrics.totalPnl >= 0 ? '#26a69a' : '#ef5350' }}>
            ${metrics.totalPnl.toFixed(2)}
          </h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96' }}>Win Rate</span>
          <h4>{metrics.winRate.toFixed(1)}%</h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96' }}>Max Drawdown</span>
          <h4 style={{ color: '#ef5350' }}>${metrics.maxDrawdown.toFixed(2)}</h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96' }}>Profit Factor</span>
          <h4>{metrics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : metrics.profitFactor.toFixed(2)}</h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96' }}>Sharpe Ratio</span>
          <h4>{metrics.sharpeRatio.toFixed(2)}</h4>
        </div>
      </div>

      <h4 style={{ marginTop: '30px' }}>Trade Logger</h4>
      <table className="table table-dark table-striped" style={{ width: '100%', marginTop: '15px' }}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Entry Time</th>
            <th>Entry Price</th>
            <th>Exit Price</th>
            <th>Size</th>
            <th>P&L</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id}>
              <td>{t.symbol}</td>
              <td style={{ color: t.tradeType === 'BUY' ? '#26a69a' : '#ef5350' }}>{t.tradeType}</td>
              <td>{formatTime(t.entryTime)}</td>
              <td>{t.entryPrice?.toFixed(5)}</td>
              <td>{t.exitPrice ? t.exitPrice.toFixed(5) : '-'}</td>
              <td>{t.positionSize}</td>
              <td style={{ color: (t.pnl || 0) >= 0 ? '#26a69a' : '#ef5350' }}>
                {t.pnl ? t.pnl.toFixed(2) : '-'}
              </td>
              <td>
                {!t.exitPrice && onCloseTrade && (
                  <button onClick={() => onCloseTrade(t.id)} className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }}>Close</button>
                )}
              </td>
            </tr>
          ))}
          {trades.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center' }}>No trades recorded yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
