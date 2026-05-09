import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TradingViewChart } from '../components/chart/TradingViewChart';
import { RiskDashboard } from '../components/dashboard/RiskDashboard';
import { RiskRewardGraph } from '../components/dashboard/RiskRewardGraph';
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
    const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
    const [timeframe, setTimeframe] = useState<string>('15m');

    const [stopLoss, setStopLoss] = useState<string>('');
    const [takeProfit, setTakeProfit] = useState<string>('');

    const calculatedRR = React.useMemo(() => {
        const slVal = parseFloat(stopLoss);
        const tpVal = parseFloat(takeProfit);
        if (!slVal || !tpVal || slVal <= 0 || tpVal <= 0) return null;
        
        const risk = Math.abs(currentPrice - slVal);
        const reward = Math.abs(tpVal - currentPrice);
        if (risk === 0) return null;
        return (reward / risk).toFixed(2);
    }, [stopLoss, takeProfit, currentPrice]);

    const [prices, setPrices] = useState<Record<string, { value: number, change: number, trend: 'up' | 'down' }>>({
        'EURUSD': { value: 1.0850, change: 0.0, trend: 'up' },
        'GBPUSD': { value: 1.2650, change: 0.0, trend: 'up' },
        'USDJPY': { value: 150.30, change: 0.0, trend: 'up' },
        'XAUUSD': { value: 2025.0, change: 0.0, trend: 'up' },
        'BTCUSD': { value: 64300.0, change: 0.0, trend: 'up' }
    });

    // Fetch Live Real-Time Market updates from Binance via Backend Proxy with today's live values
    useEffect(() => {
        const fetchAllLivePrices = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/market/prices`);
                const data = await res.json();
                
                const getPrice = (symbol: string) => {
                    const item = data.find((d: any) => d.symbol === symbol);
                    return item ? parseFloat(item.price) : 0;
                };

                setPrices(prev => {
                    const next: Record<string, { value: number, change: number, trend: 'up' | 'down' }> = {};
                    const mappings = {
                        'EURUSD': 'EURUSDT',
                        'GBPUSD': 'GBPUSDT',
                        'USDJPY': 'USDTJPY',
                        'XAUUSD': 'PAXGUSDT',
                        'BTCUSD': 'BTCUSDT'
                    };

                    Object.keys(mappings).forEach(key => {
                        const binanceSym = (mappings as any)[key];
                        const val = getPrice(binanceSym);
                        if (val > 0) {
                            const prevVal = prev[key].value;
                            const trend = val >= prevVal ? 'up' : 'down';
                            const percentChange = prevVal > 0 ? ((val - prevVal) / prevVal) * 100 : 0;
                            next[key] = {
                                value: val,
                                change: percentChange !== 0 ? percentChange : prev[key].change,
                                trend: trend as any
                            };
                        } else {
                            next[key] = prev[key];
                        }
                    });
                    return next;
                });
            } catch (e) {
                console.error("Could not load real-time baseline prices", e);
            }
        };

        // Initial load
        fetchAllLivePrices();

        if (mode === 'live') {
            const interval = setInterval(fetchAllLivePrices, 2000);
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

    useEffect(() => {
        fetchHistory(replayStartDate, timeframe);
    }, [currentSymbol, timeframe, replayStartDate]);

    const fetchHistory = async (customStart?: string, customTimeframe?: string) => {
        try {
            const tf = customTimeframe || timeframe;
            
            const startTimeMs = customStart ? new Date(customStart).getTime() : undefined;

            let url = `${API_BASE}/api/market/history?symbol=${currentSymbol}&timeframe=${tf}`;
            if (startTimeMs) {
                url += `&startTime=${startTimeMs}`;
            }

            let fetchedData: any[] = [];
            try {
                const res = await axios.get(url);
                if (res.data && res.data.length > 0) {
                    fetchedData = res.data.map((k: any) => ({
                        time: Math.floor(k[0] / 1000),
                        open: Number(parseFloat(k[1])),
                        high: Number(parseFloat(k[2])),
                        low: Number(parseFloat(k[3])),
                        close: Number(parseFloat(k[4]))
                    }));
                }
            } catch (err) {
                console.warn("Backend market history proxy failed, falling back to local simulation.", err);
            }

            if (fetchedData.length > 0) {
                const uniqueData = [];
                const seenTimes = new Set();
                for (let c of fetchedData) {
                    if (!seenTimes.has(c.time)) {
                        seenTimes.add(c.time);
                        uniqueData.push(c);
                    }
                }
                uniqueData.sort((a, b) => a.time - b.time);
                setHistoricalData(uniqueData);
                if (uniqueData.length > 0) {
                    setCurrentPrice(uniqueData[uniqueData.length - 1].close);
                }
            } else {
                // Generate realistic mock history so Replay ALWAYS works
                const mockData = [];
                let basePrice = currentPrice || 1.1000;
                let startTime = customStart ? new Date(customStart).getTime() / 1000 : Date.now() / 1000 - (500 * 15 * 60);
                
                let stepSeconds = 15 * 60; // default 15m
                if (tf === '1m') stepSeconds = 60;
                else if (tf === '5m') stepSeconds = 5 * 60;
                else if (tf === '15m') stepSeconds = 15 * 60;
                else if (tf === '1H') stepSeconds = 60 * 60;
                else if (tf === '4H') stepSeconds = 4 * 60 * 60;
                else if (tf === '1D') stepSeconds = 24 * 60 * 60;

                for (let i = 0; i < 500; i++) {
                    const volatility = currentSymbol.includes('BTC') ? 50 : currentSymbol.includes('XAU') ? 2 : 0.002;
                    const open = basePrice;
                    const close = basePrice + (Math.random() - 0.5) * volatility;
                    const high = Math.max(open, close) + Math.random() * (volatility / 2);
                    const low = Math.min(open, close) - Math.random() * (volatility / 2);
                    
                    mockData.push({
                        time: Math.floor(startTime + (i * stepSeconds)), // dynamic increments
                        open: Number(open.toFixed(5)), 
                        high: Number(high.toFixed(5)), 
                        low: Number(low.toFixed(5)), 
                        close: Number(close.toFixed(5))
                    });
                    basePrice = close;
                }
                setHistoricalData(mockData);
                if (mockData.length > 0) {
                    setCurrentPrice(mockData[mockData.length - 1].close);
                }
            }
        } catch(e) { console.error("Could not fetch historical data"); }
    };

    const executeTrade = async (type: 'BUY' | 'SELL') => {
        try {
            const res = await axios.post(`${API_BASE}/api/trades/execute`, {
                symbol: currentSymbol, entryPrice: currentPrice, positionSize: positionSize, tradeType: type
            });
            setTrades([...trades, res.data]);
            setStopLoss('');
            setTakeProfit('');
        } catch(err) { console.error("Trade failed", err); }
    };

    const closeTrade = async (id: number) => {
        try {
            const res = await axios.post(`${API_BASE}/api/trades/close/${id}`, {
                exitPrice: currentPrice
            });
            setTrades(trades.map(t => t.id === id ? res.data : t));
        } catch(err) { console.error("Failed closing trade", err); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#000' }}>
            <div className="dynamic-bg"></div>
            <TopNavbar />
            
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: isFullscreen ? '1fr' : '280px 1fr 340px', height: 'calc(100vh - 60px)', gap: '1px', background: 'var(--border)' }}>
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
                            activeIndicators={activeIndicators}
                        />
                        
                        {/* Top Left Overlay Controls */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                            <div className="exness-card" style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: '600' }}>{currentSymbol}</span>
                                <span style={{ color: 'var(--success)' }}>{currentPrice.toFixed(currentSymbol.includes('JPY') ? 3 : 5)}</span>
                            </div>
                            
                            {/* Indicator Toggles */}
                            <div className="exness-card" style={{ padding: '4px', background: 'rgba(0,0,0,0.8)', display: 'flex', gap: '4px' }}>
                                <button 
                                    onClick={() => setActiveIndicators(prev => prev.includes('SMA20') ? prev.filter(i => i !== 'SMA20') : [...prev, 'SMA20'])}
                                    style={{ background: activeIndicators.includes('SMA20') ? 'var(--exness-yellow)' : 'transparent', color: activeIndicators.includes('SMA20') ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                    SMA 20
                                </button>
                                <button 
                                    onClick={() => setActiveIndicators(prev => prev.includes('SMA50') ? prev.filter(i => i !== 'SMA50') : [...prev, 'SMA50'])}
                                    style={{ background: activeIndicators.includes('SMA50') ? 'var(--exness-yellow)' : 'transparent', color: activeIndicators.includes('SMA50') ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                    SMA 50
                                </button>
                                <button 
                                    onClick={() => setActiveIndicators(prev => prev.includes('EMA9') ? prev.filter(i => i !== 'EMA9') : [...prev, 'EMA9'])}
                                    style={{ background: activeIndicators.includes('EMA9') ? 'var(--exness-yellow)' : 'transparent', color: activeIndicators.includes('EMA9') ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                    EMA 9
                                </button>
                                <button 
                                    onClick={() => setActiveIndicators(prev => prev.includes('EMA21') ? prev.filter(i => i !== 'EMA21') : [...prev, 'EMA21'])}
                                    style={{ background: activeIndicators.includes('EMA21') ? 'var(--exness-yellow)' : 'transparent', color: activeIndicators.includes('EMA21') ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                    EMA 21
                                </button>
                                <button 
                                    onClick={() => setActiveIndicators(prev => prev.includes('RSI14') ? prev.filter(i => i !== 'RSI14') : [...prev, 'RSI14'])}
                                    style={{ background: activeIndicators.includes('RSI14') ? 'var(--exness-yellow)' : 'transparent', color: activeIndicators.includes('RSI14') ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                    RSI 14
                                </button>
                            </div>

                            {/* Timeframe Toggles */}
                            <div className="exness-card" style={{ padding: '4px', background: 'rgba(0,0,0,0.8)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#888', padding: '0 4px', fontWeight: 'bold' }}>TF</span>
                                {['1m', '5m', '15m', '1H', '1D'].map(tf => (
                                    <button 
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        style={{ background: timeframe === tf ? 'var(--exness-yellow)' : 'transparent', color: timeframe === tf ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                                        {tf}
                                    </button>
                                ))}
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

                {/* Right Panel: Order Placement & Risk-Reward Center */}
                {!isFullscreen && (
                    <div className="grid-cell" style={{ borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '16px', padding: '16px' }}>
                        <div>
                            <span style={{ fontWeight: '600', fontSize: '14px', display: 'block', marginBottom: '15px' }}>Practicing Order Desk</span>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* Position Size */}
                                <div>
                                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Position Size (Units)</label>
                                    <input 
                                        type="number" 
                                        value={positionSize}
                                        onChange={(e) => setPositionSize(Number(e.target.value))}
                                        style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                                    />
                                </div>

                                {/* Stop Loss */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Stop Loss (SL)</label>
                                        <input 
                                            type="number" 
                                            step="0.00001"
                                            value={stopLoss}
                                            onChange={(e) => setStopLoss(e.target.value)}
                                            placeholder="None"
                                            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Take Profit (TP)</label>
                                        <input 
                                            type="number" 
                                            step="0.00001"
                                            value={takeProfit}
                                            onChange={(e) => setTakeProfit(e.target.value)}
                                            placeholder="None"
                                            style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                {/* Calculated R:R Display */}
                                {calculatedRR && (
                                    <div className="exness-card" style={{ padding: '8px 12px', background: 'rgba(255,211,0,0.05)', borderColor: 'rgba(255,211,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--exness-yellow)', fontWeight: 'bold' }}>PLANNED R:R RATIO:</span>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: parseFloat(calculatedRR) >= 2.0 ? 'var(--success)' : 'var(--exness-yellow)' }}>
                                            1 : {calculatedRR}
                                        </span>
                                    </div>
                                )}

                                {/* Buy / Sell Actions */}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <button 
                                        onClick={() => executeTrade('BUY')}
                                        className="trade-btn trade-btn-buy"
                                    >
                                        <span style={{ fontSize: '12px', color: '#888' }}>BUY</span>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>Ask</span>
                                    </button>
                                    <button 
                                        onClick={() => executeTrade('SELL')}
                                        className="trade-btn trade-btn-sell"
                                    >
                                        <span style={{ fontSize: '12px', color: '#888' }}>SELL</span>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--danger)' }}>Bid</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Risk-Reward Performance Chart Component */}
                        <RiskRewardGraph trades={trades} />

                        {/* Performance Metrics summary */}
                        <div className="exness-card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Metrics</span>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WIN RATE</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--exness-yellow)' }}>
                                        {trades.length > 0 ? ((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100).toFixed(1) : '0.0'}%
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NET P&L</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: trades.reduce((acc, t) => acc + (t.pnl || 0), 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        ${trades.reduce((acc, t) => acc + (t.pnl || 0), 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '10px' }}>Active Positions</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {trades.filter(t => !t.exitPrice).map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: `3px solid ${t.tradeType === 'BUY' ? 'var(--success)' : 'var(--danger)'}` }}>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.symbol} {t.tradeType}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Size: {t.positionSize.toLocaleString()}</div>
                                        </div>
                                        <button 
                                            onClick={() => closeTrade(t.id)}
                                            style={{ background: 'rgba(239,83,80,0.15)', color: 'var(--danger)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            CLOSE
                                        </button>
                                    </div>
                                ))}
                                {trades.filter(t => !t.exitPrice).length === 0 && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No active positions.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
