package com.forexquant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.forexquant.model.Candle;
import com.forexquant.repository.CandleRepository;
import com.forexquant.repository.StrategyRepository;
import com.forexquant.model.Strategy;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class ForexDataService {

    @Autowired
    private CandleRepository candleRepository;

    @Autowired
    private StrategyRepository strategyRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Value("${forexquant.api.websocket.url:}")
    private String websocketUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<Candle> batch = new ArrayList<>();

    @PostConstruct
    public void connectToExternalForexApi() {
        if (websocketUrl == null || websocketUrl.isBlank() || websocketUrl.contains("YOUR_FINNHUB_KEY")) {
            System.out.println("No External API Key found. Starting Mock Data Simulator for EUR/USD...");
            startMockDataSimulator();
            return;
        }

        try {
            StandardWebSocketClient client = new StandardWebSocketClient();
            client.doHandshake(new TextWebSocketHandler() {
                @Override
                public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                    System.out.println("Connected to Live Forex External API!");
                    // Subscribe to EUR/USD via Finnhub API (OANDA:EUR_USD)
                    session.sendMessage(new TextMessage("{\"type\":\"subscribe\",\"symbol\":\"OANDA:EUR_USD\"}"));
                }

                @Override
                protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
                    JsonNode root = objectMapper.readTree(message.getPayload());
                    if (root.has("type") && root.get("type").asText().equals("trade")) {
                        JsonNode data = root.get("data").get(0);
                        double price = data.get("p").asDouble();
                        long timestampMs = data.get("t").asLong();
                        double volume = data.get("v").asDouble();
                        String symbol = data.get("s").asText();

                        processLiveTick(symbol, BigDecimal.valueOf(price), timestampMs, volume);
                    }
                }
            }, websocketUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private synchronized void processLiveTick(String symbol, BigDecimal price, long timestampMs, double volume) {
        Candle candle = new Candle();
        candle.setSymbol(symbol);
        candle.setTimestamp(LocalDateTime.ofInstant(Instant.ofEpochMilli(timestampMs), ZoneId.systemDefault()));
        candle.setOpen(price.setScale(5, RoundingMode.HALF_UP));
        candle.setHigh(price.setScale(5, RoundingMode.HALF_UP));
        candle.setLow(price.setScale(5, RoundingMode.HALF_UP));
        candle.setClose(price.setScale(5, RoundingMode.HALF_UP));
        candle.setVolume((long) volume);
        candle.setTimeframe("tick");

        // Broadcast directly to React STOMP subscriber!
        messagingTemplate.convertAndSend("/topic/candles", candle);

        // Auto-Persist using batch processing
        batch.add(candle);
        if (batch.size() >= 50) {
            candleRepository.saveAll(batch);
            batch.clear();
        }

        evaluateActiveStrategies(symbol, price);
    }

    private void evaluateActiveStrategies(String symbol, BigDecimal currentPrice) {
        List<Strategy> activeStrategies = strategyRepository.findAll().stream()
                .filter(Strategy::isActive)
                .toList();
        
        for (Strategy strategy : activeStrategies) {
            // Simplified rule evaluation: if price ends in 00 or 50 (psychological levels) - demo trigger
            String priceStr = currentPrice.toString();
            if (priceStr.endsWith("00") || priceStr.endsWith("50")) {
                System.out.println(">>> AUTOMATOR: Strategy '" + strategy.getName() + "' triggered for " + symbol + " @ " + currentPrice);
                // Here we would call TradeService.executeTrade()
            }
        }
    }

    private void startMockDataSimulator() {
        new Thread(() -> {
            double currentPrice = 1.1050;
            while (true) {
                try {
                    Thread.sleep(1500); // Simulate tick every 1.5 seconds
                    currentPrice += (Math.random() - 0.5) * 0.0005;
                    long timestamp = System.currentTimeMillis();
                    processLiveTick("OANDA:EUR_USD", BigDecimal.valueOf(currentPrice), timestamp, 100 + Math.random() * 500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }).start();
    }
}
