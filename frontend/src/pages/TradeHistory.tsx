import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createChart, IChartApi } from 'lightweight-charts';

export const TradeHistory = () => {
    const [trades, setTrades] = useState<any[]>([]);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    
    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE}/api/trades/all`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
             .then(res => setTrades(res.data))
             .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current || trades.length === 0) return;

        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { color: 'transparent' }, textColor: '#888' },
            grid: { vertLines: { color: 'rgba(42, 46, 57, 0.5)' }, horzLines: { color: 'rgba(42, 46, 57, 0.5)' } },
            width: chartContainerRef.current.clientWidth,
            height: 250,
            handleScroll: false,
            handleScale: false,
        });

        const lineSeries = chart.addLineSeries({
            color: 'var(--primary)',
            lineWidth: 3,
            areaTopColor: 'rgba(33, 150, 243, 0.3)',
            areaBottomColor: 'rgba(33, 150, 243, 0)',
        });

        // Calculate cumulative equity curve
        let cumulative = 100000; // Assuming $100k starting
        const data = trades
            .filter(t => t.exitTime)
            .sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime())
            .map(t => {
                cumulative += (t.pnl || 0);
                return {
                    time: Math.floor(new Date(t.exitTime).getTime() / 1000),
                    value: cumulative
                };
            });

        if (data.length > 0) {
            lineSeries.setData(data);
            chart.timeScale().fitContent();
        }

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [trades]);

    const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winCount = trades.filter(t => t.pnl > 0).length;
    const winRate = trades.length > 0 ? (winCount / trades.length * 100).toFixed(1) : 0;
    
    // Dynamic math-accurate calculations
    const grossProfits = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + (t.pnl || 0), 0);
    const grossLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + (t.pnl || 0), 0));
    const profitFactor = grossLosses > 0 ? (grossProfits / grossLosses).toFixed(2) : grossProfits > 0 ? 'Max' : '0.00';

    const downloadCSVReport = () => {
        if (trades.length === 0) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Symbol,Action,Position Size,Entry Price,Exit Price,PnL ($),Entry Time,Exit Time\n";
        
        trades.forEach(t => {
            const row = [
                t.id,
                t.symbol,
                t.tradeType,
                t.positionSize,
                t.entryPrice,
                t.exitPrice || '--',
                t.pnl !== null ? t.pnl : '--',
                t.entryTime || '--',
                t.exitTime || '--'
            ].join(",");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `forexquant_performance_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ padding: '30px', color: '#fff', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                <div>
                    <h2 className="gradient-text" style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '800' }}>PORTFOLIO ANALYTICS</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time attribution and historical execution ledger</p>
                    <button 
                        onClick={downloadCSVReport}
                        disabled={trades.length === 0}
                        style={{
                            marginTop: '15px',
                            background: 'var(--exness-yellow)',
                            color: '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: trades.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: trades.length === 0 ? 0.5 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        Download CSV Report
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="glass-panel" style={{ padding: '15px 25px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px' }}>Win Rate</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>{winRate}%</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '15px 25px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px' }}>Profit Factor</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{profitFactor}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '15px 25px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '5px' }}>Total PnL</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', height: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#888' }}>EQUITY CURVE (CUMULATIVE PERFORMANCE)</span>
                    <span style={{ fontSize: '11px', color: 'var(--primary)' }}>• REAL-TIME DATA</span>
                </div>
                <div ref={chartContainerRef} style={{ width: '100%', height: '240px' }} />
            </div>
            
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#888' }}>EXECUTION LOG</span>
                </div>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '15px 20px' }}>Symbol</th>
                            <th style={{ padding: '15px 20px' }}>Action</th>
                            <th style={{ padding: '15px 20px' }}>Size</th>
                            <th style={{ padding: '15px 20px' }}>Entry Price</th>
                            <th style={{ padding: '15px 20px' }}>Exit Price</th>
                            <th style={{ padding: '15px 20px', textAlign: 'right' }}>PnL ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }} className="hover-row">
                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{t.symbol}</td>
                                <td style={{ padding: '15px 20px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                        background: t.tradeType === 'BUY' ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                                        color: t.tradeType === 'BUY' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {t.tradeType}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 20px', color: '#888' }}>{t.positionSize?.toLocaleString()}</td>
                                <td style={{ padding: '15px 20px', fontFamily: 'monospace' }}>{t.entryPrice?.toFixed(5)}</td>
                                <td style={{ padding: '15px 20px', fontFamily: 'monospace' }}>
                                    {t.exitPrice ? t.exitPrice.toFixed(5) : <span style={{ color: 'var(--primary)', fontSize: '11px' }}>● ACTIVE</span>}
                                </td>
                                <td style={{ padding: '15px 20px', textAlign: 'right', color: t.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', fontSize: '16px', fontFamily: 'monospace' }}>
                                    {t.pnl === null ? '--' : (t.pnl >= 0 ? `+${t.pnl.toFixed(2)}` : `${t.pnl.toFixed(2)}`)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {trades.length === 0 && <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Initial data ingestion required. Execute trades in the Terminal to generate ledger entries.</div>}
            </div>
        </div>
    );
};
