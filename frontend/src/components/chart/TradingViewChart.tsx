import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ mode, onPriceUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

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
  }, [mode]);

  return (
    <div style={{ height: '600px', width: '100%', background: '#000' }}>
      <div id="tv_chart_container" ref={containerRef} style={{ height: '600px', width: '100%' }} />
    </div>
  );
};
