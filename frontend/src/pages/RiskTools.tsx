import React, { useState, useEffect } from 'react';
import { TopNavbar } from '../components/TopNavbar';
import { Shield, Percent, Sliders, DollarSign, Activity, AlertTriangle, ArrowRight, Layers, CheckCircle } from 'lucide-react';

export const RiskTools = () => {
    // 1. Position Size Calculator States
    const [balance, setBalance] = useState<number>(100000);
    const [riskPercent, setRiskPercent] = useState<number>(1);
    const [stopLossPips, setStopLossPips] = useState<number>(20);
    const [selectedPair, setSelectedPair] = useState<string>('EURUSD');
    const [leverage, setLeverage] = useState<number>(100); // 1:100 leverage

    // 2. Risk-Reward Scenario Simulator States
    const [entryPrice, setEntryPrice] = useState<number>(1.08500);
    const [stopLossPrice, setStopLossPrice] = useState<number>(1.08300);
    const [takeProfitPrice, setTakeProfitPrice] = useState<number>(1.09100);
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

    // Calculations for Position Sizer
    const cashRisk = balance * (riskPercent / 100);
    
    // Calculate pip value based on symbol standards
    const getPipValue = (pair: string): number => {
        // Standard FX Lot is 100,000 units. 1 pip = 0.0001 (or 0.01 JPY)
        if (pair === 'USDJPY') return 6.50; // JPY currency adjustment
        if (pair === 'XAUUSD') return 10.00; // Gold sizing
        if (pair === 'BTCUSD') return 1.00; // Crypto sizing
        return 10.00; // Standard USD pair (EURUSD, GBPUSD)
    };

    const pipVal = getPipValue(selectedPair);
    const calculatedLots = stopLossPips > 0 ? (cashRisk / (stopLossPips * pipVal)) : 0;
    
    // Required Margin based on leverage (1 lot of EURUSD = $100,000 baseline)
    const getContractSize = (pair: string): number => {
        if (pair === 'XAUUSD') return 100; // 100 oz per lot
        if (pair === 'BTCUSD') return 1;   // 1 BTC per lot
        return 100000; // Forex Standard Lot
    };

    const contractSize = getContractSize(selectedPair);
    const notionSize = calculatedLots * contractSize * (selectedPair === 'USDJPY' ? 1 : entryPrice);
    const requiredMargin = notionSize / leverage;

    // Calculations for Risk-Reward Scenario Simulator
    const scenarioRiskPips = React.useMemo(() => {
        const factor = selectedPair === 'USDJPY' ? 100 : selectedPair === 'XAUUSD' ? 10 : selectedPair === 'BTCUSD' ? 1 : 10000;
        const diff = tradeType === 'BUY' ? (entryPrice - stopLossPrice) : (stopLossPrice - entryPrice);
        return Math.max(0, diff * factor);
    }, [entryPrice, stopLossPrice, tradeType, selectedPair]);

    const scenarioRewardPips = React.useMemo(() => {
        const factor = selectedPair === 'USDJPY' ? 100 : selectedPair === 'XAUUSD' ? 10 : selectedPair === 'BTCUSD' ? 1 : 10000;
        const diff = tradeType === 'BUY' ? (takeProfitPrice - entryPrice) : (entryPrice - takeProfitPrice);
        return Math.max(0, diff * factor);
    }, [entryPrice, takeProfitPrice, tradeType, selectedPair]);

    const riskRewardRatio = scenarioRiskPips > 0 ? (scenarioRewardPips / scenarioRiskPips) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000' }}>
            <div className="dynamic-bg"></div>
            <TopNavbar />

            <div style={{ padding: '30px', color: '#fff', maxWidth: '1400px', width: '100%', margin: '0 auto', flex: 1 }}>
                
                {/* Header */}
                <div style={{ marginBottom: '25px' }}>
                    <h2 className="gradient-text" style={{ fontSize: '30px', marginBottom: '5px', fontWeight: '800' }}>RISK MANAGEMENT WORKSTATION</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Validate margin specifications, allocate capital limits, and verify risk-to-reward ratios</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    
                    {/* Panel 1: Position Size & Leverage Calculator */}
                    <div className="fq-card" style={{ padding: '25px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Shield size={18} color="var(--fq-gold)" />
                            <h4 style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Position Sizer & Margin Engine</h4>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ACCOUNT BALANCE ($)</label>
                                    <input 
                                        type="number" 
                                        value={balance} 
                                        onChange={e => setBalance(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>CURRENCY ASSET</label>
                                    <select 
                                        value={selectedPair} 
                                        onChange={e => {
                                            setSelectedPair(e.target.value);
                                            // Auto-adjust default entry prices
                                            if (e.target.value === 'USDJPY') setEntryPrice(155.40);
                                            else if (e.target.value === 'XAUUSD') setEntryPrice(2350.0);
                                            else if (e.target.value === 'BTCUSD') setEntryPrice(64000.0);
                                            else setEntryPrice(1.0850);
                                        }}
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                    >
                                        <option value="EURUSD">EUR/USD (Euro)</option>
                                        <option value="GBPUSD">GBP/USD (Pound)</option>
                                        <option value="USDJPY">USD/JPY (Yen)</option>
                                        <option value="XAUUSD">XAU/USD (Gold)</option>
                                        <option value="BTCUSD">BTC/USD (Bitcoin)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>DESIRED RISK (%)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="number" 
                                            value={riskPercent} 
                                            onChange={e => setRiskPercent(Number(e.target.value))} 
                                            style={{ width: '100%', marginTop: '5px', padding: '12px', paddingLeft: '32px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }} 
                                        />
                                        <Percent size={14} style={{ position: 'absolute', left: '12px', top: '18px', color: 'var(--text-muted)' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>STOP LOSS (PIPS)</label>
                                    <input 
                                        type="number" 
                                        value={stopLossPips} 
                                        onChange={e => setStopLossPips(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ACCOUNT LEVERAGE (MARGIN SCALE)</label>
                                <select 
                                    value={leverage} 
                                    onChange={e => setLeverage(Number(e.target.value))}
                                    style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
                                >
                                    <option value="10">1:10 (Standard Institutional)</option>
                                    <option value="30">1:30 (ESMA Standard)</option>
                                    <option value="100">1:100 (Standard Retail)</option>
                                    <option value="500">1:500 (Aggressive Leverage)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '15px', marginTop: '10px' }}>
                                <div style={{ padding: '15px', background: '#111', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>CASH RISK AMOUNT</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)', marginTop: '4px' }}>
                                        ${cashRisk.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ padding: '15px', background: 'linear-gradient(135deg, #111 0%, rgba(38,166,154,0.1) 100%)', border: '1px solid var(--success)', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 'bold' }}>RECOMMENDED SIZING</div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>
                                        {calculatedLots.toFixed(2)} LOTS
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Layers size={14} color="var(--fq-gold)" />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Broker Margin Requirement:</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
                                    ${isNaN(requiredMargin) ? '0.00' : requiredMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Scenario Risk-Reward Simulator */}
                    <div className="fq-card" style={{ padding: '25px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Activity size={18} color="var(--fq-gold)" />
                            <h4 style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Risk-Reward Scenario Simulator</h4>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>DIRECTION</label>
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                                        <button 
                                            onClick={() => {
                                                setTradeType('BUY');
                                                // Adjust SL/TP defaults
                                                setStopLossPrice(entryPrice - (selectedPair === 'USDJPY' ? 0.30 : selectedPair === 'XAUUSD' ? 5 : selectedPair === 'BTCUSD' ? 500 : 0.0020));
                                                setTakeProfitPrice(entryPrice + (selectedPair === 'USDJPY' ? 0.80 : selectedPair === 'XAUUSD' ? 12 : selectedPair === 'BTCUSD' ? 1500 : 0.0050));
                                            }} 
                                            style={{ flex: 1, padding: '10px', background: tradeType === 'BUY' ? 'var(--success)' : '#080808', color: tradeType === 'BUY' ? '#fff' : '#888', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            BUY LONG
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setTradeType('SELL');
                                                // Adjust SL/TP defaults
                                                setStopLossPrice(entryPrice + (selectedPair === 'USDJPY' ? 0.30 : selectedPair === 'XAUUSD' ? 5 : selectedPair === 'BTCUSD' ? 500 : 0.0020));
                                                setTakeProfitPrice(entryPrice - (selectedPair === 'USDJPY' ? 0.80 : selectedPair === 'XAUUSD' ? 12 : selectedPair === 'BTCUSD' ? 1500 : 0.0050));
                                            }} 
                                            style={{ flex: 1, padding: '10px', background: tradeType === 'SELL' ? 'var(--danger)' : '#080808', color: tradeType === 'SELL' ? '#fff' : '#888', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            SELL SHORT
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ENTRY PRICE</label>
                                    <input 
                                        type="number" 
                                        step="any"
                                        value={entryPrice} 
                                        onChange={e => setEntryPrice(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px', fontFamily: 'monospace' }} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>STOP LOSS PRICE</label>
                                    <input 
                                        type="number" 
                                        step="any"
                                        value={stopLossPrice} 
                                        onChange={e => setStopLossPrice(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px', fontFamily: 'monospace' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TAKE PROFIT PRICE</label>
                                    <input 
                                        type="number" 
                                        step="any"
                                        value={takeProfitPrice} 
                                        onChange={e => setTakeProfitPrice(Number(e.target.value))} 
                                        style={{ width: '100%', marginTop: '5px', padding: '12px', background: '#080808', color: '#fff', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none', fontSize: '13px', fontFamily: 'monospace' }} 
                                    />
                                </div>
                            </div>

                            {/* Mathematical outputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                <div style={{ padding: '12px 15px', background: '#111', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SCENARIO RISK (PIPS)</div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--danger)', marginTop: '4px' }}>
                                        {scenarioRiskPips.toFixed(1)} Pips
                                    </div>
                                </div>
                                <div style={{ padding: '12px 15px', background: '#111', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SCENARIO REWARD (PIPS)</div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>
                                        {scenarioRewardPips.toFixed(1)} Pips
                                    </div>
                                </div>
                            </div>

                            {/* Risk Reward Ratio card */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: riskRewardRatio >= 2 ? 'rgba(38,166,154,0.06)' : 'rgba(239,83,80,0.06)', border: riskRewardRatio >= 2 ? '1px solid var(--success)' : '1px solid var(--danger)', borderRadius: '4px', marginTop: '5px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>RISK-REWARD RATIO (R:R)</div>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: riskRewardRatio >= 2 ? 'var(--success)' : 'var(--danger)', marginTop: '4px' }}>
                                        1 : {riskRewardRatio.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {riskRewardRatio >= 2 ? (
                                        <span style={{ padding: '4px 10px', background: 'rgba(38,166,154,0.2)', color: 'var(--success)', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CheckCircle size={12} /> RISK COMPLIANT
                                        </span>
                                    ) : (
                                        <span style={{ padding: '4px 10px', background: 'rgba(239,83,80,0.2)', color: 'var(--danger)', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <AlertTriangle size={12} /> AGGRESSIVE RISK
                                        </span>
                                    )}
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                        {riskRewardRatio >= 2 ? 'Satisfies institutional guidelines' : 'Target ratio below ideal limits'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
