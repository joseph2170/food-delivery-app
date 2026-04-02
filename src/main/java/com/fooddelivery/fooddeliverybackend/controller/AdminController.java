package com.fooddelivery.fooddeliverybackend.controller;

import com.fooddelivery.fooddeliverybackend.model.Food;
import com.fooddelivery.fooddeliverybackend.model.User;
import com.fooddelivery.fooddeliverybackend.model.AdminLog;
import com.fooddelivery.fooddeliverybackend.repository.FoodRepository;
import com.fooddelivery.fooddeliverybackend.repository.UserRepository;
import com.fooddelivery.fooddeliverybackend.repository.AdminLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FoodRepository foodRepository;
    
    @Autowired
    private AdminLogRepository adminLogRepository;

    // Get the absolute path to the static images directory
    private final String IMAGE_DIR = System.getProperty("user.dir") + "/src/main/resources/static/images/";

    // Admin Login
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        System.out.println("=== ADMIN LOGIN ATTEMPT ===");
        System.out.println("Email: " + email);
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Admin not found"
                ));
            }
            
            User user = userOpt.get();
            
            if (!"admin".equals(user.getRole())) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Not an admin account"
                ));
            }
            
            if (!password.equals(user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Invalid password"
                ));
            }
            
            // Log login
            try {
                AdminLog log = new AdminLog();
                log.setAdminId(user.getUserId());
                log.setAction("LOGIN");
                log.setDetails("Admin logged in at " + new Date());
                adminLogRepository.save(log);
            } catch (Exception e) {
                System.out.println("Log error: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("admin", Map.of(
                "id", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // Get all food items
    @PostMapping("/foods")
    public ResponseEntity<?> getAllFoods(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        
        try {
            Optional<User> adminOpt = userRepository.findById(userId);
            if (adminOpt.isEmpty() || !"admin".equals(adminOpt.get().getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }
            
            List<Food> foods = foodRepository.findAll();
            return ResponseEntity.ok(foods);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Add new food item with image
    @PostMapping(value = "/foods/add", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addFood(
            @RequestParam("userId") Long userId,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        System.out.println("=== ADDING NEW FOOD ===");
        System.out.println("Name: " + name);
        System.out.println("Price: " + price);
        System.out.println("Category: " + category);
        System.out.println("Image provided: " + (image != null && !image.isEmpty()));
        
        try {
            // Verify admin
            Optional<User> adminOpt = userRepository.findById(userId);
            if (adminOpt.isEmpty() || !"admin".equals(adminOpt.get().getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }
            
            // Create food object
            Food food = new Food();
            food.setName(name);
            food.setDescription(description);
            food.setPrice(price);
            food.setCategory(category);
            food.setRestaurantId(1);
            
            // Save image if provided
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                imageUrl = saveImage(image);
                food.setImageUrl(imageUrl);
                System.out.println("Image saved with URL: " + imageUrl);
            } else {
                // Set default image based on category
                if ("Veg".equals(category)) {
                    food.setImageUrl("/images/veg_default.jpg");
                } else {
                    food.setImageUrl("/images/nonveg_default.jpg");
                }
            }
            
            Food savedFood = foodRepository.save(food);
            System.out.println("Food saved with ID: " + savedFood.getId());
            
            // Log action
            AdminLog log = new AdminLog();
            log.setAdminId(userId);
            log.setAction("ADD_FOOD");
            log.setDetails("Added food: " + name);
            adminLogRepository.save(log);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Food item added successfully",
                "foodId", savedFood.getId(),
                "imageUrl", imageUrl
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Update food item
    @PutMapping(value = "/foods/update/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateFood(
            @PathVariable Integer id,
            @RequestParam("userId") Long userId,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Optional<User> adminOpt = userRepository.findById(userId);
            if (adminOpt.isEmpty() || !"admin".equals(adminOpt.get().getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }
            
            Optional<Food> foodOpt = foodRepository.findById(id);
            if (foodOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Food not found"));
            }
            
            Food food = foodOpt.get();
            food.setName(name);
            food.setDescription(description);
            food.setPrice(price);
            food.setCategory(category);
            
            if (image != null && !image.isEmpty()) {
                String imageUrl = saveImage(image);
                food.setImageUrl(imageUrl);
            }
            
            foodRepository.save(food);
            
            AdminLog log = new AdminLog();
            log.setAdminId(userId);
            log.setAction("UPDATE_FOOD");
            log.setDetails("Updated food ID: " + id);
            adminLogRepository.save(log);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Food updated successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete food item
    @DeleteMapping("/foods/delete/{id}")
    public ResponseEntity<?> deleteFood(
            @PathVariable Integer id,
            @RequestBody Map<String, Long> request) {
        
        Long userId = request.get("userId");
        
        try {
            Optional<User> adminOpt = userRepository.findById(userId);
            if (adminOpt.isEmpty() || !"admin".equals(adminOpt.get().getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }
            
            Optional<Food> foodOpt = foodRepository.findById(id);
            if (foodOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Food not found"));
            }
            
            String foodName = foodOpt.get().getName();
            foodRepository.deleteById(id);
            
            AdminLog log = new AdminLog();
            log.setAdminId(userId);
            log.setAction("DELETE_FOOD");
            log.setDetails("Deleted food: " + foodName);
            adminLogRepository.save(log);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Food deleted successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam Long userId) {
        try {
            Optional<User> adminOpt = userRepository.findById(userId);
            if (adminOpt.isEmpty() || !"admin".equals(adminOpt.get().getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }
            
            long totalFoods = foodRepository.count();
            long totalUsers = userRepository.count();
            
            return ResponseEntity.ok(Map.of(
                "totalFoods", totalFoods,
                "totalOrders", 0,
                "totalUsers", totalUsers
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Get admin logs
    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam Long userId) {
        try {
            Optional<User> adminOpt = userRepository.findById(userId);
            if (adminOpt.isEmpty() || !"admin".equals(adminOpt.get().getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }
            
            List<AdminLog> logs = adminLogRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(logs);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Helper method to save image
    private String saveImage(MultipartFile image) throws IOException {
        // Create directory if it doesn't exist
        Path imagePath = Paths.get(IMAGE_DIR);
        if (!Files.exists(imagePath)) {
            Files.createDirectories(imagePath);
            System.out.println("Created directory: " + IMAGE_DIR);
        }
        
        // Generate unique filename
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = System.currentTimeMillis() + extension;
        
        // Save the file
        Path filePath = imagePath.resolve(fileName);
        Files.copy(image.getInputStream(), filePath);
        
        System.out.println("Image saved to: " + filePath.toAbsolutePath());
        
        // Return the URL path
        return "/images/" + fileName;
    }
}