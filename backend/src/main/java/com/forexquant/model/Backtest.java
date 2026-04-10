package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "backtest_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Backtest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionName;

    @Column(nullable = false)
    private Long userId;

    private String symbol;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Double totalProfitLoss;

    private Double maxDrawdown;

    private Double sharpeRatio;

    private Integer totalTrades;
    
    private Integer winRatePercentage;
}
