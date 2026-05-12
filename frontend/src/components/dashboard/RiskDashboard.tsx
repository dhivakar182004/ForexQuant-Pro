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
    <div className="fq-card" style={{ 
      padding: '24px', 
      backgroundColor: 'var(--bg-card)', 
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)',
      color: '#fff', 
      borderRadius: '8px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
    }}>
      <h3 style={{ fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '20px', color: 'var(--fq-gold)' }}>Risk Management & Analytics</h3>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '15px', flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: '#8b8e96', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Total P&L</span>
          <h4 style={{ color: metrics.totalPnl >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '20px', fontWeight: '700' }}>
            ${metrics.totalPnl.toFixed(2)}
          </h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Win Rate</span>
          <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{metrics.winRate.toFixed(1)}%</h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Max Drawdown</span>
          <h4 style={{ color: 'var(--danger)', fontSize: '20px', fontWeight: '700' }}>${metrics.maxDrawdown.toFixed(2)}</h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Profit Factor</span>
          <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{metrics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : metrics.profitFactor.toFixed(2)}</h4>
        </div>
        <div>
          <span style={{ color: '#8b8e96', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Sharpe Ratio</span>
          <h4 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--fq-gold)' }}>{metrics.sharpeRatio.toFixed(2)}</h4>
        </div>
      </div>

      <h4 style={{ marginTop: '30px', fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trade Logger</h4>
      <table className="table table-dark table-striped" style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Symbol</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Type</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Entry Time</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Entry Price</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Exit Price</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Size</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>P&L</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px 8px', fontWeight: '600' }}>{t.symbol}</td>
              <td style={{ padding: '12px 8px', color: t.tradeType === 'BUY' ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>{t.tradeType}</td>
              <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{formatTime(t.entryTime)}</td>
              <td style={{ padding: '12px 8px' }}>{t.entryPrice?.toFixed(5)}</td>
              <td style={{ padding: '12px 8px' }}>{t.exitPrice ? t.exitPrice.toFixed(5) : '-'}</td>
              <td style={{ padding: '12px 8px' }}>{t.positionSize}</td>
              <td style={{ padding: '12px 8px', color: (t.pnl || 0) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                {t.pnl ? `${t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}` : '-'}
              </td>
              <td style={{ padding: '12px 8px' }}>
                {!t.exitPrice && onCloseTrade && (
                  <button onClick={() => onCloseTrade(t.id)} className="btn-fq btn-fq-primary" style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--danger)', color: '#fff', boxShadow: 'none' }}>Close</button>
                )}
              </td>
            </tr>
          ))}
          {trades.length === 0 && (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No trades recorded yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
