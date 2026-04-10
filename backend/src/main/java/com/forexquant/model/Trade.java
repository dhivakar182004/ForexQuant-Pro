package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_trades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // Assuming mapping to a User table later

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    @Column(nullable = false, precision = 10, scale = 5)
    private BigDecimal entryPrice;

    @Column(precision = 10, scale = 5)
    private BigDecimal exitPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal positionSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeType tradeType;

    @Column(precision = 10, scale = 2)
    private BigDecimal pnl;

    @Column(precision = 10, scale = 2)
    private BigDecimal drawdown;

    public enum TradeType {
        BUY, SELL
    }
}
