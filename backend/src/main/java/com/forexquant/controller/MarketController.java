package com.forexquant.controller;

import com.forexquant.model.Candle;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @GetMapping("/history")
    public List<Candle> getMarketHistory(@RequestParam String symbol, @RequestParam String start, @RequestParam String end) {
        List<Candle> history = new ArrayList<>();
        LocalDateTime currentTime = LocalDateTime.now().minusHours(24);
        double currentPrice = 1.1050; // Starting price for EUR/USD

        // Generate 100 historical candles
        for (int i = 0; i < 100; i++) {
            Candle candle = new Candle();
            candle.setSymbol(symbol);
            candle.setTimestamp(currentTime);
            
            double open = currentPrice;
            double close = currentPrice + (Math.random() - 0.5) * 0.0020;
            double high = Math.max(open, close) + Math.random() * 0.0010;
            double low = Math.min(open, close) - Math.random() * 0.0010;
            
            candle.setOpen(BigDecimal.valueOf(open).setScale(5, RoundingMode.HALF_UP));
            candle.setHigh(BigDecimal.valueOf(high).setScale(5, RoundingMode.HALF_UP));
            candle.setLow(BigDecimal.valueOf(low).setScale(5, RoundingMode.HALF_UP));
            candle.setClose(BigDecimal.valueOf(close).setScale(5, RoundingMode.HALF_UP));
            candle.setVolume((long) (Math.random() * 1000));
            
            history.add(candle);
            
            currentPrice = close;
            currentTime = currentTime.plusMinutes(15);
        }
        
        return history;
    }
}
