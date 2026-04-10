package com.forexquant.controller;

import com.forexquant.model.Trade;
import com.forexquant.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    @Autowired
    private TradeRepository tradeRepository;

    @PostMapping("/execute")
    public ResponseEntity<Trade> executeTrade(@RequestBody Trade tradeRequest) {
        tradeRequest.setEntryTime(LocalDateTime.now());
        // For demonstration, defaulting standard position sizes internally if empty
        if (tradeRequest.getPositionSize() == null || tradeRequest.getPositionSize().compareTo(BigDecimal.ZERO) == 0) {
            tradeRequest.setPositionSize(new BigDecimal("100000")); // 1 Standard Lot
        }
        Trade savedTrade = tradeRepository.save(tradeRequest);
        return ResponseEntity.ok(savedTrade);
    }

    @PostMapping("/close/{id}")
    public ResponseEntity<Trade> closeTrade(@PathVariable Long id, @RequestBody Trade closeRequest) {
        return tradeRepository.findById(id).map(trade -> {
            trade.setExitPrice(closeRequest.getExitPrice());
            trade.setExitTime(LocalDateTime.now());
            
            // Basic PnL calculations for a forex trade using BigDecimal
            if (trade.getTradeType() == Trade.TradeType.BUY) {
                BigDecimal pnl = trade.getExitPrice().subtract(trade.getEntryPrice()).multiply(trade.getPositionSize());
                trade.setPnl(pnl);
            } else {
                BigDecimal pnl = trade.getEntryPrice().subtract(trade.getExitPrice()).multiply(trade.getPositionSize());
                trade.setPnl(pnl);
            }
            
            Trade updated = tradeRepository.save(trade);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Trade>> getAllTrades() {
        return ResponseEntity.ok(tradeRepository.findAll());
    }
}
