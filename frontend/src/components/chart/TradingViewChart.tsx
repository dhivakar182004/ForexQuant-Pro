import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

interface TradingViewChartProps {
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
  isReplaying?: boolean;
  replaySpeed?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ mode, historicalData, onPriceUpdate, isReplaying, replaySpeed = 1 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; // clear

    if (mode === 'live') {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if ((window as any).TradingView) {
          new (window as any).TradingView.widget({
            "autosize": true,
            "symbol": "FX:EURUSD",
            "interval": "15",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tv_chart_container",
            "height": 600,
            "width": "100%"
          });
        }
      };
      containerRef.current.appendChild(script);
    } else {
      // Replay mode
      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: 'solid', color: '#000000' } as any,
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: { color: '#334158' },
          horzLines: { color: '#334158' },
        },
        width: containerRef.current.clientWidth,
        height: 600,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });
      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      if (historicalData && historicalData.length > 0) {
        // Initialize with a chunk of data so the chart isn't empty
        const initialDataLength = Math.min(50, historicalData.length);
        const initialData = historicalData.slice(0, initialDataLength);
        candlestickSeries.setData(initialData);
        setReplayIndex(initialDataLength);
      }

      const handleResize = () => {
        chart.applyOptions({ width: containerRef.current?.clientWidth || 0 });
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [mode, historicalData]);

  // Handle Replay Playback
  useEffect(() => {
    if (mode === 'replay' && isReplaying && historicalData && seriesRef.current) {
      const intervalMs = 1000 / replaySpeed;
      const interval = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev < historicalData.length) {
            seriesRef.current.update(historicalData[prev]);
            if (onPriceUpdate) onPriceUpdate(historicalData[prev].close);
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [mode, isReplaying, replaySpeed, historicalData, onPriceUpdate]);

  return (
    <div style={{ height: '600px', width: '100%', background: '#000' }}>
      <div id="tv_chart_container" ref={containerRef} style={{ height: '600px', width: '100%' }} />
    </div>
  );
};
