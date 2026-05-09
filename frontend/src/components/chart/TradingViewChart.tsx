import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

interface TradingViewChartProps {
  symbol: string;
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
  replayIndex?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, mode, historicalData, onPriceUpdate, replayIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const prevReplayIndex = useRef(0);

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
            "symbol": symbol === 'BTCUSD' ? 'BINANCE:BTCUSD' : `FX:${symbol}`,
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
        // Initialize with a chunk of data if not specified
        const initialDataLength = Math.min(50, historicalData.length);
        const idx = replayIndex !== undefined ? replayIndex : initialDataLength;
        const initialData = historicalData.slice(0, idx);
        candlestickSeries.setData(initialData);
        prevReplayIndex.current = idx;
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
  }, [mode, symbol, historicalData]);

  // Handle Replay Playback externally via replayIndex
  useEffect(() => {
    if (mode === 'replay' && historicalData && seriesRef.current && replayIndex !== undefined) {
      if (replayIndex === prevReplayIndex.current + 1 && replayIndex <= historicalData.length) {
         // Smooth incremental append
         seriesRef.current.update(historicalData[replayIndex - 1]);
      } else {
         // Jump or reset
         seriesRef.current.setData(historicalData.slice(0, replayIndex));
      }
      prevReplayIndex.current = replayIndex;

      if (onPriceUpdate && replayIndex > 0 && replayIndex <= historicalData.length) {
        onPriceUpdate(historicalData[replayIndex - 1].close);
      }
    }
  }, [replayIndex, mode, historicalData, onPriceUpdate]);

  return (
    <div style={{ height: '100%', width: '100%', background: '#000', display: 'flex', flex: 1 }}>
      <div id="tv_chart_container" ref={containerRef} style={{ height: '100%', width: '100%', flex: 1 }} />
    </div>
  );
};
