package com.forexquant.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
public class MarketController {

    @GetMapping("/history")
    public ResponseEntity<?> getMarketHistory(
            @RequestParam String symbol,
            @RequestParam String timeframe,
            @RequestParam(required = false) Long startTime) {
        try {
            String binanceSymbol = "BTCUSDT";
            String sym = symbol.toUpperCase().replace("/", "").replace(":", "");
            if (sym.contains("EURUSD") || sym.contains("EUR")) binanceSymbol = "EURUSDT";
            else if (sym.contains("GBPUSD") || sym.contains("GBP")) binanceSymbol = "GBPUSDT";
            else if (sym.contains("USDJPY") || sym.contains("JPY")) binanceSymbol = "USDTJPY";
            else if (sym.contains("XAUUSD") || sym.contains("XAU")) binanceSymbol = "PAXGUSDT";
            else if (sym.contains("BTCUSD") || sym.contains("BTC")) binanceSymbol = "BTCUSDT";

            String binanceInterval = "15m";
            if ("1m".equals(timeframe)) binanceInterval = "1m";
            else if ("5m".equals(timeframe)) binanceInterval = "5m";
            else if ("15m".equals(timeframe)) binanceInterval = "15m";
            else if ("1H".equals(timeframe)) binanceInterval = "1h";
            else if ("4H".equals(timeframe)) binanceInterval = "4h";
            else if ("1D".equals(timeframe)) binanceInterval = "1d";

            String url = "https://api.binance.com/api/v3/klines?symbol=" + binanceSymbol + "&interval=" + binanceInterval + "&limit=500";
            if (startTime != null) {
                url += "&startTime=" + startTime;
            }

            RestTemplate restTemplate = new RestTemplate();
            List<?> response = restTemplate.getForObject(url, List.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/prices")
    public ResponseEntity<?> getLivePrices() {
        try {
            String url = "https://api.binance.com/api/v3/ticker/price?symbols=[\"EURUSDT\",\"GBPUSDT\",\"USDTJPY\",\"BTCUSDT\",\"PAXGUSDT\"]";
            RestTemplate restTemplate = new RestTemplate();
            List<?> response = restTemplate.getForObject(url, List.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}
