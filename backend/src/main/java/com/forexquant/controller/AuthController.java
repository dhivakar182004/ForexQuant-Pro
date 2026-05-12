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
        try {
            String reqEmail = loginRequest != null ? loginRequest.getEmail() : "null";
            String reqPass = loginRequest != null ? loginRequest.getPassword() : "null";
            System.out.println("[AUTH DIAGNOSTIC] signin request email: '" + reqEmail + "'");
            System.out.println("[AUTH DIAGNOSTIC] signin request password length: " + (reqPass != null ? reqPass.length() : 0));
            
            var userOpt = userRepository.findByEmailOrPhoneNumber(reqEmail, reqEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String dbPass = user.getPassword();
                System.out.println("[AUTH DIAGNOSTIC] DB user found email: '" + user.getEmail() + "'");
                System.out.println("[AUTH DIAGNOSTIC] DB user password length: " + (dbPass != null ? dbPass.length() : 0));
                
                if (dbPass != null && dbPass.equals(reqPass)) {
                    System.out.println("[AUTH DIAGNOSTIC] PASSWORDS MATCH SUCCESS!");
                    boolean isFullyAuthenticated = !user.isTotpEnabled();
                    String jwt = jwtUtils.generateJwtTokenFromEmail(user.getEmail(), isFullyAuthenticated);
                    return ResponseEntity.ok(Map.of("token", jwt, "requiresTotp", user.isTotpEnabled()));
                } else {
                    System.out.println("[AUTH DIAGNOSTIC] PASSWORDS MISMATCH! req: '" + reqPass + "' vs db: '" + dbPass + "'");
                    return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid password!"));
                }
            }
            System.out.println("[AUTH DIAGNOSTIC] User not found: '" + reqEmail + "'");
            return ResponseEntity.status(404).body(new MessageResponse("Error: User not found!"));
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            String trace = sw.toString();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Exception in signin handler",
                "message", e.getMessage() != null ? e.getMessage() : "null",
                "trace", trace
            ));
        }
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is required"));
        }
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Generate random 6-digit code
            String resetToken = String.format("%06d", new java.util.Random().nextInt(999999));
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "message", "Reset code generated successfully!",
                "devToken", resetToken
            ));
        }
        return ResponseEntity.status(404).body(new MessageResponse("Error: Email address not found"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (email == null || token == null || newPassword == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Missing required parameters"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Password must be at least 8 characters long"));
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getResetToken() != null && user.getResetToken().equals(token)) {
                if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(java.time.LocalDateTime.now())) {
                    user.setPassword(newPassword);
                    user.setResetToken(null);
                    user.setResetTokenExpiry(null);
                    userRepository.save(user);
                    return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
                } else {
                    return ResponseEntity.status(400).body(new MessageResponse("Error: Reset code has expired!"));
                }
            } else {
                return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid reset code!"));
            }
        }
        return ResponseEntity.status(404).body(new MessageResponse("Error: User not found!"));
    }
}
