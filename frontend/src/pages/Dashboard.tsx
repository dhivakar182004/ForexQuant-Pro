import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TradingViewChart } from '../components/chart/TradingViewChart';
import { RiskDashboard } from '../components/dashboard/RiskDashboard';
import { TickerNav } from '../components/TickerNav';
import { TopNavbar } from '../components/TopNavbar';
import { ReplayToolbar } from '../components/terminal/ReplayToolbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
    constructor(props: any) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div style={{padding: '20px', color: '#ef5350', background: 'rgba(239,83,80,0.1)', borderRadius: '8px'}}>Chart failed to load. Please check your connection.</div>;
        return this.props.children;
    }
}

export const Dashboard = () => {
    const [mode, setMode] = useState<'live' | 'replay'>('live');
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    
    const [positionSize, setPositionSize] = useState<number>(100000);
    const [trades, setTrades] = useState<any[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(1.10000);
    const [isReplaying, setIsReplaying] = useState(false);
    const [replaySpeed, setReplaySpeed] = useState(1);

    useEffect(() => {
        fetchHistory(); // Fetch historical data immediately so the live chart is not blank
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState({}, document.title, "/dashboard");
        }

        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }

        axios.get(`${API_BASE}/api/trades/all`)
          .then(res => setTrades(res.data))
          .catch(err => console.error("Could not fetch trades", err));
    }, []);

    const fetchHistory = async () => {
        try {
            const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const end = new Date().toISOString();
            const res = await axios.get(`${API_BASE}/api/market/history?symbol=OANDA:EUR_USD&start=${start}&end=${end}`);
            
            if (res.data && res.data.length > 0) {
                const formatted = res.data.map((c: any) => ({
                    time: Math.floor(new Date(c.timestamp).getTime() / 1000),
                    open: c.open, high: c.high, low: c.low, close: c.close
                }));
                setHistoricalData(formatted);
            }
        } catch(e) { console.error("Could not fetch historical data"); }
    };

    const executeTrade = async (type: 'BUY' | 'SELL') => {
        try {
            const res = await axios.post(`${API_BASE}/api/trades/execute`, {
                symbol: 'EUR/USD', entryPrice: currentPrice, positionSize: positionSize, tradeType: type
            });
            setTrades([...trades, res.data]);
        } catch(err) { console.error("Trade failed", err); }
    };

    const closeTrade = async (id: number) => {
        try {
            const res = await axios.post(`${API_BASE}/api/trades/close/${id}`, {
                exitPrice: currentPrice + (Math.random() - 0.5) * 0.005
            });
            setTrades(trades.map(t => t.id === id ? res.data : t));
        } catch(err) { console.error("Failed closing trade", err); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000' }}>
            <div className="dynamic-bg"></div>
            <TopNavbar />
            
            <div className="dashboard-grid">
                {/* Instruments Sidebar */}
                <div className="grid-cell" style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>Instruments</span>
                        <span style={{ color: 'var(--exness-yellow)', fontSize: '12px', cursor: 'pointer' }}>Edit</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                        {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'].map(symbol => (
                            <div key={symbol} className="exness-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: symbol === 'EURUSD' ? 'var(--bg-hover)' : 'transparent' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{symbol}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Forex • 15m</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--success)' }}>1.08425</div>
                                    <div style={{ fontSize: '11px', color: 'var(--success)' }}>+0.12%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Trading Area */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 200px', flex: 1, overflow: 'hidden' }}>
                    <div className="grid-cell" style={{ position: 'relative', padding: 0 }}>
                        <TradingViewChart 
                            mode={mode} 
                            historicalData={historicalData} 
                            onPriceUpdate={setCurrentPrice}
                            isReplaying={isReplaying}
                            replaySpeed={replaySpeed}
                        />
                        
                        {/* Overlay Controls */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                            <div className="exness-card" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: '600' }}>EURUSD</span>
                                <span style={{ color: 'var(--success)' }}>{currentPrice.toFixed(5)}</span>
                            </div>
                            <button onClick={() => setMode(mode === 'live' ? 'replay' : 'live')} className="btn-exness" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)' }}>
                                {mode === 'live' ? 'Enter Replay' : 'Exit Replay'}
                            </button>
                            {mode === 'replay' && (
                                <ReplayToolbar 
                                    isPlaying={isReplaying}
                                    onTogglePlay={() => setIsReplaying(!isReplaying)}
                                    onRewind={() => {}} 
                                    onForward={() => {}} 
                                    speed={replaySpeed}
                                    onSpeedChange={setReplaySpeed}
                                />
                            )}
                        </div>
                    </div>

                    {/* Trade History / Positions Footer */}
                    <div className="grid-cell" style={{ borderTop: '1px solid var(--border)', padding: 0 }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--exness-yellow)', borderBottom: '2px solid var(--exness-yellow)', paddingBottom: '10px' }}>Open Orders (1)</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Closed History</span>
                        </div>
                        <div style={{ padding: '16px' }}>
                            <RiskDashboard trades={trades} onCloseTrade={closeTrade} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
