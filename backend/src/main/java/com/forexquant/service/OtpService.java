package com.forexquant.service;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    
    // emailOrPhone -> OtpRecord
    private final ConcurrentHashMap<String, OtpRecord> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public String generateAndSendOtp(String emailOrPhone) {
        String otp = String.format("%06d", random.nextInt(999999));
        
        // Expiry 5 minutes
        otpCache.put(emailOrPhone, new OtpRecord(otp, System.currentTimeMillis() + 5 * 60 * 1000));
        
        // Mock sending
        System.out.println("=================================================");
        System.out.println(">>> MOCK SMS/EMAIL DELIVERY <<<");
        System.out.println("To: " + emailOrPhone);
        System.out.println("Your ForexQuant Pro Login OTP is: " + otp);
        System.out.println("=================================================");
        
        return otp;
    }

    public boolean verifyOtp(String emailOrPhone, String otpCode) {
        OtpRecord record = otpCache.get(emailOrPhone);
        if (record == null) {
            return false;
        }
        
        if (System.currentTimeMillis() > record.expiryTime()) {
            otpCache.remove(emailOrPhone);
            return false;
        }
        
        if (record.otp().equals(otpCode)) {
            otpCache.remove(emailOrPhone); // One-time use
            return true;
        }
        return false;
    }

    private record OtpRecord(String otp, long expiryTime) {}
}
