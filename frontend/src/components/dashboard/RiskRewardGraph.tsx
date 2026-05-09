import React, { useState } from 'react';

interface Trade {
  id: number;
  symbol: string;
  tradeType: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  positionSize: number;
  pnl?: number;
}

interface RiskRewardGraphProps {
  trades: Trade[];
}

export const RiskRewardGraph: React.FC<RiskRewardGraphProps> = ({ trades }) => {
  const [hoveredTrade, setHoveredTrade] = useState<any | null>(null);

  // Parse closed trades to calculate Risk vs Reward (in pips/points)
  const plotPoints = trades
    .filter(t => t.exitPrice && t.pnl !== undefined)
    .map(t => {
      const isJPY = t.symbol.includes('JPY');
      const pipMultiplier = isJPY ? 100 : 10000;

      // Estimate intended risk as 20 pips if not specified, or dynamic distance
      const riskPips = 20; 
      const rewardPips = (t.pnl || 0) / (t.positionSize / 100000) / (isJPY ? 1000 : 10);

      return {
        id: t.id,
        symbol: t.symbol,
        tradeType: t.tradeType,
        pnl: t.pnl,
        risk: riskPips,
        reward: Number(rewardPips.toFixed(1)),
        rr: Math.abs(rewardPips / riskPips).toFixed(2)
      };
    });

  // Calculate coordinates bounds
  const padding = 40;
  const width = 320;
  const height = 180;

  // Grid scales: X is Risk (0 to 50 pips), Y is Reward (-50 to 100 pips)
  const minX = 0, maxX = 40;
  const minY = -30, maxY = 60;

  const getX = (val: number) => padding + ((val - minX) / (maxX - minX)) * (width - padding - 15);
  const getY = (val: number) => height - padding - ((val - minY) / (maxY - minY)) * (height - padding - 20);

  return (
    <div className="exness-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', marginTop: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          R:R Performance Distribution
        </span>
        <span style={{ fontSize: '10px', color: 'var(--exness-yellow)', fontWeight: 'bold' }}>
          LIVE BACKTEST
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          <line x1={getX(minX)} y1={getY(0)} x2={getX(maxX)} y2={getY(0)} stroke="#2a2a2a" strokeWidth={1} />
          <line x1={getX(0)} y1={getY(minY)} x2={getX(0)} y2={getY(maxY)} stroke="#2a2a2a" strokeWidth={1} />

          {/* R:R guideline slopes (Y = X, Y = 2X, Y = 3X) */}
          <line x1={getX(0)} y1={getY(0)} x2={getX(30)} y2={getY(30)} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3 3" />
          <text x={getX(30) + 4} y={getY(30) + 4} fill="rgba(255,255,255,0.3)" fontSize={8}>1:1</text>

          <line x1={getX(0)} y1={getY(0)} x2={getX(20)} y2={getY(40)} stroke="rgba(0,200,83,0.15)" strokeWidth={1} strokeDasharray="3 3" />
          <text x={getX(20) - 10} y={getY(40) - 4} fill="rgba(0,200,83,0.4)" fontSize={8}>1:2</text>

          <line x1={getX(0)} y1={getY(0)} x2={getX(15)} y2={getY(45)} stroke="var(--exness-yellow)" strokeOpacity={0.15} strokeWidth={1} strokeDasharray="3 3" />
          <text x={getX(15) - 10} y={getY(45) - 6} fill="var(--exness-yellow)" fillOpacity={0.4} fontSize={8}>1:3</text>

          {/* Axis Labels */}
          <text x={width - 25} y={getY(0) + 12} fill="var(--text-muted)" fontSize={8} textAnchor="end">Risk (Pips)</text>
          <text x={getX(0) - 6} y={15} fill="var(--text-muted)" fontSize={8} textAnchor="end" transform={`rotate(-90, ${getX(0) - 6}, 15)`}>Reward (Pips)</text>

          {/* Render Trades Dots */}
          {plotPoints.map(p => {
            const cx = getX(p.risk);
            const cy = getY(p.reward);
            const isWin = (p.pnl || 0) > 0;
            const dotColor = isWin ? 'var(--success)' : 'var(--danger)';
            const glow = isWin ? 'rgba(0,200,83,0.4)' : 'rgba(255,61,0,0.4)';

            return (
              <g key={p.id} 
                 onMouseEnter={(e) => setHoveredTrade({ ...p, x: cx, y: cy })}
                 onMouseLeave={() => setHoveredTrade(null)}
                 style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r={hoveredTrade?.id === p.id ? 7 : 5} fill={dotColor} stroke="#000" strokeWidth={1.5} style={{ transition: 'all 0.2s' }} />
                {hoveredTrade?.id === p.id && (
                  <circle cx={cx} cy={cy} r={12} fill="none" stroke={dotColor} strokeWidth={1} strokeOpacity={0.5} />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredTrade && (
          <div style={{
            position: 'absolute',
            left: `${hoveredTrade.x + 10}px`,
            top: `${hoveredTrade.y - 45}px`,
            background: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '6px 10px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '11px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--exness-yellow)' }}>{hoveredTrade.symbol} ({hoveredTrade.tradeType})</div>
            <div style={{ color: '#fff' }}>Reward: {hoveredTrade.reward} pips</div>
            <div style={{ color: hoveredTrade.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
              PnL: {hoveredTrade.pnl >= 0 ? '+' : ''}${hoveredTrade.pnl.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Realized R:R: 1:{hoveredTrade.rr}</div>
          </div>
        )}

        {plotPoints.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--text-muted)',
            fontSize: '11px',
            textAlign: 'center',
            width: '80%'
          }}>
            Execute & close trades in Replay or Live mode to plot Risk-to-Reward profiles.
          </div>
        )}
      </div>
    </div>
  );
};
