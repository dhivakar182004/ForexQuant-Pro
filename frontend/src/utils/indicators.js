/**
 * Technical Indicator Utilities for ForexQuant Pro
 */

// Simple Moving Average
export const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push({ time: data[i].time, value: null });
            continue;
        }
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        sma.push({ time: data[i].time, value: sum / period });
    }
    return sma.filter(val => val.value !== null);
};

// Exponential Moving Average
export const calculateEMA = (data, period) => {
    if (!data || data.length === 0) return [];
    const ema = [];
    const k = 2 / (period + 1);

    // Support both candle format (.close) and indicator format (.value)
    const getValue = (d) => (d.close !== undefined ? d.close : (d.value !== undefined ? d.value : 0));

    let prevEma = getValue(data[0]);

    for (let i = 0; i < data.length; i++) {
        const currentVal = getValue(data[i]);
        if (i === 0) {
            ema.push({ time: data[i].time, value: prevEma });
            continue;
        }
        const currentEma = currentVal * k + prevEma * (1 - k);
        ema.push({ time: data[i].time, value: currentEma });
        prevEma = currentEma;
    }
    return ema;
};

// Relative Strength Index (RSI)
export const calculateRSI = (data, period = 14) => {
    const rsi = [];
    let gains = 0;
    let losses = 0;

    if (!data || data.length <= period) return [];

    for (let i = 1; i <= period; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        const currentGain = diff >= 0 ? diff : 0;
        const currentLoss = diff < 0 ? -diff : 0;

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

        const rs = avgGain / avgLoss;
        const rsiValue = 100 - (100 / (1 + rs));
        rsi.push({ time: data[i].time, value: rsiValue });
    }
    return rsi;
};

// MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine = [];
    for (let i = 0; i < data.length; i++) {
        const fast = fastEMA.find(e => e.time === data[i].time)?.value;
        const slow = slowEMA.find(e => e.time === data[i].time)?.value;
        if (fast && slow) {
            macdLine.push({ time: data[i].time, value: fast - slow });
        }
    }

    const signalLine = calculateEMA(macdLine, signalPeriod);

    const histogram = [];
    for (let i = 0; i < signalLine.length; i++) {
        const macdVal = macdLine.find(m => m.time === signalLine[i].time)?.value;
        if (macdVal !== undefined) {
            histogram.push({
                time: signalLine[i].time,
                value: macdVal - signalLine[i].value,
                color: (macdVal - signalLine[i].value) >= 0 ? '#22c55e' : '#ef4444'
            });
        }
    }

    return { macdLine, signalLine, histogram };
};
