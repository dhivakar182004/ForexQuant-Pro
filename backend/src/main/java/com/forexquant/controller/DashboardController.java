package com.forexquant.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/analytics")
    public ResponseEntity<?> getGlobalAnalytics() {
        // High-level system aggregation for the broader Risk/Analytics platform views
        return ResponseEntity.ok(Map.of(
            "totalVolumeTraded", 15000000,
            "activeSessions", 42,
            "averageWinRate", 54.2,
            "platformStatus", "Operational",
            "latencyMs", 12
        ));
    }
}
