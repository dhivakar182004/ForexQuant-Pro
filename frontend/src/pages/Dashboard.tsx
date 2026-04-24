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
        <div className="dashboard-wrapper">
            <TopNavbar />
            <TickerNav />
            
            <div className="glass-panel dashboard-toolbar">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '5px 15px', borderRadius: '20px', fontSize: '13px' }}>
                        Connected to <span style={{color: 'var(--success)', fontWeight: 'bold'}}>FINNHUB</span> WSS
                    </div>
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
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '5px', borderRadius: '20px' }}>
                        <button className={`btn tab-btn ${mode === 'live' ? 'active' : ''}`} onClick={() => setMode('live')}>Live WSS</button>
                        <button className={`btn tab-btn ${mode === 'replay' ? 'active' : ''}`} onClick={() => { setMode('replay'); fetchHistory(); }}>Bar Replay</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="chart-section">
                    <div className="glass-panel" style={{ flex: 1 }}>
                         <ErrorBoundary>
                            <TradingViewChart mode={mode} historicalData={historicalData} onPriceUpdate={setCurrentPrice} />
                         </ErrorBoundary>
                    </div>
                </div>
                <div className="sidebar-section">
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>EXECUTION ENGINE</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>UNITS (POSITION SIZE)</label>
                            <input 
                                type="number" 
                                value={positionSize} 
                                onChange={e => setPositionSize(Number(e.target.value))}
                                style={{ width: '100%', fontSize: '18px', padding: '10px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-buy" onClick={() => executeTrade('BUY')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/bull_icon.png" alt="Bull" style={{ height: '35px', marginBottom: '5px' }} />
                                <span>MARKET BUY</span>
                                <span style={{ fontSize: '11px', opacity: 0.8 }}>{(currentPrice + 0.00010).toFixed(5)}</span>
                            </button>
                            <button className="btn btn-sell" onClick={() => executeTrade('SELL')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/bear_icon.png" alt="Bear" style={{ height: '35px', marginBottom: '5px' }} />
                                <span>MARKET SELL</span>
                                <span style={{ fontSize: '11px', opacity: 0.8 }}>{(currentPrice - 0.00010).toFixed(5)}</span>
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                        <RiskDashboard trades={trades} onCloseTrade={closeTrade} />
                    </div>
                </div>
            </div>
        </div>
    );
};
