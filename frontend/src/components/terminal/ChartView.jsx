import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { calculateEMA, calculateRSI, calculateMACD } from '../../utils/indicators';

const ChartView = ({
    data = [],
    indicators = { ema: true, rsi: false, macd: false },
    onCrosshairMove
}) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();

    // Use memoized indicator settings to prevent useEffect size warnings
    const indicatorSettings = useMemo(() => indicators, [indicators.ema, indicators.rsi, indicators.macd]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

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
            height: chartContainerRef.current.clientHeight || 400,
            timeScale: {
                borderColor: '#2a2e39',
                timeVisible: true,
                secondsVisible: false,
            },
        });
        chartRef.current = chart;

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        seriesRef.current = candleSeries;

        if (onCrosshairMove) {
            chart.subscribeCrosshairMove(onCrosshairMove);
        }

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight || 400
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (onCrosshairMove) chart.unsubscribeCrosshairMove(onCrosshairMove);
            chart.remove();
        };
    }, []); // Init chart only once

    const indicatorSeriesRef = useRef(new Map());

    // Update data and indicators
    useEffect(() => {
        if (!chartRef.current || !seriesRef.current || data.length === 0) return;

        // Update main candle series
        seriesRef.current.setData(data);

        // EMA(9) management
        if (indicatorSettings.ema) {
            const emaData = calculateEMA(data, 9);
            if (!indicatorSeriesRef.current.has('ema')) {
                const emaSeries = chartRef.current.addSeries(LineSeries, {
                    color: '#00bcd4',
                    lineWidth: 2,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    title: 'EMA(9)'
                });
                indicatorSeriesRef.current.set('ema', emaSeries);
            }
            indicatorSeriesRef.current.get('ema').setData(emaData);
        } else if (indicatorSeriesRef.current.has('ema')) {
            chartRef.current.removeSeries(indicatorSeriesRef.current.get('ema'));
            indicatorSeriesRef.current.delete('ema');
        }

        // RSI(14) management
        if (indicatorSettings.rsi) {
            const rsiData = calculateRSI(data, 14);
            if (!indicatorSeriesRef.current.has('rsi')) {
                const rsiSeries = chartRef.current.addSeries(LineSeries, {
                    color: '#8b5cf6',
                    lineWidth: 1,
                    priceLineVisible: true,
                    title: 'RSI(14)'
                });
                indicatorSeriesRef.current.set('rsi', rsiSeries);
            }
            indicatorSeriesRef.current.get('rsi').setData(rsiData);
        } else if (indicatorSeriesRef.current.has('rsi')) {
            chartRef.current.removeSeries(indicatorSeriesRef.current.get('rsi'));
            indicatorSeriesRef.current.delete('rsi');
        }

        // MACD management
        if (indicatorSettings.macd) {
            const macdData = calculateMACD(data);
            if (!indicatorSeriesRef.current.has('macd')) {
                const macdSeries = chartRef.current.addSeries(LineSeries, { color: '#2196f3', lineWidth: 1, title: 'MACD' });
                const signalSeries = chartRef.current.addSeries(LineSeries, { color: '#ff9800', lineWidth: 1, title: 'Signal' });
                indicatorSeriesRef.current.set('macd', macdSeries);
                indicatorSeriesRef.current.set('signal', signalSeries);
            }
            indicatorSeriesRef.current.get('macd').setData(macdData.macdLine);
            indicatorSeriesRef.current.get('signal').setData(macdData.signalLine);
        } else {
            if (indicatorSeriesRef.current.has('macd')) {
                chartRef.current.removeSeries(indicatorSeriesRef.current.get('macd'));
                indicatorSeriesRef.current.delete('macd');
            }
            if (indicatorSeriesRef.current.has('signal')) {
                chartRef.current.removeSeries(indicatorSeriesRef.current.get('signal'));
                indicatorSeriesRef.current.delete('signal');
            }
        }
    }, [data, indicatorSettings]);

    return <div ref={chartContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }} />;
};

export default ChartView;
