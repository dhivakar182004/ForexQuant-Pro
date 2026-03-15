package com.forexquant.controller;

import com.forexquant.model.Trade;
import com.forexquant.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trades")
public class TradeController {

    @Autowired
    TradeRepository tradeRepository;

    @GetMapping("/backtest/{backtestId}")
    public ResponseEntity<List<Trade>> getTrades(@PathVariable Long backtestId) {
        return ResponseEntity.ok(tradeRepository.findByBacktestId(backtestId));
    }
}
