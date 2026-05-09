import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

interface TradingViewChartProps {
  symbol: string;
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
  replayIndex?: number;
  livePrice?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, mode, historicalData, onPriceUpdate, replayIndex, livePrice }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const prevReplayIndex = useRef(0);

  // Initialize chart exactly the same for both Live and Replay modes
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; // clear

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: 'solid', color: '#000000' } as any,
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 600,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      }
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    if (historicalData && historicalData.length > 0) {
      if (mode === 'live') {
        candlestickSeries.setData(historicalData);
      } else {
        const initialDataLength = Math.min(50, historicalData.length);
        const idx = replayIndex !== undefined ? replayIndex : initialDataLength;
        candlestickSeries.setData(historicalData.slice(0, idx));
        prevReplayIndex.current = idx;
      }
    }

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Call resize once to ensure initial fit
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mode, symbol, historicalData]);

  // Handle Live Ticks dynamically
  useEffect(() => {
    if (mode === 'live' && livePrice && historicalData && historicalData.length > 0 && seriesRef.current) {
        const lastCandle = historicalData[historicalData.length - 1];
        seriesRef.current.update({
            time: lastCandle.time,
            open: lastCandle.open,
            high: Math.max(lastCandle.high, livePrice),
            low: Math.min(lastCandle.low, livePrice),
            close: livePrice
        });
    }
  }, [livePrice, mode, historicalData]);

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
