package com.forexquant.controller;

import com.forexquant.model.Strategy;
import com.forexquant.repository.StrategyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/strategies")
public class StrategyController {

    @Autowired
    private StrategyRepository strategyRepository;

    @GetMapping("/user/{userId}")
    public List<Strategy> getStrategiesByUser(@PathVariable Long userId) {
        return strategyRepository.findByUserId(userId);
    }

    @PostMapping("/save")
    public Strategy saveStrategy(@RequestBody Strategy strategy) {
        return strategyRepository.save(strategy);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStrategy(@PathVariable Long id) {
        strategyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/toggle/{id}")
    public Strategy toggleStrategy(@PathVariable Long id) {
        Strategy strategy = strategyRepository.findById(id).orElseThrow();
        strategy.setActive(!strategy.isActive());
        return strategyRepository.save(strategy);
    }
}
