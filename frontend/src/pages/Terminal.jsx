import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronDown, BarChart2, Activity, Zap, Layers, Share2, Info, Maximize2, History as ReplayIcon } from 'lucide-react';
import ChartView from '../components/terminal/ChartView';
import ReplayToolbar from '../components/terminal/ReplayToolbar';

const Terminal = () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    const [activeTab, setActiveTab] = useState('layers');
    const [indicators, setIndicators] = useState({ ema: true, rsi: false, macd: false });

    // Data & Replay State
    const [fullData, setFullData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [replayMode, setReplayMode] = useState(false);
    const [replayIndex, setReplayIndex] = useState(0);
    const [isReplaying, setIsReplaying] = useState(false);
    const [replaySpeed, setReplaySpeed] = useState(1000);
    const replayTimerRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE}/market-data/EURUSD`);
                const mappedData = response.data.map(item => ({
                    time: new Date(item.dataDate).getTime() / 1000,
                    open: item.openPrice,
                    high: item.highPrice,
                    low: item.lowPrice,
                    close: item.closePrice,
                }));
                setFullData(mappedData);
                setDisplayData(mappedData); // Default to full data
                setReplayIndex(mappedData.length);
            } catch (error) {
                console.error('Error fetching market data:', error);
            }
        };
        fetchData();
    }, []);

    // Replay Playback Logic
    const startPlayback = useCallback(() => {
        if (replayIndex >= fullData.length) return;
        setIsReplaying(true);

        replayTimerRef.current = setInterval(() => {
            setReplayIndex(prev => {
                if (prev >= fullData.length) {
                    clearInterval(replayTimerRef.current);
                    setIsReplaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, replaySpeed);
    }, [replayIndex, fullData.length, replaySpeed]);

    const stopPlayback = useCallback(() => {
        clearInterval(replayTimerRef.current);
        setIsReplaying(false);
    }, []);

    useEffect(() => {
        if (replayMode) {
            setDisplayData(fullData.slice(0, replayIndex));
        } else {
            setDisplayData(fullData);
        }
    }, [replayIndex, fullData, replayMode]);

    const enterReplayMode = () => {
        setReplayMode(true);
        setReplayIndex(Math.floor(fullData.length * 0.7)); // Start at 70% of history for demo
    };

    const exitReplayMode = () => {
        setReplayMode(false);
        setIsReplaying(false);
        clearInterval(replayTimerRef.current);
        setDisplayData(fullData);
    };

    const handleStep = (direction) => {
        setReplayIndex(prev => Math.max(1, Math.min(fullData.length, prev + direction)));
    };

    return (
        <div className="terminal-layout text-main">
            {/* Top Navigation */}
            <nav className="terminal-top-nav">
                <div className="d-flex align-items-center gap-2 border-end pe-3 border-secondary">
                    <div className="bg-brand p-1 rounded"><Zap size={18} color="white" /></div>
                    <span className="fw-bold d-none d-md-inline" style={{ fontSize: '0.9rem' }}>EURUSD</span>
                    <ChevronDown size={14} className="text-dim" />
                </div>

                <div className="d-flex align-items-center gap-1 border-end pe-3 border-secondary">
                    <button className="btn icon-btn active fw-bold">1m</button>
                    <button className="btn icon-btn">5m</button>
                    <button className="btn icon-btn">1h</button>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <button
                        className={`btn icon-btn d-flex align-items-center gap-2 ${replayMode ? 'text-cyan' : ''}`}
                        onClick={replayMode ? exitReplayMode : enterReplayMode}
                    >
                        <ReplayIcon size={18} /> <span>Replay</span>
                    </button>
                    <div className="border-start border-secondary h-50 mx-2"></div>
                    <button
                        className={`btn icon-btn d-flex align-items-center gap-2 ${indicators.ema ? 'text-cyan' : ''}`}
                        onClick={() => setIndicators(p => ({ ...p, ema: !p.ema }))}
                    >
                        <Activity size={18} /> <span>EMA</span>
                    </button>
                    <button
                        className={`btn icon-btn d-flex align-items-center gap-2 ${indicators.rsi ? 'text-cyan' : ''}`}
                        onClick={() => setIndicators(p => ({ ...p, rsi: !p.rsi }))}
                    >
                        <Activity size={18} /> <span>RSI</span>
                    </button>
                    <button
                        className={`btn icon-btn d-flex align-items-center gap-2 ${indicators.macd ? 'text-cyan' : ''}`}
                        onClick={() => setIndicators(p => ({ ...p, macd: !p.macd }))}
                    >
                        <Activity size={18} /> <span>MACD</span>
                    </button>
                </div>

                <div className="ms-auto d-flex align-items-center gap-3">
                    <button className="btn btn-primary bg-brand border-0 px-3 py-1 small rounded-pill">UPGRADE</button>
                    <div className="icon-btn rounded-circle"><Search size={18} /></div>
                </div>
            </nav>

            {/* Main Terminal Body */}
            <div className="terminal-body">
                {/* Left Drawing Tools */}
                <aside className="terminal-left-tools">
                    <div className="icon-btn"><Activity size={20} /></div>
                    <div className="icon-btn"><Search size={20} /></div>
                    <div className="icon-btn"><Layers size={20} /></div>
                    <div className="border-bottom border-secondary w-75 mx-auto my-1"></div>
                    <div className="icon-btn"><Activity size={20} /></div>
                    <div className="icon-btn"><Share2 size={20} /></div>
                </aside>

                {/* Chart View */}
                <main className="chart-container terminal-grid position-relative">
                    {replayMode && (
                        <ReplayToolbar
                            isReplaying={isReplaying}
                            speed={replaySpeed}
                            onTogglePlay={isReplaying ? stopPlayback : startPlayback}
                            onStep={handleStep}
                            onReset={() => setReplayIndex(1)}
                            onSetSpeed={setReplaySpeed}
                            onClose={exitReplayMode}
                        />
                    )}

                    <ChartView data={displayData} indicators={indicators} />

                    {/* Floating Info Overlay (Similar to GoCharting) */}
                    <div className="position-absolute top-0 start-0 p-3" style={{ zIndex: 5, pointerEvents: 'none' }}>
                        <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold" style={{ fontSize: '0.8rem', color: 'var(--fq-accent)' }}>EURUSD</span>
                                <span className="small text-secondary">1m • FX</span>
                                {replayMode && <span className="badge bg-danger ms-2" style={{ fontSize: '0.6rem' }}>REPLAY</span>}
                            </div>
                            {indicators.ema && (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small" style={{ fontSize: '0.7rem', color: '#00bcd4' }}>EMA (9, close)</span>
                                    <span className="small text-secondary" style={{ fontSize: '0.7rem' }}>
                                        {displayData.length > 0 ? displayData[displayData.length - 1].close.toFixed(4) : '0.0000'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Info Panels */}
                <aside className="terminal-right-panels d-none d-xl-flex">
                    <div className="d-flex border-bottom border-secondary">
                        <button className={`btn flex-grow-1 py-2 rounded-0 border-0 ${activeTab === 'layers' ? 'active-tab' : 'text-dim'}`} onClick={() => setActiveTab('layers')}>Layers</button>
                        <button className={`btn flex-grow-1 py-2 rounded-0 border-0 ${activeTab === 'alerts' ? 'active-tab' : 'text-dim'}`} onClick={() => setActiveTab('alerts')}>Alerts</button>
                    </div>

                    <div className="p-3 flex-grow-1 overflow-auto">
                        {activeTab === 'layers' && (
                            <div className="fade-in">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="small fw-bold">OBJECTS</span>
                                    <button className="btn icon-btn p-1"><Maximize2 size={14} /></button>
                                </div>
                                <div className="small text-dim border p-2 rounded border-secondary mb-2 bg-deep">Candlestick Chart</div>
                                <div className="small text-dim border p-2 rounded border-secondary bg-deep">Volume (20)</div>
                                {replayMode && (
                                    <div className="small text-cyan border p-2 rounded border-cyan mt-3 bg-fq-accent-light">
                                        Replay Active: {replayIndex} / {fullData.length} bars
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <style>{`
                .bg-brand { background-color: var(--fq-accent); }
                .text-cyan { color: var(--fq-accent); }
                .bg-fq-accent-light { background: var(--fq-accent-light); }
                .border-cyan { border-color: var(--fq-accent) !important; }
                .active-tab { border-bottom: 2px solid var(--fq-accent) !important; color: white !important; background: var(--fq-accent-light); }
            `}</style>
        </div>
    );
};

export default Terminal;
