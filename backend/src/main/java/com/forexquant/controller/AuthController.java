package com.forexquant.controller;

import com.forexquant.model.User;
import com.forexquant.payload.request.LoginRequest;
import com.forexquant.payload.request.SignupRequest;
import com.forexquant.payload.response.MessageResponse;
import com.forexquant.repository.UserRepository;
import com.forexquant.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.forexquant.service.OtpService otpService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword()); // For demonstration purposes
        if (signUpRequest.getPhoneNumber() != null && !signUpRequest.getPhoneNumber().isBlank()) {
            if (userRepository.findByPhoneNumber(signUpRequest.getPhoneNumber()).isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already in use!"));
            }
            user.setPhoneNumber(signUpRequest.getPhoneNumber());
        }
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        var userOpt = userRepository.findByEmailOrPhoneNumber(loginRequest.getEmail(), loginRequest.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                boolean isFullyAuthenticated = !user.isTotpEnabled();
                String jwt = jwtUtils.generateJwtTokenFromEmail(user.getEmail(), isFullyAuthenticated);
                return ResponseEntity.ok(Map.of("token", jwt, "requiresTotp", user.isTotpEnabled()));
            } else {
                return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid password!"));
            }
        }
        return ResponseEntity.status(404).body(new MessageResponse("Error: User not found!"));
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        String emailOrPhone = payload.get("emailOrPhone");
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email or Phone is required"));
        }
        
        var userOpt = userRepository.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone);
        if (userOpt.isPresent()) {
            String otp = otpService.generateAndSendOtp(emailOrPhone);
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully to " + emailOrPhone,
                "devOtp", otp
            ));
        }
        return ResponseEntity.status(404).body(new MessageResponse("Error: User not found! Please register first."));
    }

    @PostMapping("/login-otp")
    public ResponseEntity<?> loginWithOtp(@RequestBody Map<String, String> payload) {
        String emailOrPhone = payload.get("emailOrPhone");
        String otp = payload.get("otp");
        
        if (emailOrPhone == null || otp == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Missing parameters"));
        }
        
        if (otpService.verifyOtp(emailOrPhone, otp)) {
            var userOpt = userRepository.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone);
            if (userOpt.isPresent()) {
                String jwt = jwtUtils.generateJwtTokenFromEmail(userOpt.get().getEmail(), true);
                return ResponseEntity.ok(Map.of("token", jwt, "requiresTotp", false));
            }
            return ResponseEntity.status(404).body(new MessageResponse("Error: User not found!"));
        } else {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid or expired OTP"));
        }
    }
}
