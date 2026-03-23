package com.forexquant.controller;

import com.forexquant.model.MarketData;
import com.forexquant.repository.MarketDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {

    @Autowired
    MarketDataRepository marketDataRepository;

    @GetMapping("/{pair}")
    public ResponseEntity<List<MarketData>> getMarketData(@PathVariable String pair) {
        return ResponseEntity.ok(marketDataRepository.findByPairOrderByDataDateAsc(pair.toUpperCase()));
    }
}
