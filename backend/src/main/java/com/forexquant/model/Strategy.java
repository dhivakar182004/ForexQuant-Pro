package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "strategies")
public class Strategy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "strategy_name", nullable = false)
    private String strategyName;

    @Column(nullable = false)
    private String pair;

    @Column(nullable = false)
    private String timeframe;

    @Column(name = "entry_rule", columnDefinition = "TEXT")
    private String entryRule;

    @Column(name = "exit_rule", columnDefinition = "TEXT")
    private String exitRule;

    @Column(name = "stop_loss")
    private Double stopLoss;

    @Column(name = "take_profit")
    private Double takeProfit;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
