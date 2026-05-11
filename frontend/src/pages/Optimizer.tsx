import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TopNavbar } from '../components/TopNavbar';
import { Sliders, Activity, Play, Award, RefreshCw, BarChart2, CheckCircle, Flame, ArrowUpRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

interface SweepResult {
    parameter: number;
    profitFactor: number;
    winRate: number;
    sharpeRatio: number;
}

export const Optimizer = () => {
    const [strategies, setStrategies] = useState<any[]>([]);
    const [selectedStrategyName, setSelectedStrategyName] = useState<string>('RSI_Auto');
    const [targetParam, setTargetParam] = useState<string>('rsi_period');
    
    // Sweep Range Configs
    const [sweepStart, setSweepStart] = useState<number>(10);
    const [sweepEnd, setSweepEnd] = useState<number>(20);
    const [sweepStep, setSweepStep] = useState<number>(1);

    const [results, setResults] = useState<SweepResult[]>([]);
    const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
    const [optProgress, setOptProgress] = useState<number>(0);
    const [optStatus, setOptStatus] = useState<string>('');

    useEffect(() => {
        // Fetch created strategies to populate dropdown
        axios.get(`${API_BASE}/api/strategies/user/1`)
            .then(res => {
                setStrategies(res.data);
                if (res.data.length > 0) {
                    setSelectedStrategyName(res.data[0].name);
                }
            })
            .catch(err => console.error("Could not fetch strategies for optimizer", err));
    }, []);

    const runSweep = async () => {
        setIsOptimizing(true);
        setOptProgress(10);
        setOptStatus('Initiating parameter matrix...');
        setResults([]);

        // Generate the parameter sweep list
        const paramList: number[] = [];
        for (let v = sweepStart; v <= sweepEnd; v += sweepStep) {
            paramList.push(v);
        }

        // Animate progress before completing
        const milestones = [
            { progress: 30, status: 'Simulating trading environments for period parameters...' },
            { progress: 60, status: 'Evaluating fitness function (Profit Factor vs Drawdown)...' },
            { progress: 95, status: 'Compiling quantitative matrix reports...' }
        ];

        for (const m of milestones) {
            await new Promise(resolve => setTimeout(resolve, 400));
            setOptProgress(m.progress);
            setOptStatus(m.status);
        }

        try {
            const payload = {
                [targetParam]: paramList
            };
            const res = await axios.post(`${API_BASE}/api/optimization/run?userId=1&strategyName=${encodeURIComponent(selectedStrategyName)}`, payload);
            setResults(res.data);
            setOptProgress(100);
            setOptStatus('Optimization complete!');
        } catch(err) { 
            console.error("Sweep failed", err); 
        }
        
        setIsOptimizing(false);
    };

    // Calculate the best parameter selection
    const bestParam = React.useMemo(() => {
        if (results.length === 0) return null;
        return [...results].sort((a, b) => b.profitFactor - a.profitFactor)[0];
    }, [results]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000' }}>
            <div className="dynamic-bg"></div>
            <TopNavbar />

            <div style={{ padding: '30px', color: '#fff', maxWidth: '1400px', width: '100%', margin: '0 auto', flex: 1 }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
                    <div>
                        <h2 className="gradient-text" style={{ fontSize: '30px', marginBottom: '5px', fontWeight: '800' }}>PARAMETER OPTIMIZER</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Perform grid-search parameter optimization sweeps to isolate institutional trading edges</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '30px' }}>
                    {/* Sweeper Configuration Sidebar */}
                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(18,18,18,0.7)', border: '1px solid var(--border)', borderRadius: '6px', height: 'fit-content' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Sliders size={18} color="var(--exness-yellow)" />
                            <h4 style={{ fontWeight: '700', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Optimizer Sweeps</h4>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>SELECT MODEL</label>
                                <select 
                                    value={selectedStrategyName} 
                                    onChange={e => setSelectedStrategyName(e.target.value)}
                                    style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                >
                                    {strategies.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                    {strategies.length === 0 && <option value="RSI_Auto">RSI Mean Reversion (Preset)</option>}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>SWEEP VARIABLE</label>
                                <select 
                                    value={targetParam} 
                                    onChange={e => setTargetParam(e.target.value)}
                                    style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                >
                                    <option value="rsi_period">Indicator Period (Cycles)</option>
                                    <option value="stop_loss">Stop Loss Threshold (Pips)</option>
                                    <option value="take_profit">Take Profit Goal (Pips)</option>
                                </select>
                            </div>

                            {/* Range parameters */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>START</label>
                                    <input 
                                        type="number" 
                                        value={sweepStart} 
                                        onChange={e => setSweepStart(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '12px' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>END</label>
                                    <input 
                                        type="number" 
                                        value={sweepEnd} 
                                        onChange={e => setSweepEnd(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '12px' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>STEP</label>
                                    <input 
                                        type="number" 
                                        value={sweepStep} 
                                        onChange={e => setSweepStep(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '12px' }} 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={runSweep} 
                                disabled={isOptimizing} 
                                style={{ 
                                    width: '100%', 
                                    marginTop: '15px', 
                                    background: isOptimizing ? '#222' : 'var(--exness-yellow)', 
                                    color: isOptimizing ? '#555' : '#000', 
                                    border: 'none', 
                                    padding: '12px', 
                                    borderRadius: '4px', 
                                    fontSize: '13px', 
                                    fontWeight: '800', 
                                    cursor: isOptimizing ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isOptimizing ? (
                                    <>
                                        <RefreshCw size={16} className="spin-animation" /> Running Sweep...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} fill="#000" /> Run Optimizer Sweep
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results dashboard area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {isOptimizing && (
                            /* RUNNING LOADING GRAPHICS */
                            <div className="exness-card" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(18,18,18,0.7)', minHeight: '400px' }}>
                                <RefreshCw size={40} color="var(--exness-yellow)" className="spin-animation" style={{ marginBottom: '25px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>GRID OPTIMIZATION UNDERWAY</h3>
                                <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' }}>
                                    <div style={{ width: `${optProgress}%`, height: '100%', background: 'var(--exness-yellow)', transition: 'width 0.3s ease' }} />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>{optStatus}</p>
                            </div>
                        )}

                        {!isOptimizing && results.length === 0 && (
                            /* IDLE EMPTY SCREEN */
                            <div className="exness-card" style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(18,18,18,0.7)', borderStyle: 'dashed', borderWidth: '1px', minHeight: '400px' }}>
                                <BarChart2 size={48} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Parameters sweep standby</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', maxWidth: '450px' }}>Set sweep limits in the sidebar control panel and trigger optimization to evaluate model configurations.</p>
                            </div>
                        )}

                        {!isOptimizing && results.length > 0 && (
                            /* RESULTS AND RECOMMENDATIONS PANEL */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
                                
                                {/* Dynamic SVG Column Chart block */}
                                <div className="exness-card" style={{ padding: '25px', background: 'rgba(18,18,18,0.7)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Parameter Sweep Performance (Profit Factor)</span>
                                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold' }}>• SWEEP RESOLVED</span>
                                    </div>

                                    {/* Bar Chart Container */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '240px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', position: 'relative' }}>
                                        {results.map((r, i) => {
                                            const maxPF = 2.5; // Max scale value
                                            const heightPercentage = Math.min((r.profitFactor / maxPF) * 100, 100);
                                            const isIdeal = bestParam && r.parameter === bestParam.parameter;
                                            
                                            return (
                                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                                    {/* Tooltip on hover */}
                                                    <div style={{ fontSize: '10px', background: '#000', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px', color: isIdeal ? 'var(--exness-yellow)' : '#fff', fontWeight: 'bold', opacity: 0.9 }}>
                                                        {r.profitFactor.toFixed(2)}
                                                    </div>
                                                    
                                                    {/* Bar body */}
                                                    <div 
                                                        style={{ 
                                                            width: '100%', 
                                                            height: `${heightPercentage}%`, 
                                                            background: isIdeal ? 'var(--exness-yellow)' : r.profitFactor > 1.5 ? 'var(--success)' : 'rgba(255,255,255,0.08)',
                                                            borderRadius: '3px 3px 0 0',
                                                            transition: 'height 1s cubic-bezier(0.1, 0.8, 0.3, 1)',
                                                            boxShadow: isIdeal ? '0 0 15px rgba(255,211,0,0.25)' : 'none',
                                                            cursor: 'pointer'
                                                        }} 
                                                        className="hover-highlight"
                                                    />
                                                    
                                                    {/* Parameter coordinate label */}
                                                    <div style={{ fontSize: '10px', marginTop: '10px', color: isIdeal ? 'var(--exness-yellow)' : 'var(--text-muted)', fontFamily: 'monospace', fontWeight: isIdeal ? 'bold' : 'normal' }}>
                                                        P-{r.parameter}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Optimization Result Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                    {/* Optimal Parameter details card */}
                                    {bestParam && (
                                        <div className="exness-card" style={{ padding: '25px', background: 'linear-gradient(135deg, #111 0%, rgba(255,211,0,0.05) 100%)', borderTop: '3px solid var(--exness-yellow)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--exness-yellow)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    <Flame size={14} /> Optimal Parameter Isolated
                                                </div>
                                                <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>Value: {bestParam.parameter}</h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>Using a period threshold of **{bestParam.parameter}** delivers the maximum statistical performance fitness index for the **{selectedStrategyName}** model rules.</p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MAX PROFIT FACTOR</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)', marginTop: '3px' }}>{bestParam.profitFactor.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PROJECTED WIN RATE</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '3px' }}>{bestParam.winRate.toFixed(1)}%</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SHARPE RATIO</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--exness-yellow)', marginTop: '3px' }}>{bestParam.sharpeRatio.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Parameter Recommendation Matrix */}
                                    <div className="exness-card" style={{ padding: '25px', background: '#111' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#888', letterSpacing: '0.5px', marginBottom: '15px', textTransform: 'uppercase' }}>Parameters Fit Matrix</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                                            {results.map((r, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a0a0a', borderRadius: '4px', borderLeft: bestParam && r.parameter === bestParam.parameter ? '3px solid var(--exness-yellow)' : '1px solid transparent' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: bestParam && r.parameter === bestParam.parameter ? 'var(--exness-yellow)' : 'white' }}>Sweep Value: {r.parameter}</span>
                                                    <div style={{ display: 'flex', gap: '15px', fontSize: '11px', fontFamily: 'monospace' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>PF: <b style={{ color: r.profitFactor > 1.5 ? 'var(--success)' : '#fff' }}>{r.profitFactor.toFixed(2)}</b></span>
                                                        <span style={{ color: 'var(--text-muted)' }}>WIN: <b style={{ color: '#fff' }}>{r.winRate.toFixed(1)}%</b></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
