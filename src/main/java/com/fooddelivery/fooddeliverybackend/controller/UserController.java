package com.fooddelivery.fooddeliverybackend.controller;

import com.fooddelivery.fooddeliverybackend.model.User;
import com.fooddelivery.fooddeliverybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        System.out.println("Login attempt - Email: " + user.getEmail());
        
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        
        if (existingUser.isPresent() && existingUser.get().getPassword().equals(user.getPassword())) {
            User foundUser = existingUser.get();
            System.out.println("User found - ID: " + foundUser.getUserId() + ", Name: " + foundUser.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("user_id", foundUser.getUserId());
            response.put("name", foundUser.getName());
            response.put("email", foundUser.getEmail());
            response.put("role", foundUser.getRole());
            response.put("contact", foundUser.getContact());
            
            return ResponseEntity.ok(response);
        }
        
        System.out.println("Login failed for email: " + user.getEmail());
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    // Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        System.out.println("Signup attempt - Email: " + user.getEmail());
        
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }
        
        user.setRole("customer");
        User savedUser = userRepository.save(user);
        System.out.println("User created with ID: " + savedUser.getUserId());
        
        return ResponseEntity.ok("Signup successful");
    }
}