package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "backtests")
public class Backtest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Strategy strategy;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "total_trades")
    private Integer totalTrades;

    @Column(name = "win_rate")
    private Double winRate;

    @Column(name = "net_profit")
    private Double netProfit;

    @Column(name = "max_drawdown")
    private Double maxDrawdown;
}
