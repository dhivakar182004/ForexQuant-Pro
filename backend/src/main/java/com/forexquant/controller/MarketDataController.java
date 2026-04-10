package com.forexquant.controller;

import com.forexquant.model.Candle;
import com.forexquant.repository.CandleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketDataController {

    @Autowired
    private CandleRepository candleRepository;

    @GetMapping("/history")
    public ResponseEntity<List<Candle>> getHistoricalData(
            @RequestParam String symbol,
            @RequestParam String start,
            @RequestParam String end) {
        
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);

        List<Candle> history = candleRepository.findBySymbolAndTimestampBetweenOrderByTimestampAsc(symbol, startTime, endTime);
        return ResponseEntity.ok(history);
    }
}
