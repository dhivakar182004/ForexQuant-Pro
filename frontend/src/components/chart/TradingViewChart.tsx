import React from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries } from 'lightweight-charts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TradingViewChartProps {
  mode: 'live' | 'replay';
  historicalData?: CandleData[];
  onPriceUpdate?: (price: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ mode, historicalData = [], onPriceUpdate }) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ISeriesApi<"Candlestick"> | null>(null);
  const stompClientRef = React.useRef<Client | null>(null);

  // Bar Replay State
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [pointer, setPointer] = React.useState(0);

  const [chartReady, setChartReady] = React.useState(false);

  React.useEffect(() => {
    if (!chartContainerRef.current) return;
    
    try {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 600,
        layout: { background: { color: '#131722' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#2B2B43' }, horzLines: { color: '#2B2B43' } },
        timeScale: { timeVisible: true, secondsVisible: true }
      });

      // v5 API uses addSeries(CandlestickSeries)
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a', downColor: '#ef5350',
        borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350'
      });

      chartRef.current = chart;
      seriesRef.current = series;
      setChartReady(true);

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
        setChartReady(false);
      };
    } catch (err) {
      console.error("Critical error initializing chart:", err);
    }
  }, []);

  // Mode: Live Data Connection
  React.useEffect(() => {
    if (mode === 'live' && chartReady && seriesRef.current) {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
      const socketUrl = BASE_URL.replace('http', 'http') + '/ws-forex'; 
      
      const socket = new SockJS(socketUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          client.subscribe('/topic/candles', (message) => {
            try {
              const candle = JSON.parse(message.body);
              if (!candle || !seriesRef.current) return;
              
              let timestamp: number;
              if (Array.isArray(candle.timestamp)) {
                const [y, m, d, h, min, s] = candle.timestamp;
                timestamp = new Date(y, m - 1, d, h || 0, min || 0, s || 0).getTime();
              } else {
                timestamp = new Date(candle.timestamp).getTime();
              }

              if (isNaN(timestamp)) return;

              const timeObj = Math.floor(timestamp / 1000) as Time;
              const formattedCandle: CandleData = {
                time: timeObj, 
                open: Number(candle.open), 
                high: Number(candle.high), 
                low: Number(candle.low), 
                close: Number(candle.close)
              };

              seriesRef.current.update(formattedCandle);
              if (onPriceUpdate) onPriceUpdate(formattedCandle.close);
            } catch (err) {
              console.error("Error processing candle message:", err);
            }
          });
        }
      });
      client.activate();
      stompClientRef.current = client;

      return () => { client.deactivate(); };
    }
  }, [mode, chartReady]);

  // Set initial data for live mode
  React.useEffect(() => {
    if (mode === 'live' && chartReady && seriesRef.current && historicalData.length > 0) {
        try {
            seriesRef.current.setData(historicalData);
        } catch (err) {
            console.error("Error setting initial live data:", err);
        }
    }
  }, [mode, chartReady, historicalData]);

  // Mode: Bar Replay Logic
  React.useEffect(() => {
    if (mode === 'replay' && isPlaying && historicalData.length > 0) {
      const interval = setInterval(() => {
        setPointer(prev => {
          if (prev + 1 >= historicalData.length) {
            clearInterval(interval);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / (import.meta.env.VITE_REPLAY_SPEED || 1));
      return () => clearInterval(interval);
    }
  }, [mode, isPlaying, historicalData]);

  // Update chart when pointer advances in Replay Mode
  React.useEffect(() => {
    if (mode === 'replay' && seriesRef.current && historicalData.length > 0) {
      const dataSlice = historicalData.slice(0, pointer + 1);
      try {
        seriesRef.current.setData(dataSlice);
        if (onPriceUpdate && dataSlice.length > 0) {
            onPriceUpdate(dataSlice[dataSlice.length - 1].close);
        }
      } catch (e) {
        console.error("Error setting data in replay mode", e);
      }
    }
  }, [pointer, mode, historicalData, onPriceUpdate]);

  const handleRewind = () => { setPointer(p => Math.max(0, p - 10)); };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div ref={chartContainerRef} style={{ width: '100%' }} />
      {mode === 'replay' && (
        <div className="replay-controls" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={handleRewind} className="btn btn-warning">Rewind 10</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="btn btn-primary">{isPlaying ? 'Pause' : 'Play'}</button>
        </div>
      )}
    </div>
  );
};
