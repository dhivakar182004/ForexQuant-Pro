package com.forexquant.controller;

import com.forexquant.model.Backtest;
import com.forexquant.repository.BacktestRepository;
import com.forexquant.service.BacktestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/backtests")
public class BacktestController {

    @Autowired
    private BacktestRepository backtestRepository;

    @Autowired
    private BacktestService backtestService;

    @PostMapping("/save")
    public ResponseEntity<Backtest> saveSession(@RequestBody Backtest sessionResult) {
        if (sessionResult.getStartTime() == null) {
            sessionResult.setStartTime(LocalDateTime.now());
        }
        Backtest saved = backtestRepository.save(sessionResult);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Backtest>> getUserSessions(@PathVariable Long userId) {
        return ResponseEntity.ok(backtestRepository.findByUserId(userId));
    }

    @PostMapping("/analyze/{userId}")
    public ResponseEntity<Backtest> triggerAnalysis(@PathVariable Long userId, @RequestParam String sessionName) {
        return ResponseEntity.ok(backtestService.runAnalyticsOnTrades(userId, sessionName));
    }
}
