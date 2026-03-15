import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const ChartView = () => {
    const chartContainerRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0c0d10' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#2a2e39' },
                horzLines: { color: '#2a2e39' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350',
        });

        // Mock Data
        candleSeries.setData([
            { time: '2023-12-22', open: 145.12, high: 147.12, low: 144.12, close: 146.12 },
            { time: '2023-12-23', open: 146.12, high: 148.12, low: 145.12, close: 147.12 },
            { time: '2023-12-24', open: 147.12, high: 149.12, low: 146.12, close: 148.12 },
            { time: '2023-12-25', open: 148.12, high: 151.12, low: 147.12, close: 150.12 },
            { time: '2023-12-26', open: 150.12, high: 152.12, low: 149.12, close: 151.12 },
        ]);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} className="w-100 h-100" />;
};

export default ChartView;
