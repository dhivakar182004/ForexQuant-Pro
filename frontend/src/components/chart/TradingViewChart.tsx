import React, { useEffect, useRef } from 'react';
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
  const mainChartRef = useRef<any>(null);
  const rsiChartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const sma20Ref = useRef<any>(null);
  const sma50Ref = useRef<any>(null);
  const ema9Ref = useRef<any>(null);
  const ema21Ref = useRef<any>(null);
  const rsiRef = useRef<any>(null);
  const prevReplayIndex = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; // clear

    const showRSI = activeIndicators.includes('RSI14');

    // Create wrapper divs
    const mainWrapper = document.createElement('div');
    mainWrapper.style.display = 'flex';
    mainWrapper.style.flexDirection = 'column';
    mainWrapper.style.height = '100%';
    mainWrapper.style.width = '100%';
    mainWrapper.style.gap = '8px';

    const mainPane = document.createElement('div');
    mainPane.style.flex = showRSI ? '3' : '1';
    mainPane.style.width = '100%';
    mainPane.style.height = showRSI ? '75%' : '100%';
    mainWrapper.appendChild(mainPane);

    const rsiPane = document.createElement('div');
    rsiPane.style.flex = '1';
    rsiPane.style.width = '100%';
    rsiPane.style.height = '25%';
    rsiPane.style.borderTop = '1px solid #1f2937';
    rsiPane.style.display = showRSI ? 'block' : 'none';
    mainWrapper.appendChild(rsiPane);

    containerRef.current.appendChild(mainWrapper);

    const w = Math.max(containerRef.current.clientWidth, 100);
    const h = Math.max(containerRef.current.clientHeight, 300);

    // Initialize Main Candlestick Chart
    const mainChart = createChart(mainPane, {
      layout: {
        background: { type: 'solid', color: '#000000' } as any,
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: '#131722' },
        horzLines: { color: '#131722' },
      },
      width: w,
      height: showRSI ? Math.floor(h * 0.73) : h,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      }
    });

    const candlestickSeries = mainChart.addCandlestickSeries({
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    // Create moving averages
    const sma20Series = mainChart.addLineSeries({ color: '#2962FF', lineWidth: 2, crosshairMarkerVisible: false });
    const sma50Series = mainChart.addLineSeries({ color: '#FF6D00', lineWidth: 2, crosshairMarkerVisible: false });
    const ema9Series = mainChart.addLineSeries({ color: '#00E5FF', lineWidth: 1.5, crosshairMarkerVisible: false });
    const ema21Series = mainChart.addLineSeries({ color: '#D500F9', lineWidth: 1.5, crosshairMarkerVisible: false });

    mainChartRef.current = mainChart;
    seriesRef.current = candlestickSeries;
    sma20Ref.current = sma20Series;
    sma50Ref.current = sma50Series;
    ema9Ref.current = ema9Series;
    ema21Ref.current = ema21Series;

    // Initialize RSI Sub-Chart if active
    let rsiChart: any = null;
    let rsiSeries: any = null;

    if (showRSI) {
      rsiChart = createChart(rsiPane, {
        layout: {
          background: { type: 'solid', color: '#000000' } as any,
          textColor: 'rgba(255, 255, 255, 0.6)',
        },
        grid: {
          vertLines: { color: '#131722' },
          horzLines: { color: '#131722' },
        },
        width: w,
        height: Math.floor(h * 0.25),
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          visible: false, // hide timescales since main chart shows it
        },
        rightPriceScale: {
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        }
      });

      rsiSeries = rsiChart.addLineSeries({ color: '#FF9800', lineWidth: 1.5 });
      
      // Horizontal threshold lines
      rsiSeries.createPriceLine({ price: 70, color: 'rgba(239, 83, 80, 0.4)', lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: '70' });
      rsiSeries.createPriceLine({ price: 30, color: 'rgba(38, 166, 154, 0.4)', lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: '30' });

      // Synchronize timescales
      mainChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        rsiChart.timeScale().setVisibleLogicalRange(range || null);
      });
      rsiChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        mainChart.timeScale().setVisibleLogicalRange(range || null);
      });

      rsiChartRef.current = rsiChart;
      rsiRef.current = rsiSeries;
    }

    // Common Indicator Calculators
    const calculateSMA = (data: any[], period: number) => {
      const smaData = [];
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) continue;
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j].close;
        smaData.push({ time: data[i].time, value: sum / period });
      }
      return smaData;
    };

    const calculateEMA = (data: any[], period: number) => {
      const emaData = [];
      if (data.length === 0) return [];
      const k = 2 / (period + 1);
      let ema = data[0].close;
      emaData.push({ time: data[0].time, value: ema });
      for (let i = 1; i < data.length; i++) {
        ema = data[i].close * k + ema * (1 - k);
        emaData.push({ time: data[i].time, value: ema });
      }
      return emaData;
    };

    const calculateRSI = (data: any[], period: number = 14) => {
      const rsiData = [];
      if (data.length < period) return [];
      let gains = 0;
      let losses = 0;
      for (let i = 1; i <= period; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / period;
      let avgLoss = losses / period;
      let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiData.push({ time: data[period].time, value: 100 - (100 / (1 + rs)) });

      for (let i = period + 1; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiData.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
      }
      return rsiData;
    };

    if (historicalData && historicalData.length > 0) {
      let displayData = historicalData;
      if (mode !== 'live') {
        const initialDataLength = Math.min(50, historicalData.length);
        const idx = replayIndex !== undefined ? replayIndex : initialDataLength;
        displayData = historicalData.slice(0, idx);
        prevReplayIndex.current = idx;
      }
      candlestickSeries.setData(displayData);

      if (activeIndicators.includes('SMA20')) sma20Series.setData(calculateSMA(displayData, 20));
      else sma20Series.setData([]);

      if (activeIndicators.includes('SMA50')) sma50Series.setData(calculateSMA(displayData, 50));
      else sma50Series.setData([]);

      if (activeIndicators.includes('EMA9')) ema9Series.setData(calculateEMA(displayData, 9));
      else ema9Series.setData([]);

      if (activeIndicators.includes('EMA21')) ema21Series.setData(calculateEMA(displayData, 21));
      else ema21Series.setData([]);

      if (showRSI && rsiSeries) rsiSeries.setData(calculateRSI(displayData, 14));
    }

    const handleResize = () => {
      if (containerRef.current) {
        const newW = Math.max(containerRef.current.clientWidth, 100);
        const newH = Math.max(containerRef.current.clientHeight, 300);
        mainChart.applyOptions({
          width: newW,
          height: showRSI ? Math.floor(newH * 0.73) : newH,
        });
        if (rsiChart) {
          rsiChart.applyOptions({
            width: newW,
            height: Math.floor(newH * 0.25),
          });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      mainChart.remove();
      if (rsiChart) rsiChart.remove();
    };
  }, [mode, symbol, historicalData, activeIndicators]);

  // Handle Live Ticks
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
      } catch (e) {}
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

      // Incremental Indicator Updates
      const calculateSMA = (data: any[], period: number) => {
        const smaData = [];
        for (let i = 0; i < data.length; i++) {
          if (i < period - 1) continue;
          let sum = 0;
          for (let j = 0; j < period; j++) sum += data[i - j].close;
          smaData.push({ time: data[i].time, value: sum / period });
        }
        return smaData;
      };

      const calculateEMA = (data: any[], period: number) => {
        const emaData = [];
        if (data.length === 0) return [];
        const k = 2 / (period + 1);
        let ema = data[0].close;
        emaData.push({ time: data[0].time, value: ema });
        for (let i = 1; i < data.length; i++) {
          ema = data[i].close * k + ema * (1 - k);
          emaData.push({ time: data[i].time, value: ema });
        }
        return emaData;
      };

      const calculateRSI = (data: any[], period: number = 14) => {
        const rsiData = [];
        if (data.length < period) return [];
        let gains = 0;
        let losses = 0;
        for (let i = 1; i <= period; i++) {
          const diff = data[i].close - data[i - 1].close;
          if (diff > 0) gains += diff;
          else losses -= diff;
        }
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiData.push({ time: data[period].time, value: 100 - (100 / (1 + rs)) });

        for (let i = period + 1; i < data.length; i++) {
          const diff = data[i].close - data[i - 1].close;
          const gain = diff > 0 ? diff : 0;
          const loss = diff < 0 ? -diff : 0;
          avgGain = (avgGain * (period - 1) + gain) / period;
          avgLoss = (avgLoss * (period - 1) + loss) / period;
          rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsiData.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
        }
        return rsiData;
      };

      if (activeIndicators.includes('SMA20') && sma20Ref.current) {
        sma20Ref.current.setData(calculateSMA(displayData, 20));
      }
      if (activeIndicators.includes('SMA50') && sma50Ref.current) {
        sma50Ref.current.setData(calculateSMA(displayData, 50));
      }
      if (activeIndicators.includes('EMA9') && ema9Ref.current) {
        ema9Ref.current.setData(calculateEMA(displayData, 9));
      }
      if (activeIndicators.includes('EMA21') && ema21Ref.current) {
        ema21Ref.current.setData(calculateEMA(displayData, 21));
      }
      if (activeIndicators.includes('RSI14') && rsiRef.current) {
        rsiRef.current.setData(calculateRSI(displayData, 14));
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
