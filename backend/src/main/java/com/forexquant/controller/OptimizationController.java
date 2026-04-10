package com.forexquant.controller;

import com.forexquant.service.BacktestService;
import com.forexquant.model.Backtest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/optimization")
public class OptimizationController {

    @Autowired
    private BacktestService backtestService;

    @PostMapping("/run")
    public ResponseEntity<List<Map<String, Object>>> runOptimizationSweep(
            @RequestParam Long userId,
            @RequestParam String strategyName,
            @RequestBody Map<String, List<Double>> parameterRanges) {
        
        List<Map<String, Object>> results = new ArrayList<>();
        
        // Mock Sweep logic: iterates through a range of parameters (e.g. RSI Period 10 to 20)
        List<Double> periods = parameterRanges.getOrDefault("rsi_period", List.of(14.0));
        
        for (Double period : periods) {
            // Run a mock backtest for each period
            Backtest simulated = backtestService.runAnalyticsOnTrades(userId, strategyName + "_p" + period.intValue());
            
            results.add(Map.of(
                "parameter", period,
                "profitFactor", 1.2 + (Math.random() * 0.8), // Randomized performance mocking
                "winRate", 45 + (Math.random() * 20),
                "sharpeRatio", simulated.getSharpeRatio()
            ));
        }
        
        return ResponseEntity.ok(results);
    }
}
