import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TradingViewChart } from '../components/chart/TradingViewChart';
import { RiskDashboard } from '../components/dashboard/RiskDashboard';
import { TopNavbar } from '../components/TopNavbar';
import { ReplayToolbar } from '../components/terminal/ReplayToolbar';
import { Maximize, Minimize, Play } from 'lucide-react';

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
    const [currentSymbol, setCurrentSymbol] = useState('EURUSD');
    const [isReplaying, setIsReplaying] = useState(false);
    const [replaySpeed, setReplaySpeed] = useState(1);
    const [replayIndex, setReplayIndex] = useState(50);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [prices, setPrices] = useState<Record<string, { value: number, change: number, trend: 'up' | 'down' }>>({
        'EURUSD': { value: 1.08425, change: 0.12, trend: 'up' },
        'GBPUSD': { value: 1.26540, change: -0.05, trend: 'down' },
        'USDJPY': { value: 150.320, change: 0.21, trend: 'up' },
        'XAUUSD': { value: 2024.50, change: 0.45, trend: 'up' },
        'BTCUSD': { value: 64320.00, change: -1.20, trend: 'down' }
    });

    // Simulate Live Market Updates
    useEffect(() => {
        if (mode === 'live') {
            const interval = setInterval(() => {
                setPrices(prev => {
                    const next: Record<string, { value: number, change: number, trend: 'up' | 'down' }> = {};
                    Object.keys(prev).forEach(k => {
                        const maxFluctuation = k === 'BTCUSD' ? 50 : k === 'XAUUSD' ? 2 : 0.0005;
                        const fluctuation = (Math.random() - 0.5) * maxFluctuation;
                        const newValue = Math.max(0, prev[k].value + fluctuation);
                        const isUp = fluctuation >= 0;
                        next[k] = {
                            value: newValue,
                            change: prev[k].change + (isUp ? 0.01 : -0.01),
                            trend: isUp ? 'up' : 'down'
                        };
                    });
                    return next;
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [mode]);

    // Main Replay Loop
    useEffect(() => {
        let interval: any;
        if (mode === 'replay' && isReplaying && historicalData.length > 0) {
            interval = setInterval(() => {
                setReplayIndex(prev => {
                    if (prev < historicalData.length) return prev + 1;
                    setIsReplaying(false);
                    return prev;
                });
            }, 1000 / replaySpeed);
        }
        return () => clearInterval(interval);
    }, [mode, isReplaying, replaySpeed, historicalData]);

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
            const formattedSymbol = currentSymbol === 'EURUSD' ? 'OANDA:EUR_USD' : currentSymbol;
            const res = await axios.get(`${API_BASE}/api/market/history?symbol=${formattedSymbol}&start=${start}&end=${end}`);
            
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
                        {Object.keys(prices).map(symbol => {
                            const data = prices[symbol];
                            const isUp = data.trend === 'up';
                            const color = isUp ? 'var(--success)' : 'var(--danger)';
                            const sign = isUp ? '+' : '';
                            const decimals = symbol.includes('JPY') ? 3 : symbol.includes('USD') && symbol !== 'XAUUSD' && symbol !== 'BTCUSD' ? 5 : 2;
                            return (
                                <div key={symbol} 
                                     onClick={() => { setCurrentSymbol(symbol); setCurrentPrice(prices[symbol].value); }}
                                     className="exness-card" 
                                     style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: symbol === currentSymbol ? 'var(--bg-hover)' : 'transparent', borderLeft: symbol === currentSymbol ? '3px solid var(--exness-yellow)' : '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: symbol === currentSymbol ? 'var(--exness-yellow)' : 'var(--text-main)' }}>{symbol}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Forex • Live</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: color, transition: 'color 0.3s' }}>
                                            {data.value.toFixed(decimals)}
                                        </div>
                                        <div style={{ fontSize: '11px', color: color }}>
                                            {sign}{data.change.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Trading Area */}
                <div style={
                    isFullscreen ? {
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column'
                    } : { display: 'grid', gridTemplateRows: '1fr 200px', flex: 1, overflow: 'hidden' }
                }>
                    <div className="grid-cell" style={{ position: 'relative', padding: 0, flex: isFullscreen ? 1 : undefined }}>
                        <TradingViewChart 
                            symbol={currentSymbol}
                            mode={mode} 
                            historicalData={historicalData} 
                            onPriceUpdate={setCurrentPrice}
                            replayIndex={replayIndex}
                        />
                        
                        {/* Overlay Controls */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                            <div className="exness-card" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: '600' }}>{currentSymbol}</span>
                                <span style={{ color: 'var(--success)' }}>{currentPrice.toFixed(currentSymbol.includes('JPY') ? 3 : 5)}</span>
                            </div>
                            
                            {mode === 'live' ? (
                                <button onClick={() => { setMode('replay'); setReplayIndex(50); setIsReplaying(true); }} className="btn-exness" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }} title="Enter Replay Mode">
                                    <Play size={16} fill="currentColor" />
                                    <span>Replay</span>
                                </button>
                            ) : (
                                <ReplayToolbar 
                                    isPlaying={isReplaying}
                                    onTogglePlay={() => setIsReplaying(!isReplaying)}
                                    onRewind={() => setReplayIndex(prev => Math.max(1, prev - 10))} 
                                    onForward={() => setReplayIndex(prev => Math.min(historicalData.length, prev + 1))} 
                                    speed={replaySpeed}
                                    onSpeedChange={setReplaySpeed}
                                    onClose={() => {
                                        setMode('live');
                                        setIsReplaying(false);
                                    }}
                                />
                            )}
                            
                            <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn-exness" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Chart"}>
                                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
