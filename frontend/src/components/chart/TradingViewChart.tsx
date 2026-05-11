import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { MousePointer, TrendingUp, Minus, Square, Trash2, ArrowUpRight, AlignJustify, MoreVertical } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
  replayIndex?: number;
  livePrice?: number;
  activeIndicators?: string[];
}

interface DrawingShape {
  id: string;
  type: 'trendline' | 'horizontal' | 'rectangle' | 'arrow' | 'fibonacci' | 'vertical';
  startTime: number;
  startPrice: number;
  endTime?: number;
  endPrice?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  mode, 
  historicalData, 
  onPriceUpdate, 
  replayIndex, 
  livePrice, 
  activeIndicators = [] 
}) => {
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

  // Drawing Tools State
  const [drawings, setDrawings] = useState<DrawingShape[]>([]);
  const [activeTool, setActiveTool] = useState<'none' | 'trendline' | 'horizontal' | 'rectangle' | 'arrow' | 'fibonacci' | 'vertical'>('none');
  const [scaleTrigger, setScaleTrigger] = useState<number>(0);
  
  // Drag drawing states
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ time: number, price: number, x: number, y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ time: number, price: number, x: number, y: number } | null>(null);

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

    // Trigger state redraw on scroll or zoom
    const handleRangeUpdate = () => {
      setScaleTrigger(prev => prev + 1);
    };
    mainChart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeUpdate);
    mainChart.priceScale('right').subscribeVisiblePriceRangeChange(handleRangeUpdate);

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
      rsiChart.timeScale().subscribeVisibleLogicalRangeChange(handleRangeUpdate);
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
      setScaleTrigger(prev => prev + 1);
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

  // Handle Replay Playback
  useEffect(() => {
    if (mode === 'replay' && historicalData && seriesRef.current && replayIndex !== undefined) {
      const displayData = historicalData.slice(0, replayIndex);

      if (replayIndex === prevReplayIndex.current + 1 && replayIndex <= historicalData.length) {
        seriesRef.current.update(historicalData[replayIndex - 1]);
      } else {
        seriesRef.current.setData(displayData);
      }
      prevReplayIndex.current = replayIndex;

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
      setScaleTrigger(prev => prev + 1);
    }
  }, [replayIndex, mode, historicalData, onPriceUpdate, activeIndicators]);

  // SVG Mouse Drawing Handlers
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'none' || !mainChartRef.current || !seriesRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = mainChartRef.current.timeScale().coordinateToTime(x);
    const price = seriesRef.current.coordinateToPrice(y);

    if (time === null || price === null) return;

    // Single-click tools
    if (activeTool === 'horizontal' || activeTool === 'vertical') {
      const newShape: DrawingShape = {
        id: Math.random().toString(36).substring(7),
        type: activeTool,
        startTime: time,
        startPrice: price,
        endTime: time,
        endPrice: price
      };
      setDrawings(prev => [...prev, newShape]);
      return;
    }

    setIsDrawing(true);
    setDragStart({ time, price, x, y });
    setDragCurrent({ time, price, x, y });
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !dragStart || !mainChartRef.current || !seriesRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = mainChartRef.current.timeScale().coordinateToTime(x);
    const price = seriesRef.current.coordinateToPrice(y);

    if (time === null || price === null) return;

    setDragCurrent({ time, price, x, y });
  };

  const handleSvgMouseUp = () => {
    if (!isDrawing || !dragStart || !dragCurrent) return;

    const newShape: DrawingShape = {
      id: Math.random().toString(36).substring(7),
      type: activeTool as any,
      startTime: dragStart.time,
      startPrice: dragStart.price,
      endTime: dragCurrent.time,
      endPrice: dragCurrent.price
    };

    setDrawings(prev => [...prev, newShape]);
    setIsDrawing(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  // Convert logical values to pixels dynamically on scaleTrigger state changes (renders live)
  const renderedShapes = drawings.map(draw => {
    if (!mainChartRef.current || !seriesRef.current) return null;

    const x1 = mainChartRef.current.timeScale().timeToCoordinate(draw.startTime);
    const y1 = seriesRef.current.priceToCoordinate(draw.startPrice);
    
    let x2 = null;
    let y2 = null;

    if (draw.endTime !== undefined) {
      x2 = mainChartRef.current.timeScale().timeToCoordinate(draw.endTime);
    }
    if (draw.endPrice !== undefined) {
      y2 = seriesRef.current.priceToCoordinate(draw.endPrice);
    }

    return {
      ...draw,
      x1,
      y1,
      x2,
      y2
    };
  }).filter(s => s !== null && s.x1 !== null && s.y1 !== null);

  // Active shape drag preview details
  let activeRendered = null;
  if (isDrawing && dragStart && dragCurrent) {
    activeRendered = {
      type: activeTool,
      x1: dragStart.x,
      y1: dragStart.y,
      x2: dragCurrent.x,
      y2: dragCurrent.y
    };
  }

  return (
    <div style={{ height: '100%', width: '100%', background: '#000', display: 'flex', flex: 1, position: 'relative' }}>
      
      {/* Floating Glassmorphic Drawing Toolbar (HUD) */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          zIndex: 50, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px', 
          background: 'rgba(10,10,10,0.85)', 
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          padding: '6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <button 
          title="Pan & Hover Cursor"
          onClick={() => setActiveTool('none')}
          style={{
            background: activeTool === 'none' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'none' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <MousePointer size={16} />
        </button>

        <button 
          title="Draw Trend Line"
          onClick={() => setActiveTool('trendline')}
          style={{
            background: activeTool === 'trendline' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'trendline' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <TrendingUp size={16} />
        </button>

        <button 
          title="Place Horizontal Level"
          onClick={() => setActiveTool('horizontal')}
          style={{
            background: activeTool === 'horizontal' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'horizontal' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <Minus size={16} />
        </button>

        <button 
          title="Place Vertical Line"
          onClick={() => setActiveTool('vertical')}
          style={{
            background: activeTool === 'vertical' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'vertical' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <MoreVertical size={16} />
        </button>

        <button 
          title="Draw Arrow / Ray"
          onClick={() => setActiveTool('arrow')}
          style={{
            background: activeTool === 'arrow' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'arrow' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <ArrowUpRight size={16} />
        </button>

        <button 
          title="Fibonacci Retracement"
          onClick={() => setActiveTool('fibonacci')}
          style={{
            background: activeTool === 'fibonacci' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'fibonacci' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <AlignJustify size={16} />
        </button>

        <button 
          title="Draw Demand/Supply Zone (Rectangle)"
          onClick={() => setActiveTool('rectangle')}
          style={{
            background: activeTool === 'rectangle' ? 'var(--exness-yellow)' : 'transparent',
            color: activeTool === 'rectangle' ? '#000' : '#888',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <Square size={16} />
        </button>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

        <button 
          title="Clear All Annotations"
          onClick={() => setDrawings([])}
          style={{
            background: 'transparent',
            color: '#ff3d00',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,61,0,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Main Lightweight Chart Grid Container */}
      <div id="tv_chart_container" ref={containerRef} style={{ height: '100%', width: '100%', flex: 1 }} />

      {/* Transparent SVG Interactive Drawing Overlay Layer */}
      <svg 
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: activeIndicators.includes('RSI14') ? '73%' : '100%', // Align strictly with main pane height, avoiding RSI pane
          zIndex: activeTool !== 'none' ? 40 : 5, // Bring to front when tool active, fall to back during cursor hover zoom operations
          pointerEvents: activeTool !== 'none' ? 'auto' : 'none',
          cursor: activeTool !== 'none' ? 'crosshair' : 'default',
          background: 'transparent'
        }}
      >
        {/* Render Saved Annotations */}
        {renderedShapes.map((shape: any) => {
          if (!shape) return null;
          return (
            <g key={shape.id}>
              {shape.type === 'vertical' && (
                <line 
                  x1={shape.x1} 
                  y1="0" 
                  x2={shape.x1} 
                  y2="100%" 
                  stroke="var(--exness-yellow)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4" 
                />
              )}
              {shape.type === 'horizontal' && (
                <line 
                  x1="0" 
                  y1={shape.y1} 
                  x2="100%" 
                  y2={shape.y1} 
                  stroke="var(--exness-yellow)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4" 
                />
              )}
              {(shape.type === 'trendline' || shape.type === 'arrow') && shape.x2 !== null && shape.y2 !== null && (
                <g>
                  <line 
                    x1={shape.x1} 
                    y1={shape.y1} 
                    x2={shape.x2} 
                    y2={shape.y2} 
                    stroke="var(--exness-yellow)" 
                    strokeWidth="2" 
                  />
                  {shape.type === 'arrow' && (
                    <polygon 
                      points="0,-6 12,0 0,6" 
                      fill="var(--exness-yellow)"
                      transform={`translate(${shape.x2},${shape.y2}) rotate(${Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1) * 180 / Math.PI})`}
                    />
                  )}
                </g>
              )}
              {shape.type === 'fibonacci' && shape.x2 !== null && shape.y2 !== null && (
                <g>
                  <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3" />
                  {[0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map((level) => {
                    const y = shape.y1 + (shape.y2 - shape.y1) * level;
                    const w = Math.abs(shape.x2 - shape.x1);
                    return (
                      <g key={level}>
                        <line 
                          x1={Math.min(shape.x1, shape.x2)} 
                          y1={y} 
                          x2={Math.max(shape.x1, shape.x2)} 
                          y2={y} 
                          stroke={level === 0.5 || level === 0.618 ? 'rgba(0,255,0,0.6)' : 'rgba(255, 211, 0, 0.6)'} 
                          strokeWidth="1" 
                        />
                        <text x={Math.max(shape.x1, shape.x2) + 5} y={y + 4} fill="rgba(255,255,255,0.6)" fontSize="10px">
                          {level.toFixed(3)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
              {shape.type === 'rectangle' && shape.x2 !== null && shape.y2 !== null && (
                <rect 
                  x={Math.min(shape.x1, shape.x2)} 
                  y={Math.min(shape.y1, shape.y2)} 
                  width={Math.abs(shape.x2 - shape.x1)} 
                  height={Math.abs(shape.y2 - shape.y1)} 
                  fill="rgba(255, 211, 0, 0.12)" 
                  stroke="var(--exness-yellow)" 
                  strokeWidth="1.5" 
                />
              )}
            </g>
          );
        })}

        {/* Render Drag-Draw Preview */}
        {activeRendered && (
          <g>
            {(activeRendered.type === 'trendline' || activeRendered.type === 'arrow' || activeRendered.type === 'fibonacci') && (
              <line 
                x1={activeRendered.x1} 
                y1={activeRendered.y1} 
                x2={activeRendered.x2} 
                y2={activeRendered.y2} 
                stroke="rgba(255, 211, 0, 0.7)" 
                strokeWidth="2" 
                strokeDasharray="3" 
              />
            )}
            {activeRendered.type === 'rectangle' && (
              <rect 
                x={Math.min(activeRendered.x1, activeRendered.x2)} 
                y={Math.min(activeRendered.y1, activeRendered.y2)} 
                width={Math.abs(activeRendered.x2 - activeRendered.x1)} 
                height={Math.abs(activeRendered.y2 - activeRendered.y1)} 
                fill="rgba(255, 211, 0, 0.08)" 
                stroke="rgba(255, 211, 0, 0.7)" 
                strokeWidth="1.5" 
                strokeDasharray="2"
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
