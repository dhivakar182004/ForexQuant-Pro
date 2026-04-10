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

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword()); // For demonstration purposes (No BCrypt Context explicitly enabled)
        
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        return userRepository.findByEmail(loginRequest.getEmail()).map(user -> {
            if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                boolean isFullyAuthenticated = !user.isTotpEnabled();
                String jwt = jwtUtils.generateJwtTokenFromEmail(user.getEmail(), isFullyAuthenticated);
                return ResponseEntity.ok(Map.of("token", jwt, "requiresTotp", user.isTotpEnabled()));
            } else {
                return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid password!"));
            }
        }).orElse(ResponseEntity.status(404).body(new MessageResponse("Error: User not found!")));
    }
}
