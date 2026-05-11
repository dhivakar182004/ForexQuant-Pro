import React, { useState, useEffect } from 'react';

interface TickerRate {
    price: number;
    dir: 'up' | 'down' | 'flat';
}

export const TickerNav = () => {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF'];
    const [rates, setRates] = useState<Record<string, TickerRate>>({});
  
    useEffect(() => {
        const baseRates: Record<string, number> = {
            'EUR/USD': 1.08520,
            'GBP/USD': 1.26450,
            'USD/JPY': 155.420,
            'AUD/USD': 0.65820,
            'USD/CHF': 0.90450
        };
        
        // Initialize
        const initial: Record<string, TickerRate> = {};
        pairs.forEach(p => {
            initial[p] = { price: baseRates[p], dir: 'flat' };
        });
        setRates(initial);
        
        const interval = setInterval(() => {
            setRates(prev => {
                const updated: Record<string, TickerRate> = {};
                pairs.forEach(p => {
                    const oldObj = prev[p];
                    if (!oldObj) return;
                    const oldPrice = oldObj.price;
                    const volatility = p === 'USD/JPY' ? 0.05 : 0.00015;
                    const change = (Math.random() - 0.5) * volatility;
                    const newPrice = oldPrice + change;
                    const dir = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'flat';
                    updated[p] = { price: newPrice, dir };
                });
                return updated;
            });
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (pair: string, price: number) => {
        const decimals = pair.includes('JPY') ? 3 : 5;
        return price.toFixed(decimals);
    };
  
    return (
        <div style={{ background: '#070707', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'inline-block', animation: 'ticker 40s linear infinite' }}>
                {pairs.concat(pairs).concat(pairs).map((p, i) => {
                    const data = rates[p];
                    const priceText = data ? formatPrice(p, data.price) : '...';
                    const color = data?.dir === 'up' ? 'var(--success)' : data?.dir === 'down' ? 'var(--danger)' : 'var(--text-muted)';
                    const indicator = data?.dir === 'up' ? '▲' : data?.dir === 'down' ? '▼' : '•';
                    
                    return (
                        <span key={i} style={{ padding: '0 25px', display: 'inline-block', fontSize: '12px', fontFamily: 'monospace' }}>
                            <span style={{ fontWeight: '800', color: '#fff', letterSpacing: '0.5px' }}>{p}</span>{' '}
                            <span style={{ color, marginLeft: '6px', fontWeight: 'bold', transition: 'color 0.3s' }}>
                                {priceText} <span style={{ fontSize: '9px', marginLeft: '2px' }}>{indicator}</span>
                            </span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
