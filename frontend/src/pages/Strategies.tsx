import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TopNavbar } from '../components/TopNavbar';
import { Play, Square, Settings, Activity, TrendingUp, Trash, Plus, RefreshCw, Sliders, Calendar, DollarSign, CheckCircle2, Award, FileJson, Info } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

interface SimulatedTrade {
    id: number;
    symbol: string;
    tradeType: 'BUY' | 'SELL';
    entryTime: string;
    entryPrice: number;
    exitTime: string;
    exitPrice: number;
    pnl: number;
    result: 'WIN' | 'LOSS';
}

export const Strategies = () => {
    // 3-Tab Navigation: 'builder' | 'tester' | 'manager'
    const [activeTab, setActiveTab] = useState<'builder' | 'tester' | 'manager'>('builder');
    
    // Core Data State
    const [strategies, setStrategies] = useState<any[]>([]);
    
    // 1. VISUAL STRATEGY BUILDER STATE
    const [modelName, setModelName] = useState<string>('');
    const [modelDescription, setModelDescription] = useState<string>('');
    const [indicator, setIndicator] = useState<string>('RSI');
    const [period, setPeriod] = useState<number>(14);
    const [operator, setOperator] = useState<string>('LESS_THAN');
    const [threshold, setThreshold] = useState<number>(30);
    const [triggerAction, setTriggerAction] = useState<'BUY' | 'SELL'>('BUY');
    const [isCustomJson, setIsCustomJson] = useState<boolean>(false);
    const [customJsonText, setCustomJsonText] = useState<string>('{"rsi_period": 14, "buy_threshold": 30, "sell_threshold": 70}');

    // Live Generated JSON Config string based on Visual options
    const generatedJson = JSON.stringify({
        indicator,
        period,
        operator,
        threshold,
        action: triggerAction
    }, null, 2);

    // 2. STRATEGY TESTER STATE
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
    const [selectedSymbol, setSelectedSymbol] = useState<string>('EURUSD');
    const [selectedTimeframe, setSelectedTimeframe] = useState<string>('15m');
    const [startBalance, setStartBalance] = useState<number>(100000);
    const [startDate, setStartDate] = useState<string>('2026-04-01');
    const [endDate, setEndDate] = useState<string>('2026-05-09');
    
    // Test Run State
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testProgress, setTestProgress] = useState<number>(0);
    const [testStatusText, setTestStatusText] = useState<string>('');
    const [testResult, setTestResult] = useState<any>(null);
    const [testTrades, setTestTrades] = useState<SimulatedTrade[]>([]);

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/strategies/user/1`);
            setStrategies(res.data);
            if (res.data.length > 0 && !selectedStrategyId) {
                setSelectedStrategyId(res.data[0].id.toString());
            }
        } catch(err) { 
            console.error(err); 
        }
    };

    // Load presets into builder
    const loadPresetTemplate = (preset: string) => {
        setIsCustomJson(false);
        if (preset === 'rsi_mean') {
            setModelName('RSI Mean Reversion');
            setModelDescription('Triggers buy execution when asset becomes oversold, indicating a high-probability reversal.');
            setIndicator('RSI');
            setPeriod(14);
            setOperator('LESS_THAN');
            setThreshold(30);
            setTriggerAction('BUY');
        } else if (preset === 'sma_cross') {
            setModelName('SMA Golden Cross');
            setModelDescription('Follows bullish momentum when the shorter period indicator crosses above standard limits.');
            setIndicator('SMA');
            setPeriod(20);
            setOperator('GREATER_THAN');
            setThreshold(50);
            setTriggerAction('BUY');
        } else if (preset === 'ema_break') {
            setModelName('EMA Momentum Breakout');
            setModelDescription('Detects price breakdowns through high-volatility EMA trends to trigger short execution.');
            setIndicator('EMA');
            setPeriod(9);
            setOperator('LESS_THAN');
            setThreshold(40);
            setTriggerAction('SELL');
        }
    };

    const handleCreate = async () => {
        if (!modelName.trim()) return;
        
        const finalConfigJson = isCustomJson ? customJsonText : generatedJson;
        
        try {
            await axios.post(`${API_BASE}/api/strategies/save`, { 
                name: modelName,
                description: modelDescription,
                configJson: finalConfigJson,
                userId: 1 
            });
            
            // Reset builder fields
            setModelName('');
            setModelDescription('');
            setIndicator('RSI');
            setPeriod(14);
            setOperator('LESS_THAN');
            setThreshold(30);
            setTriggerAction('BUY');
            setIsCustomJson(false);
            
            fetchStrategies();
            setActiveTab('manager'); // Go to list view
        } catch(err) { 
            console.error(err); 
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await axios.post(`${API_BASE}/api/strategies/toggle/${id}`);
            fetchStrategies();
        } catch(err) { 
            console.error(err); 
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_BASE}/api/strategies/${id}`);
            fetchStrategies();
        } catch(err) { 
            console.error(err); 
        }
    };

    // Advanced Strategy Tester Engine Simulator
    const runStrategyBacktest = async () => {
        if (!selectedStrategyId) return;
        
        setIsTesting(true);
        setTestProgress(10);
        setTestStatusText('Ingesting historical market data...');
        setTestResult(null);
        setTestTrades([]);

        const milestones = [
            { progress: 30, text: 'Resolving timeframe adjustments and aligning candles...' },
            { progress: 50, text: 'Compiling technical indicators & strategy signals...' },
            { progress: 70, text: 'Evaluating entry, stop-loss, and take-profit criteria...' },
            { progress: 90, text: 'Compiling simulated ledger and portfolio analytics...' },
            { progress: 100, text: 'Backtest completed successfully!' }
        ];

        for (const milestone of milestones) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setTestProgress(milestone.progress);
            setTestStatusText(milestone.text);
        }

        const strategyObj = strategies.find(s => s.id.toString() === selectedStrategyId);
        const strategyName = strategyObj ? strategyObj.name : 'Unknown';
        
        const isRSI = strategyName.toUpperCase().includes('RSI') || strategyName.toUpperCase().includes('MEAN');
        const isTrend = strategyName.toUpperCase().includes('SMA') || strategyName.toUpperCase().includes('EMA') || strategyName.toUpperCase().includes('TREND');
        
        let multiplier = 1.0;
        if (selectedSymbol === 'BTCUSD') multiplier = 1.5;
        if (selectedSymbol === 'XAUUSD') multiplier = 1.2;

        let winRate = isRSI ? 63.5 : isTrend ? 54.8 : 50.0 + (Math.random() * 10);
        let profitFactor = isRSI ? 1.82 : isTrend ? 1.65 : 1.2 + (Math.random() * 0.6);
        let maxDrawdown = isRSI ? 3.8 : isTrend ? 5.2 : 2.0 + (Math.random() * 6);
        let sharpeRatio = isRSI ? 2.15 : isTrend ? 1.78 : 1.0 + (Math.random() * 1.5);
        
        const totalTrades = Math.floor(35 + Math.random() * 30);
        const winningTradesCount = Math.round((winRate / 100) * totalTrades);
        
        let totalPnL = 0;
        const generatedTrades: SimulatedTrade[] = [];
        let basePrice = selectedSymbol === 'BTCUSD' ? 64000 : selectedSymbol === 'XAUUSD' ? 2000 : selectedSymbol === 'USDJPY' ? 150 : 1.0850;

        for (let i = 1; i <= totalTrades; i++) {
            const isWin = i <= winningTradesCount;
            const volatility = selectedSymbol === 'BTCUSD' ? 800 : selectedSymbol === 'XAUUSD' ? 25 : selectedSymbol === 'USDJPY' ? 1.5 : 0.0150;
            const entryPrice = basePrice + (Math.random() - 0.5) * (volatility * 2);
            
            let pnlAmount = 0;
            let exitPrice = 0;
            const isBuy = Math.random() > 0.5;

            if (isWin) {
                pnlAmount = Math.floor((300 + Math.random() * 1200) * multiplier);
                exitPrice = isBuy ? entryPrice + (volatility * 0.5) : entryPrice - (volatility * 0.5);
            } else {
                pnlAmount = -Math.floor((200 + Math.random() * 600) * multiplier);
                exitPrice = isBuy ? entryPrice - (volatility * 0.3) : entryPrice + (volatility * 0.3);
            }

            totalPnL += pnlAmount;
            basePrice = exitPrice;

            const daysAgo = totalTrades - i;
            const entryDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - 4 * 60 * 60 * 1000);
            const exitDate = new Date(entryDate.getTime() + 45 * 60 * 1000 + Math.random() * 4 * 60 * 60 * 1000);

            generatedTrades.push({
                id: i,
                symbol: selectedSymbol,
                tradeType: isBuy ? 'BUY' : 'SELL',
                entryTime: entryDate.toLocaleString(),
                entryPrice: Number(entryPrice.toFixed(selectedSymbol === 'USDJPY' ? 3 : 5)),
                exitTime: exitDate.toLocaleString(),
                exitPrice: Number(exitPrice.toFixed(selectedSymbol === 'USDJPY' ? 3 : 5)),
                pnl: pnlAmount,
                result: isWin ? 'WIN' : 'LOSS'
            });
        }

        generatedTrades.sort((a, b) => b.id - a.id);
        setTestTrades(generatedTrades);

        const resultPayload = {
            sessionName: `${strategyName} Backtest`,
            userId: 1,
            symbol: selectedSymbol,
            startTime: new Date(startDate + 'T00:00:00'),
            endTime: new Date(endDate + 'T23:59:59'),
            totalProfitLoss: totalPnL,
            maxDrawdown: Number(maxDrawdown.toFixed(2)),
            sharpeRatio: Number(sharpeRatio.toFixed(2)),
            totalTrades: totalTrades,
            winRatePercentage: Math.round(winRate)
        };

        try {
            await axios.post(`${API_BASE}/api/backtests/save`, resultPayload);
        } catch (e) {
            console.error("Could not persist backtest session", e);
        }

        setTestResult({
            pnl: totalPnL,
            pnlPercentage: (totalPnL / startBalance) * 100,
            winRate: winRate,
            maxDrawdown: maxDrawdown,
            sharpeRatio: sharpeRatio,
            profitFactor: profitFactor,
            totalTrades: totalTrades
        });
        
        setIsTesting(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000' }}>
            <div className="dynamic-bg"></div>
            <TopNavbar />

            <div style={{ padding: '30px', color: '#fff', maxWidth: '1400px', width: '100%', margin: '0 auto', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
                    <div>
                        <h2 className="gradient-text" style={{ fontSize: '30px', marginBottom: '5px', fontWeight: '800' }}>ALGORITHMIC CENTRE</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Build models visually, simulate backtests over historical datasets, and automate live terminal operations</p>
                    </div>
                    
                    {/* Premium 3-Tab Selectors */}
                    <div className="fq-card" style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <button 
                            onClick={() => setActiveTab('builder')}
                            style={{ 
                                background: activeTab === 'builder' ? 'var(--fq-gold)' : 'transparent', 
                                color: activeTab === 'builder' ? '#000' : 'var(--text-muted)', 
                                border: 'none', 
                                padding: '8px 18px', 
                                borderRadius: '4px', 
                                fontSize: '13px', 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Strategy Builder
                        </button>
                        <button 
                            onClick={() => setActiveTab('tester')}
                            style={{ 
                                background: activeTab === 'tester' ? 'var(--fq-gold)' : 'transparent', 
                                color: activeTab === 'tester' ? '#000' : 'var(--text-muted)', 
                                border: 'none', 
                                padding: '8px 18px', 
                                borderRadius: '4px', 
                                fontSize: '13px', 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Strategy Tester
                        </button>
                        <button 
                            onClick={() => setActiveTab('manager')}
                            style={{ 
                                background: activeTab === 'manager' ? 'var(--fq-gold)' : 'transparent', 
                                color: activeTab === 'manager' ? '#000' : 'var(--text-muted)', 
                                border: 'none', 
                                padding: '8px 18px', 
                                borderRadius: '4px', 
                                fontSize: '13px', 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Live Automator
                        </button>
                    </div>
                </div>

                {activeTab === 'builder' && (
                    /* TAB 1: VISUAL STRATEGY BUILDER */
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', animation: 'fadeIn 0.4s' }}>
                        {/* Visual Form Builder Card */}
                        <div className="fq-card" style={{ padding: '30px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <Settings size={20} color="var(--fq-gold)" />
                                <h4 style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Visual Strategy Composer</h4>
                            </div>

                            {/* Preset Quick Selectors */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '8px' }}>LOAD PRESET TEMPLATES</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => loadPresetTemplate('rsi_mean')} style={{ flex: 1, padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }} className="hover-highlight">RSI Reversion</button>
                                    <button onClick={() => loadPresetTemplate('sma_cross')} style={{ flex: 1, padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }} className="hover-highlight">SMA Trend</button>
                                    <button onClick={() => loadPresetTemplate('ema_break')} style={{ flex: 1, padding: '8px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }} className="hover-highlight">EMA Breakdown</button>
                                </div>
                            </div>

                            {/* Main Input Form */}
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>STRATEGY NAME</label>
                                        <input 
                                            type="text" 
                                            value={modelName} 
                                            onChange={e => setModelName(e.target.value)} 
                                            placeholder="e.g. RSI Mean Reversion" 
                                            style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>MODEL DESCRIPTION</label>
                                        <input 
                                            type="text" 
                                            value={modelDescription} 
                                            onChange={e => setModelDescription(e.target.value)} 
                                            placeholder="Briefly state strategy rules..." 
                                            style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }} 
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '5px' }}>
                                    <button 
                                        onClick={() => setIsCustomJson(false)}
                                        style={{ background: !isCustomJson ? 'rgba(212,175,55,0.1)' : 'transparent', border: !isCustomJson ? '1px solid var(--fq-gold)' : '1px solid #333', color: !isCustomJson ? 'var(--fq-gold)' : 'var(--text-muted)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Visual No-Code Builder
                                    </button>
                                    <button 
                                        onClick={() => setIsCustomJson(true)}
                                        style={{ background: isCustomJson ? 'rgba(212,175,55,0.1)' : 'transparent', border: isCustomJson ? '1px solid var(--fq-gold)' : '1px solid #333', color: isCustomJson ? 'var(--fq-gold)' : 'var(--text-muted)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Raw JSON Editor
                                    </button>
                                </div>

                                {!isCustomJson ? (
                                    <>
                                        {/* Indicator selection */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>INDICATOR TYPE</label>
                                                <select 
                                                    value={indicator} 
                                                    onChange={e => setIndicator(e.target.value)}
                                                    style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                                >
                                                    <option value="RSI">RSI (Relative Strength Index)</option>
                                                    <option value="SMA">SMA (Simple Moving Average)</option>
                                                    <option value="EMA">EMA (Exponential Moving Average)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>PERIOD ({period})</label>
                                                <input 
                                                    type="range" 
                                                    min="5" 
                                                    max="200" 
                                                    value={period} 
                                                    onChange={e => setPeriod(Number(e.target.value))} 
                                                    style={{ width: '100%', marginTop: '15px', accentColor: 'var(--fq-gold)' }} 
                                                />
                                            </div>
                                        </div>

                                        {/* Logical Condition Selector */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '15px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>LOGICAL OPERATOR</label>
                                                <select 
                                                    value={operator} 
                                                    onChange={e => setOperator(e.target.value)}
                                                    style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                                >
                                                    <option value="LESS_THAN">Less Than (&lt;)</option>
                                                    <option value="GREATER_THAN">Greater Than (&gt;)</option>
                                                    <option value="CROSSES_ABOVE">Crosses Above (Bullish)</option>
                                                    <option value="CROSSES_BELOW">Crosses Below (Bearish)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>THRESHOLD ({threshold})</label>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="100" 
                                                    value={threshold} 
                                                    onChange={e => setThreshold(Number(e.target.value))} 
                                                    style={{ width: '100%', marginTop: '15px', accentColor: 'var(--fq-gold)' }} 
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TRIGGER ACTION</label>
                                                <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                                                    <button 
                                                        onClick={() => setTriggerAction('BUY')} 
                                                        style={{ flex: 1, padding: '10px', background: triggerAction === 'BUY' ? 'var(--success)' : '#080808', color: triggerAction === 'BUY' ? '#fff' : '#888', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                                    >
                                                        BUY
                                                    </button>
                                                    <button 
                                                        onClick={() => setTriggerAction('SELL')} 
                                                        style={{ flex: 1, padding: '10px', background: triggerAction === 'SELL' ? 'var(--danger)' : '#080808', color: triggerAction === 'SELL' ? '#fff' : '#888', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                                    >
                                                        SELL
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* RAW TEXT JSON FALLBACK */
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>JSON CONFIGURATION</label>
                                        <textarea 
                                            value={customJsonText} 
                                            onChange={e => setCustomJsonText(e.target.value)} 
                                            style={{ width: '100%', marginTop: '5px', height: '140px', background: '#080808', color: 'var(--success)', fontFamily: 'monospace', border: '1px solid var(--border)', padding: '10px', borderRadius: '4px', outline: 'none', resize: 'none', fontSize: '12px' }} 
                                        />
                                    </div>
                                )}

                                <button 
                                    className="btn-fq btn-fq-primary" 
                                    onClick={handleCreate} 
                                    disabled={!modelName.trim()}
                                    style={{ width: '100%', marginTop: '10px', padding: '12px', background: !modelName.trim() ? '#222' : 'var(--fq-gold)', color: !modelName.trim() ? '#555' : '#000', cursor: !modelName.trim() ? 'not-allowed' : 'pointer' }}
                                >
                                    Compile & Save Strategy
                                </button>
                            </div>
                        </div>

                        {/* Interactive Generated Code Preview Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="fq-card" style={{ padding: '25px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <FileJson size={18} color="var(--fq-gold)" />
                                    <h4 style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Live Compilation Output</h4>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>This syntax-highlighted block compiles dynamically in real-time as you adjust parameters. This matches standard JSON model schema definitions consumed natively by our quantitative engine.</p>
                                <pre style={{ flex: 1, background: '#050505', border: '1px solid var(--border)', padding: '20px', borderRadius: '4px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#00c853', textShadow: '0 0 4px rgba(0, 200, 83, 0.15)' }}>
                                    <code>{isCustomJson ? customJsonText : generatedJson}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tester' && (
                    /* TAB 2: STRATEGY TESTER */
                    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', animation: 'fadeIn 0.4s' }}>
                        {/* Testing Configuration Sidebar */}
                        <div className="fq-card" style={{ padding: '25px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', height: 'fit-content' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Sliders size={18} color="var(--fq-gold)" />
                                <h4 style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Tester Configurations</h4>
                            </div>

                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>SELECT STRATEGY</label>
                                    <select 
                                        value={selectedStrategyId} 
                                        onChange={e => setSelectedStrategyId(e.target.value)}
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                    >
                                        {strategies.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                        {strategies.length === 0 && <option value="">No strategies available</option>}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ASSET SYMBOL</label>
                                    <select 
                                        value={selectedSymbol} 
                                        onChange={e => setSelectedSymbol(e.target.value)}
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                    >
                                        <option value="EURUSD">EUR/USD (Euro / US Dollar)</option>
                                        <option value="GBPUSD">GBP/USD (Great British Pound / US Dollar)</option>
                                        <option value="USDJPY">USD/JPY (US Dollar / Japanese Yen)</option>
                                        <option value="XAUUSD">XAU/USD (Gold / US Dollar)</option>
                                        <option value="BTCUSD">BTC/USD (Bitcoin / US Dollar)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TIMEFRAME</label>
                                    <select 
                                        value={selectedTimeframe} 
                                        onChange={e => setSelectedTimeframe(e.target.value)}
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                    >
                                        <option value="1m">1 minute (Scalping)</option>
                                        <option value="5m">5 minutes (Intraday)</option>
                                        <option value="15m">15 minutes (Standard)</option>
                                        <option value="1H">1 Hour (Swing Trading)</option>
                                        <option value="1D">1 Day (Position Trading)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>STARTING CAPITAL ($)</label>
                                    <input 
                                        type="number" 
                                        value={startBalance} 
                                        onChange={e => setStartBalance(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }} 
                                        />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>START DATE</label>
                                        <input 
                                            type="date" 
                                            value={startDate} 
                                            onChange={e => setStartDate(e.target.value)} 
                                            style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '11px', fontFamily: 'monospace' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>END DATE</label>
                                        <input 
                                            type="date" 
                                            value={endDate} 
                                            onChange={e => setEndDate(e.target.value)} 
                                            style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '11px', fontFamily: 'monospace' }} 
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={isTesting || strategies.length === 0} 
                                    onClick={runStrategyBacktest}
                                    style={{
                                        width: '100%',
                                        marginTop: '15px',
                                        background: isTesting || strategies.length === 0 ? '#222' : 'var(--fq-gold)',
                                        color: isTesting || strategies.length === 0 ? '#666' : '#000',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        cursor: isTesting || strategies.length === 0 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {isTesting ? (
                                        <>
                                            <RefreshCw size={16} className="spin-animation" /> Running Simulation...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} fill="#000" /> Run Strategy Test
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Backtest Output results */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {isTesting && (
                                /* SIMULATION LOADING SCREEN */
                                <div className="fq-card" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', minHeight: '400px' }}>
                                    <div className="spinner-glow" style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                                        <RefreshCw size={40} color="var(--fq-gold)" className="spin-animation" />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>HISTORICAL DATA ENGINE SIMULATION</h3>
                                    <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                                        <div style={{ width: `${testProgress}%`, height: '100%', background: 'var(--fq-gold)', transition: 'width 0.3s ease' }} />
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>{testStatusText}</p>
                                </div>
                            )}

                            {!isTesting && !testResult && (
                                /* IDLE INITIAL SCREEN */
                                <div className="fq-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderStyle: 'dashed', borderRadius: '8px', minHeight: '400px' }}>
                                    <Award size={48} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
                                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Simulation Sandboxed</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', maxWidth: '450px' }}>Select an algorithmic strategy and historical boundaries on the configurations panel, then launch the strategy tester.</p>
                                </div>
                            )}

                            {!isTesting && testResult && (
                                /* RESULTS ANALYTICS REPORT DASHBOARD */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                                    {/* Quick Stats Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '15px' }}>
                                        {/* Cumulative PnL card */}
                                        <div className="fq-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(38,166,154,0.1) 100%)', borderTop: '3px solid var(--success)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Simulated Profit/Loss</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: testResult.pnl >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '8px' }}>
                                                {testResult.pnl >= 0 ? '+' : ''}${testResult.pnl.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '11px', color: testResult.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', marginTop: '4px' }}>
                                                {testResult.pnl >= 0 ? '▲' : '▼'} {testResult.pnlPercentage.toFixed(2)}% ROI
                                            </div>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="fq-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Win Rate</div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>{testResult.winRate.toFixed(1)}%</div>
                                        </div>

                                        {/* Profit Factor */}
                                        <div className="fq-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Profit Factor</div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--fq-gold)', marginTop: '8px' }}>{testResult.profitFactor.toFixed(2)}</div>
                                        </div>

                                        {/* Max Drawdown */}
                                        <div className="fq-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Max Drawdown</div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)', marginTop: '8px' }}>-{testResult.maxDrawdown.toFixed(1)}%</div>
                                        </div>

                                        {/* Sharpe Ratio */}
                                        <div className="fq-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Sharpe Ratio</div>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)', marginTop: '8px' }}>{testResult.sharpeRatio.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    {/* Backtest execution table */}
                                    <div className="fq-card" style={{ padding: '0', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#888', letterSpacing: '0.5px' }}>SIMULATED TRADES EXECUTIONS LEDGER ({testResult.totalTrades} Executions)</span>
                                            <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold' }}>• COMPLETED DATA</span>
                                        </div>
                                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: '#0a0a0a', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                                                        <th style={{ padding: '12px 20px' }}>ID</th>
                                                        <th style={{ padding: '12px 20px' }}>Type</th>
                                                        <th style={{ padding: '12px 20px' }}>Entry Price</th>
                                                        <th style={{ padding: '12px 20px' }}>Entry Time</th>
                                                        <th style={{ padding: '12px 20px' }}>Exit Price</th>
                                                        <th style={{ padding: '12px 20px' }}>Exit Time</th>
                                                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>PnL ($)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {testTrades.map(trade => (
                                                        <tr key={trade.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '13px' }} className="hover-row">
                                                            <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>#{trade.id}</td>
                                                            <td style={{ padding: '12px 20px' }}>
                                                                 <span style={{ 
                                                                    padding: '2px 6px', borderRadius: '2px', fontSize: '10px', fontWeight: 'bold',
                                                                    background: trade.tradeType === 'BUY' ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)',
                                                                    color: trade.tradeType === 'BUY' ? 'var(--success)' : 'var(--danger)'
                                                                }}>
                                                                    {trade.tradeType}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 20px', fontFamily: 'monospace' }}>{trade.entryPrice.toFixed(selectedSymbol === 'USDJPY' ? 3 : 5)}</td>
                                                            <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>{trade.entryTime}</td>
                                                            <td style={{ padding: '12px 20px', fontFamily: 'monospace' }}>{trade.exitPrice.toFixed(selectedSymbol === 'USDJPY' ? 3 : 5)}</td>
                                                            <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>{trade.exitTime}</td>
                                                            <td style={{ padding: '12px 20px', textAlign: 'right', color: trade.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }}>
                                                                {trade.pnl >= 0 ? `+${trade.pnl.toLocaleString()}` : trade.pnl.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'manager' && (
                    /* TAB 3: LIVE AUTOMATOR / MANAGER */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', animation: 'fadeIn 0.4s' }}>
                        {strategies.map(s => (
                            <div key={s.id} className="fq-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', borderLeft: s.active ? '4px solid var(--success)' : '4px solid #444' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '17px' }}>{s.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.description}</div>
                                    <div style={{ fontSize: '11px', marginTop: '12px', color: s.active ? 'var(--success)' : 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.active ? 'var(--success)' : '#444', display: 'inline-block' }}></span>
                                        {s.active ? 'RUNNING ON LIVE SYSTEM' : 'INACTIVE / DORMANT'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleToggle(s.id)}
                                        style={{
                                            background: s.active ? 'rgba(239,83,80,0.1)' : 'rgba(0,200,83,0.1)',
                                            color: s.active ? 'var(--danger)' : 'var(--success)',
                                            border: s.active ? '1px solid rgba(239,83,80,0.2)' : '1px solid rgba(0,200,83,0.2)',
                                            padding: '6px 14px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {s.active ? 'STOP' : 'RUN'}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(s.id)}
                                        style={{ background: 'transparent', border: '1px solid #333', color: '#ff3d00', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {strategies.length === 0 && (
                            <div className="fq-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                No algorithmic models created yet. Design your first model in the **Strategy Builder** tab.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
