package com.forexquant.controller;

import com.forexquant.model.Backtest;
import com.forexquant.model.Strategy;
import com.forexquant.repository.BacktestRepository;
import com.forexquant.repository.StrategyRepository;
import com.forexquant.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    StrategyRepository strategyRepository;

    @Autowired
    BacktestRepository backtestRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = userDetails.getId();
        
        List<Strategy> strategies = strategyRepository.findByUserId(userId);
        int totalStrategies = strategies.size();
        
        int totalBacktests = 0;
        double netProfit = 0.0;
        
        for (Strategy s : strategies) {
            List<Backtest> backtests = backtestRepository.findByStrategyId(s.getId());
            totalBacktests += backtests.size();
            for (Backtest b : backtests) {
                if (b.getNetProfit() != null) {
                    netProfit += b.getNetProfit();
                }
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalStrategies", totalStrategies);
        response.put("totalBacktests", totalBacktests);
        response.put("netProfit", netProfit);
        response.put("riskSummary", "Moderate");

        return ResponseEntity.ok(response);
    }
}
