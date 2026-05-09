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
    const [replayStartDate, setReplayStartDate] = useState(() => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [prices, setPrices] = useState<Record<string, { value: number, change: number, trend: 'up' | 'down' }>>({
        'EURUSD': { value: 1.08425, change: 0.12, trend: 'up' },
        'GBPUSD': { value: 1.26540, change: -0.05, trend: 'down' },
        'USDJPY': { value: 150.320, change: 0.21, trend: 'up' },
        'XAUUSD': { value: 2024.50, change: 0.45, trend: 'up' },
        'BTCUSD': { value: 64320.00, change: -1.20, trend: 'down' }
    });

    // Simulate Live Market Updates with Real Base Values
    useEffect(() => {
        // Initial fetch for forex base (today's live value)
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(r => r.json())
            .then(data => {
                setPrices(prev => ({
                    ...prev,
                    'EURUSD': { ...prev['EURUSD'], value: 1 / data.rates.EUR },
                    'GBPUSD': { ...prev['GBPUSD'], value: 1 / data.rates.GBP },
                    'USDJPY': { ...prev['USDJPY'], value: data.rates.JPY }
                }));
            })
            .catch(() => console.error("Could not load real forex base rates"));

        if (mode === 'live') {
            const interval = setInterval(async () => {
                let btcPrice = 0, xauPrice = 0;
                let apiSuccess = false;
                try {
                    const [btcRes, paxgRes] = await Promise.all([
                        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
                        fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT')
                    ]);
                    const btcData = await btcRes.json();
                    const paxgData = await paxgRes.json();
                    btcPrice = parseFloat(btcData.price);
                    xauPrice = parseFloat(paxgData.price);
                    apiSuccess = true;
                } catch(e) { apiSuccess = false; }

                setPrices(prev => {
                    const next: Record<string, { value: number, change: number, trend: 'up' | 'down' }> = {};
                    
                    ['EURUSD', 'GBPUSD', 'USDJPY'].forEach(k => {
                        const maxFluctuation = k === 'USDJPY' ? 0.01 : 0.00005;
                        const fluctuation = (Math.random() - 0.5) * maxFluctuation;
                        const newValue = prev[k].value + fluctuation;
                        const isUp = fluctuation >= 0;
                        next[k] = {
                            value: newValue,
                            change: prev[k].change + (isUp ? 0.01 : -0.01),
                            trend: isUp ? 'up' : 'down'
                        };
                    });

                    if (apiSuccess) {
                        const btcTrend = btcPrice >= prev['BTCUSD'].value ? 'up' : 'down';
                        next['BTCUSD'] = { value: btcPrice, change: prev['BTCUSD'].change + (btcTrend === 'up' ? 0.05 : -0.05), trend: btcTrend };
                        
                        const xauTrend = xauPrice >= prev['XAUUSD'].value ? 'up' : 'down';
                        next['XAUUSD'] = { value: xauPrice, change: prev['XAUUSD'].change + (xauTrend === 'up' ? 0.02 : -0.02), trend: xauTrend };
                    } else {
                        // Fallback if Binance is blocked
                        ['BTCUSD', 'XAUUSD'].forEach(k => {
                            const maxFluctuation = k === 'BTCUSD' ? 10 : 0.5;
                            const fluctuation = (Math.random() - 0.5) * maxFluctuation;
                            next[k] = {
                                value: prev[k].value + fluctuation,
                                change: prev[k].change + (fluctuation >= 0 ? 0.05 : -0.05),
                                trend: fluctuation >= 0 ? 'up' : 'down'
                            };
                        });
                    }
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

    const fetchHistory = async (customStart?: string) => {
        try {
            const start = customStart ? new Date(customStart).toISOString() : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const end = new Date().toISOString();
            const formattedSymbol = currentSymbol === 'EURUSD' ? 'OANDA:EUR_USD' : currentSymbol;
            
            let fetchedData: any[] = [];
            try {
                const res = await axios.get(`${API_BASE}/api/market/history?symbol=${formattedSymbol}&start=${start}&end=${end}`);
                if (res.data && res.data.length > 0) fetchedData = res.data;
            } catch (err) {
                console.warn("Backend API failed or empty, generating fallback replay data.");
            }

            if (fetchedData.length > 0) {
                const uniqueData = [];
                const seenTimes = new Set();
                for (let c of fetchedData) {
                    const t = Math.floor(new Date(c.timestamp).getTime() / 1000);
                    if (!seenTimes.has(t)) {
                        seenTimes.add(t);
                        uniqueData.push({
                            time: t,
                            open: c.open, high: c.high, low: c.low, close: c.close
                        });
                    }
                }
                uniqueData.sort((a, b) => a.time - b.time);
                setHistoricalData(uniqueData);
            } else {
                // Generate realistic mock history so Replay ALWAYS works
                const mockData = [];
                let basePrice = currentPrice || 1.1000;
                let startTime = customStart ? new Date(customStart).getTime() / 1000 : Date.now() / 1000 - (500 * 15 * 60);
                
                for (let i = 0; i < 500; i++) {
                    const volatility = currentSymbol.includes('BTC') ? 50 : currentSymbol.includes('XAU') ? 2 : 0.002;
                    const open = basePrice;
                    const close = basePrice + (Math.random() - 0.5) * volatility;
                    const high = Math.max(open, close) + Math.random() * (volatility / 2);
                    const low = Math.min(open, close) - Math.random() * (volatility / 2);
                    
                    mockData.push({
                        time: Math.floor(startTime + (i * 15 * 60)), // 15 min increments
                        open: Number(open.toFixed(5)), 
                        high: Number(high.toFixed(5)), 
                        low: Number(low.toFixed(5)), 
                        close: Number(close.toFixed(5))
                    });
                    basePrice = close;
                }
                setHistoricalData(mockData);
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
                    } : { display: 'flex', flexDirection: 'column', flex: 1, minHeight: '600px', overflow: 'hidden' }
                }>
                    <div className="grid-cell" style={{ position: 'relative', padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <TradingViewChart 
                            symbol={currentSymbol}
                            mode={mode} 
                            historicalData={historicalData} 
                            onPriceUpdate={setCurrentPrice}
                            replayIndex={replayIndex}
                            livePrice={currentPrice}
                        />
                        
                        {/* Top Left Overlay Controls */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                            <div className="exness-card" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: '600' }}>{currentSymbol}</span>
                                <span style={{ color: 'var(--success)' }}>{currentPrice.toFixed(currentSymbol.includes('JPY') ? 3 : 5)}</span>
                            </div>
                        </div>

                        {/* Top Right Overlay Controls */}
                        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                            {mode === 'live' && (
                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.8)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                    <input 
                                        type="date" 
                                        value={replayStartDate}
                                        onChange={(e) => setReplayStartDate(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', padding: '0 8px', cursor: 'pointer', fontFamily: 'inherit' }}
                                        title="Select start date for replay"
                                    />
                                    <button 
                                        onClick={async () => { 
                                            await fetchHistory(replayStartDate);
                                            setMode('replay'); 
                                            setReplayIndex(50); 
                                            setIsReplaying(true); 
                                        }} 
                                        className="btn-exness" 
                                        style={{ padding: '6px 12px', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid #333', borderRadius: 0 }} 
                                        title="Enter Replay Mode">
                                        <Play size={16} fill="var(--exness-yellow)" />
                                        <span style={{ color: 'var(--exness-yellow)', fontWeight: 600 }}>Replay</span>
                                    </button>
                                </div>
                            )}
                            <button onClick={() => setIsFullscreen(!isFullscreen)} className="btn-exness" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Chart"}>
                                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                            </button>
                        </div>

                        {/* Bottom Center Replay Controls (GoCharting style) */}
                        {mode === 'replay' && (
                            <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
