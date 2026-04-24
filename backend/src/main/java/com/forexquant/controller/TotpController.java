package com.forexquant.controller;

import com.forexquant.model.User;
import com.forexquant.repository.UserRepository;
import com.forexquant.security.jwt.JwtUtils;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.qr.QrDataFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class TotpController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private SecretGenerator secretGenerator;

    @Autowired
    private QrDataFactory qrDataFactory;

    @Autowired
    private QrGenerator qrGenerator;

    @Autowired
    private CodeVerifier codeVerifier;

    @GetMapping("/setup-totp")
    public ResponseEntity<?> setupTotp(Authentication authentication) throws Exception {
        User user = (User) authentication.getPrincipal(); 
        if(user == null) return ResponseEntity.status(401).build();

        if (user.getTotpSecret() == null) {
            String secret = secretGenerator.generate();
            user.setTotpSecret(secret);
            userRepository.save(user);
        }

        QrData data = qrDataFactory.newBuilder()
                .label(user.getEmail())
                .secret(user.getTotpSecret())
                .issuer("ForexQuant Pro")
                .build();
                
        String qrImageBase64 = dev.samstevens.totp.util.Utils.getDataUriForImage(
                qrGenerator.generate(data), qrGenerator.getImageMimeType()
        );
        return ResponseEntity.ok(Map.of("qrCode", qrImageBase64));
    }

    @PostMapping("/regenerate-totp")
    public ResponseEntity<?> regenerateTotp(Authentication authentication) throws Exception {
        User user = (User) authentication.getPrincipal(); 
        if(user == null) return ResponseEntity.status(401).build();

        String secret = secretGenerator.generate();
        user.setTotpSecret(secret);
        user.setTotpEnabled(false);
        userRepository.save(user);

        QrData data = qrDataFactory.newBuilder()
                .label(user.getEmail())
                .secret(user.getTotpSecret())
                .issuer("ForexQuant Pro")
                .build();
                
        String qrImageBase64 = dev.samstevens.totp.util.Utils.getDataUriForImage(
                qrGenerator.generate(data), qrGenerator.getImageMimeType()
        );
        return ResponseEntity.ok(Map.of("qrCode", qrImageBase64));
    }

    @PostMapping("/verify-totp")
    public ResponseEntity<?> verifyTotp(@RequestBody Map<String, String> payload, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String code = payload.get("code");

        if (codeVerifier.isValidCode(user.getTotpSecret(), code)) {
            user.setTotpEnabled(true);
            userRepository.save(user);
            
            // Final fully authorized token
            String finalToken = jwtUtils.generateJwtTokenFromEmail(user.getEmail(), true);
            return ResponseEntity.ok(Map.of("token", finalToken));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid Code"));
    }
}
