import React, { useState, useEffect } from 'react';

export const TickerNav = () => {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF'];
    const [rates, setRates] = useState<any>({});
  
    useEffect(() => {
      let currentRates: any = {
          'EUR/USD': 1.10000,
          'GBP/USD': 1.25000,
          'USD/JPY': 145.00,
          'AUD/USD': 0.6500,
          'USD/CHF': 0.8800
      };
      
      const interval = setInterval(() => {
          const newRates = { ...currentRates };
          pairs.forEach(p => {
             const change = (Math.random() - 0.5) * 0.0010;
             newRates[p] = newRates[p] + change;
          });
          currentRates = newRates;
          setRates(newRates);
      }, 1000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div style={{ background: '#0a0e17', borderBottom: '1px solid var(--border)', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-block', animation: 'ticker 30s linear infinite' }}>
              {pairs.concat(pairs).map((p, i) => (
                  <span key={i} style={{ padding: '0 20px', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff' }}>{p}</span>{' '}
                      <span style={{ color: Math.random() > 0.5 ? 'var(--success)' : 'var(--danger)'}}>
                          {rates[p] ? rates[p].toFixed(4) : '...'}
                      </span>
                  </span>
              ))}
          </div>
      </div>
    );
  };
