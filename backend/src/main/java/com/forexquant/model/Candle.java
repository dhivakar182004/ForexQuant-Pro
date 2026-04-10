package com.forexquant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "forex_candles", indexes = {
    @Index(name = "idx_symbol_time", columnList = "symbol, timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String symbol; // e.g., EUR/USD

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, precision = 10, scale = 5)
    private BigDecimal open;

    @Column(nullable = false, precision = 10, scale = 5)
    private BigDecimal high;

    @Column(nullable = false, precision = 10, scale = 5)
    private BigDecimal low;

    @Column(name = "`close`", nullable = false, precision = 10, scale = 5)
    private BigDecimal close;

    @Column(nullable = false)
    private Long volume;

    @Column(nullable = false, length = 10)
    private String timeframe;
}
