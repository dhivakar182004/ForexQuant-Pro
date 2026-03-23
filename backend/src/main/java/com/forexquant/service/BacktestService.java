package com.forexquant.service;

import com.forexquant.model.Backtest;
import com.forexquant.model.Strategy;
import com.forexquant.model.Trade;
import com.forexquant.repository.BacktestRepository;
import com.forexquant.repository.StrategyRepository;
import com.forexquant.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class BacktestService {

    @Autowired
    BacktestRepository backtestRepository;

    @Autowired
    StrategyRepository strategyRepository;

    @Autowired
    TradeRepository tradeRepository;

    public Backtest runBacktest(Long strategyId) {
        Strategy strategy = strategyRepository.findById(strategyId).orElseThrow();

        // Simulate Backtest logic
        Backtest backtest = new Backtest();
        backtest.setStrategy(strategy);
        backtest.setStartDate(LocalDateTime.now().minusMonths(6));
        backtest.setEndDate(LocalDateTime.now());

        Random random = new Random();
        int totalTrades = 50 + random.nextInt(100);
        int winningTrades = (int) (totalTrades * (0.4 + (random.nextDouble() * 0.3))); // 40-70% win rate

        backtest.setTotalTrades(totalTrades);
        backtest.setWinRate((double) winningTrades / totalTrades * 100);

        double tp = strategy.getTakeProfit() != null ? strategy.getTakeProfit() : 50.0;
        double sl = strategy.getStopLoss() != null ? strategy.getStopLoss() : 25.0;
        double netProfit = (winningTrades * tp) - ((totalTrades - winningTrades) * sl);
        backtest.setNetProfit(netProfit);
        backtest.setMaxDrawdown(5.0 + random.nextDouble() * 15.0);

        Backtest savedBacktest = backtestRepository.save(backtest);

        // Generate simulated trades
        for (int i = 0; i < totalTrades; i++) {
            Trade trade = new Trade();
            trade.setBacktest(savedBacktest);
            trade.setPair(strategy.getPair());
            trade.setEntryPrice(1.1000 + (random.nextDouble() * 0.05));
            boolean isWin = i < winningTrades; // Simplified
            trade.setExitPrice(trade.getEntryPrice() + (isWin ? (tp / 10000) : -(sl / 10000)));
            trade.setProfitLoss(isWin ? tp : -sl);
            trade.setTradeDate(savedBacktest.getStartDate().plusDays(i));
            tradeRepository.save(trade);
        }

        return savedBacktest;
    }
}
