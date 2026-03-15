package com.forexquant.controller;

import com.forexquant.model.Backtest;
import com.forexquant.repository.BacktestRepository;
import com.forexquant.service.BacktestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/backtests")
public class BacktestController {

    @Autowired
    BacktestRepository backtestRepository;

    @Autowired
    BacktestService backtestService;

    @GetMapping("/strategy/{strategyId}")
    public ResponseEntity<List<Backtest>> getStrategyBacktests(@PathVariable Long strategyId) {
        return ResponseEntity.ok(backtestRepository.findByStrategyId(strategyId));
    }

    @PostMapping("/run/{strategyId}")
    public ResponseEntity<Backtest> runBacktest(@PathVariable Long strategyId) {
        return ResponseEntity.ok(backtestService.runBacktest(strategyId));
    }
}
