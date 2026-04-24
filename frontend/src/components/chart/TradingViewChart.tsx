import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface TradingViewChartProps {
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ mode, historicalData = [], onPriceUpdate }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [pointer, setPointer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: { background: { color: 'transparent' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: 'rgba(42, 46, 57, 0.5)' }, horzLines: { color: 'rgba(42, 46, 57, 0.5)' } },
      timeScale: { borderColor: 'rgba(197, 203, 206, 0.2)', timeVisible: true, secondsVisible: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350'
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Handle Data Updates
  useEffect(() => {
    if (!seriesRef.current || historicalData.length === 0) return;

    if (mode === 'live') {
      seriesRef.current.setData(historicalData);
      const last = historicalData[historicalData.length - 1];
      if (onPriceUpdate) onPriceUpdate(last.close);

      // WebSockets for Live Updates
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
      const socketUrl = BASE_URL.replace('http', 'http') + '/ws-forex'; 
      const socket = new SockJS(socketUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          client.subscribe('/topic/candles', (message) => {
            const candle = JSON.parse(message.body);
            if (seriesRef.current) {
              seriesRef.current.update({
                time: Math.floor(new Date(candle.timestamp).getTime() / 1000) as any,
                open: Number(candle.open),
                high: Number(candle.high),
                low: Number(candle.low),
                close: Number(candle.close)
              });
              if (onPriceUpdate) onPriceUpdate(Number(candle.close));
            }
          });
        }
      });
      client.activate();
      return () => { client.deactivate(); };
    } else {
      // Replay mode initialization
      setPointer(Math.floor(historicalData.length * 0.7)); // Start at 70% of data
    }
  }, [mode, historicalData]);

  // Replay logic
  useEffect(() => {
    if (mode === 'replay' && isPlaying) {
      const interval = setInterval(() => {
        setPointer(p => {
          if (p + 1 >= historicalData.length) {
            setIsPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 1000 / speed);
      return () => clearInterval(interval);
    }
  }, [isPlaying, mode, speed, historicalData]);

  useEffect(() => {
    if (mode === 'replay' && seriesRef.current && historicalData.length > 0) {
      const visibleData = historicalData.slice(0, pointer + 1);
      seriesRef.current.setData(visibleData);
      if (onPriceUpdate && visibleData.length > 0) {
        onPriceUpdate(visibleData[visibleData.length - 1].close);
      }
    }
  }, [pointer, mode, historicalData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {mode === 'replay' && (
        <div className="glass-panel" style={{ padding: '10px 20px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-close" onClick={() => setPointer(p => Math.max(0, p - 1))}>Step Back</button>
            <button className="btn btn-primary" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <button className="btn btn-close" onClick={() => setPointer(p => Math.min(historicalData.length - 1, p + 1))}>Step Forward</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>SPEED</span>
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ padding: '4px 8px' }}>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--primary)' }}>
            BAR: {pointer} / {historicalData.length}
          </div>
        </div>
      )}
      <div ref={chartContainerRef} style={{ flex: 1, minHeight: '450px' }} />
    </div>
  );
};
