package com.forexquant.util;

import com.forexquant.model.MarketData;
import com.forexquant.repository.MarketDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    MarketDataRepository marketDataRepository;

    @Override
    public void run(String... args) throws Exception {
        if (marketDataRepository.count() == 0) {
            seedMarketData();
        }
    }

    private void seedMarketData() {
        seedPair("EURUSD", 1.0850);
        seedPair("GBPUSD", 1.2640);
        seedPair("USDJPY", 149.50);
    }

    private void seedPair(String pair, double basePrice) {
        List<MarketData> dataList = new ArrayList<>();
        LocalDateTime start = LocalDateTime.now().minusDays(5);

        double lastClose = basePrice;
        for (int i = 0; i < 200; i++) {
            MarketData data = new MarketData();
            data.setPair(pair);
            data.setDataDate(start.plusMinutes(i * 15)); // 15m intervals

            double open = lastClose;
            double volatility = basePrice * 0.001; // 0.1% volatility
            double high = open + (Math.random() * volatility);
            double low = open - (Math.random() * volatility);
            double close = low + (Math.random() * (high - low));

            data.setOpenPrice(open);
            data.setHighPrice(high);
            data.setLowPrice(low);
            data.setClosePrice(close);
            data.setVolume((long) (Math.random() * 5000));

            dataList.add(data);
            lastClose = close;
        }

        marketDataRepository.saveAll(dataList);
        System.out.println("Seeded 200 bars of MarketData for " + pair);
    }
}
