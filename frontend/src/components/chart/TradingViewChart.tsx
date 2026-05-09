import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

interface TradingViewChartProps {
  symbol: string;
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
  replayIndex?: number;
  livePrice?: number;
  activeIndicators?: string[];
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, mode, historicalData, onPriceUpdate, replayIndex, livePrice, activeIndicators = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const sma20Ref = useRef<any>(null);
  const sma50Ref = useRef<any>(null);
  const prevReplayIndex = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; // clear

    const w = Math.max(containerRef.current.clientWidth, 100);
    const h = Math.max(containerRef.current.clientHeight, 300);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: 'solid', color: '#000000' } as any,
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: w,
      height: h,
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
    
    const sma20Series = chart.addLineSeries({ color: '#2962FF', lineWidth: 2, crosshairMarkerVisible: false });
    const sma50Series = chart.addLineSeries({ color: '#FF6D00', lineWidth: 2, crosshairMarkerVisible: false });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    sma20Ref.current = sma20Series;
    sma50Ref.current = sma50Series;

    if (historicalData && historicalData.length > 0) {
      let displayData = historicalData;
      if (mode !== 'live') {
        const initialDataLength = Math.min(50, historicalData.length);
        const idx = replayIndex !== undefined ? replayIndex : initialDataLength;
        displayData = historicalData.slice(0, idx);
        prevReplayIndex.current = idx;
      }
      candlestickSeries.setData(displayData);
      
      // Calculate Indicators
      const calculateSMA = (data: any[], period: number) => {
          const smaData = [];
          for (let i = 0; i < data.length; i++) {
              if (i < period - 1) continue; // Not enough data
              let sum = 0;
              for (let j = 0; j < period; j++) {
                  sum += data[i - j].close;
              }
              smaData.push({ time: data[i].time, value: sum / period });
          }
          return smaData;
      };

      if (activeIndicators.includes('SMA20')) {
          sma20Series.setData(calculateSMA(displayData, 20));
      } else {
          sma20Series.setData([]);
      }

      if (activeIndicators.includes('SMA50')) {
          sma50Series.setData(calculateSMA(displayData, 50));
      } else {
          sma50Series.setData([]);
      }
    }

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        const newW = Math.max(containerRef.current.clientWidth, 100);
        const newH = Math.max(containerRef.current.clientHeight, 300);
        chartRef.current.applyOptions({ 
          width: newW,
          height: newH 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [mode, symbol, historicalData, activeIndicators]);

  // Handle Live Ticks dynamically
  useEffect(() => {
    if (mode === 'live' && livePrice && historicalData && historicalData.length > 0 && seriesRef.current) {
        const lastCandle = historicalData[historicalData.length - 1];
        try {
            seriesRef.current.update({
                time: lastCandle.time,
                open: lastCandle.open,
                high: Math.max(lastCandle.high, livePrice),
                low: Math.min(lastCandle.low, livePrice),
                close: livePrice
            });
        } catch(e) {}
    }
  }, [livePrice, mode, historicalData]);

  // Handle Replay Playback externally via replayIndex
  useEffect(() => {
    if (mode === 'replay' && historicalData && seriesRef.current && replayIndex !== undefined) {
      const displayData = historicalData.slice(0, replayIndex);
      
      if (replayIndex === prevReplayIndex.current + 1 && replayIndex <= historicalData.length) {
         seriesRef.current.update(historicalData[replayIndex - 1]);
      } else {
         seriesRef.current.setData(displayData);
      }
      prevReplayIndex.current = replayIndex;

      // Update Indicators incrementally
      const calculateSingleSMA = (data: any[], index: number, period: number) => {
          if (index < period) return null;
          let sum = 0;
          for (let j = 1; j <= period; j++) {
              sum += data[index - j].close;
          }
          return sum / period;
      };

      if (activeIndicators.includes('SMA20') && sma20Ref.current) {
          if (replayIndex === prevReplayIndex.current && replayIndex <= historicalData.length) {
              const val = calculateSingleSMA(historicalData, replayIndex, 20);
              if (val !== null) sma20Ref.current.update({ time: historicalData[replayIndex - 1].time, value: val });
          } else {
             // full recompute
             const smaData = [];
             for (let i = 19; i < displayData.length; i++) {
                 let sum = 0;
                 for (let j = 0; j < 20; j++) sum += displayData[i - j].close;
                 smaData.push({ time: displayData[i].time, value: sum / 20 });
             }
             sma20Ref.current.setData(smaData);
          }
      }
      
      if (activeIndicators.includes('SMA50') && sma50Ref.current) {
          if (replayIndex === prevReplayIndex.current && replayIndex <= historicalData.length) {
              const val = calculateSingleSMA(historicalData, replayIndex, 50);
              if (val !== null) sma50Ref.current.update({ time: historicalData[replayIndex - 1].time, value: val });
          } else {
             const smaData = [];
             for (let i = 49; i < displayData.length; i++) {
                 let sum = 0;
                 for (let j = 0; j < 50; j++) sum += displayData[i - j].close;
                 smaData.push({ time: displayData[i].time, value: sum / 50 });
             }
             sma50Ref.current.setData(smaData);
          }
      }

      if (onPriceUpdate && replayIndex > 0 && replayIndex <= historicalData.length) {
        onPriceUpdate(historicalData[replayIndex - 1].close);
      }
    }
  }, [replayIndex, mode, historicalData, onPriceUpdate, activeIndicators]);

  return (
    <div style={{ height: '100%', width: '100%', background: '#000', display: 'flex', flex: 1 }}>
      <div id="tv_chart_container" ref={containerRef} style={{ height: '100%', width: '100%', flex: 1 }} />
    </div>
  );
};
