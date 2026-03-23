package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "trades")
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "backtest_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Backtest backtest;

    @Column(nullable = false)
    private String pair;

    @Column(name = "entry_price")
    private Double entryPrice;

    @Column(name = "exit_price")
    private Double exitPrice;

    @Column(name = "profit_loss")
    private Double profitLoss;

    @Column(name = "trade_date")
    private LocalDateTime tradeDate;
}
