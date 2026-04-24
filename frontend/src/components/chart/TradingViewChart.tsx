import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  mode: 'live' | 'replay';
  historicalData?: any[];
  onPriceUpdate?: (price: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ mode, onPriceUpdate }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          "width": "100%",
          "height": 600,
          "symbol": "FX:EURUSD",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_chart_container",
          "hide_side_toolbar": false,
          "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies"
          ]
        });
      }
    };
    container.current.appendChild(script);
  }, []);

  return (
    <div className='tradingview-widget-container' style={{ height: "600px", width: "100%" }}>
      <div id='tradingview_chart_container' ref={container} style={{ height: "600px", width: "100%" }} />
    </div>
  );
};
