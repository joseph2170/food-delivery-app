package com.fooddelivery.fooddeliverybackend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendation")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class RecommendationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/top")
    public List<Map<String, Object>> getTopFoods() {
        // Query to get food items with order counts (if any)
        String sql = "SELECT " +
                     "   f.food_id, " +
                     "   f.name, " +
                     "   f.price, " +
                     "   f.image_url, " +
                     "   f.description, " +
                     "   f.category, " +
                     "   COALESCE(SUM(oi.quantity), 0) AS total_orders " +
                     "FROM food_items f " +
                     "LEFT JOIN order_items oi ON f.food_id = oi.food_id " +
                     "GROUP BY f.food_id, f.name, f.price, f.image_url, f.description, f.category " +
                     "ORDER BY total_orders DESC, f.food_id ASC " +
                     "LIMIT 8";
        
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            // Fallback query if there's any issue with JOIN
            String fallbackSql = "SELECT food_id, name, price, image_url, description, category, 0 as total_orders " +
                                "FROM food_items LIMIT 8";
            return jdbcTemplate.queryForList(fallbackSql);
        }
    }
}