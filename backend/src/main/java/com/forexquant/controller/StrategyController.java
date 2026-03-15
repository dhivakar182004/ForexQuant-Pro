package com.forexquant.controller;

import com.forexquant.model.Strategy;
import com.forexquant.model.User;
import com.forexquant.repository.StrategyRepository;
import com.forexquant.repository.UserRepository;
import com.forexquant.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/strategies")
public class StrategyController {

    @Autowired
    StrategyRepository strategyRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Strategy>> getUserStrategies() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(strategyRepository.findByUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<Strategy> createStrategy(@RequestBody Strategy strategy) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        strategy.setUser(user);
        return ResponseEntity.ok(strategyRepository.save(strategy));
    }
}
