package com.forexquant.service;

import com.forexquant.model.Backtest;
import com.forexquant.model.Trade;
import com.forexquant.repository.BacktestRepository;
import com.forexquant.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BacktestService {

    @Autowired
    private BacktestRepository backtestRepository;

    @Autowired
    private TradeRepository tradeRepository;

    public Backtest runAnalyticsOnTrades(Long userId, String sessionName) {
        List<Trade> trades = tradeRepository.findAll(); // In real app, filter by userId and session
        
        BigDecimal totalPnL = trades.stream()
                .filter(t -> t.getPnl() != null)
                .map(Trade::getPnl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long winners = trades.stream().filter(t -> t.getPnl() != null && t.getPnl().compareTo(BigDecimal.ZERO) > 0).count();
        double winRate = trades.isEmpty() ? 0 : (double) winners / trades.size() * 100;

        Backtest report = new Backtest();
        report.setUserId(userId);
        report.setSymbol("MULTIPLE"); // Generic
        report.setSharpeRatio(1.5); // Placeholder for complex calc
        report.setMaxDrawdown(5.0); // Placeholder
        report.setTotalProfitLoss(totalPnL.doubleValue());
        
        return backtestRepository.save(report);
    }
}
