// ChatbotController.java
package com.fooddelivery.fooddeliverybackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/ask")
    public Map<String, String> askChatbot(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        String response = generateResponse(query);
        
        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return result;
    }

    private String generateResponse(String query) {
        String lowerQuery = query.toLowerCase().trim();
        
        // Welcome message
        if (lowerQuery.contains("hi") || lowerQuery.contains("hello") || lowerQuery.contains("hey")) {
            return "👋 Hello! Welcome to SmartBite! How can I help you today?\n\nYou can ask me about:\n• Veg/Non-Veg items\n• Menu items\n• Delivery info\n• Popular dishes";
        }
        
        // Veg items
        if (lowerQuery.contains("veg") || lowerQuery.contains("vegetarian")) {
            return getVegItems();
        }
        
        // Non-veg items
        if (lowerQuery.contains("non-veg") || lowerQuery.contains("nonveg") || lowerQuery.contains("chicken") || lowerQuery.contains("mutton")) {
            return getNonVegItems();
        }
        
        // List all items
        if (lowerQuery.contains("list") || lowerQuery.contains("all items") || lowerQuery.contains("menu")) {
            return getAllItems();
        }
        
        // Search for specific food
        if (lowerQuery.contains("search") || lowerQuery.contains("find")) {
            String searchTerm = extractSearchTerm(query);
            return searchFoodItems(searchTerm);
        }
        
        // Popular dishes
        if (lowerQuery.contains("popular") || lowerQuery.contains("trending") || lowerQuery.contains("best")) {
            return getPopularItems();
        }
        
        // Delivery info
        if (lowerQuery.contains("delivery") || lowerQuery.contains("shipping") || lowerQuery.contains("deliver")) {
            return getDeliveryInfo();
        }
        
        // Price inquiry
        if (lowerQuery.contains("price") || lowerQuery.contains("cost") || lowerQuery.contains("₹")) {
            String foodName = extractFoodName(query);
            return getPriceInfo(foodName);
        }
        
        // Help
        if (lowerQuery.contains("help") || lowerQuery.contains("what can you do")) {
            return getHelpMessage();
        }
        
        // Thank you
        if (lowerQuery.contains("thank") || lowerQuery.contains("thanks")) {
            return "You're welcome! 😊 Is there anything else I can help you with?";
        }
        
        // Default response
        return getDefaultResponse();
    }

    private String getVegItems() {
        try {
            String sql = "SELECT name, price FROM food_items WHERE category = 'Veg' LIMIT 10";
            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql);
            
            if (items.isEmpty()) {
                return "No veg items found.";
            }
            
            StringBuilder response = new StringBuilder("🥬 **Vegetarian Items:**\n\n");
            for (Map<String, Object> item : items) {
                response.append("• ").append(item.get("name"))
                       .append(" - ₹").append(item.get("price"))
                       .append("\n");
            }
            response.append("\n🍽️ Would you like to know more about any specific item?");
            return response.toString();
        } catch (Exception e) {
            return "🥬 **Vegetarian Items:**\n• Margherita Pizza - ₹180\n• Veg Burger - ₹80\n• Paneer Butter Masala - ₹120\n• Masala Dosa - ₹60\n• Veg Biryani - ₹100\n\nType 'menu' to see all items!";
        }
    }

    private String getNonVegItems() {
        try {
            String sql = "SELECT name, price FROM food_items WHERE category = 'Non-Veg' LIMIT 10";
            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql);
            
            if (items.isEmpty()) {
                return "No non-veg items found.";
            }
            
            StringBuilder response = new StringBuilder("🍗 **Non-Vegetarian Items:**\n\n");
            for (Map<String, Object> item : items) {
                response.append("• ").append(item.get("name"))
                       .append(" - ₹").append(item.get("price"))
                       .append("\n");
            }
            response.append("\n🍽️ Would you like to order something?");
            return response.toString();
        } catch (Exception e) {
            return "🍗 **Non-Vegetarian Items:**\n• Chicken Biryani - ₹150\n• Butter Chicken - ₹170\n• Chicken Tikka - ₹160\n• Fish Fry - ₹180\n• Mutton Biryani - ₹250\n\nType 'menu' to see all items!";
        }
    }

    private String getAllItems() {
        try {
            String sql = "SELECT name, price, category FROM food_items LIMIT 15";
            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql);
            
            StringBuilder response = new StringBuilder("📋 **Complete Menu:**\n\n");
            response.append("🟢 **Veg Items:**\n");
            for (Map<String, Object> item : items) {
                if ("Veg".equals(item.get("category"))) {
                    response.append("  • ").append(item.get("name"))
                           .append(" - ₹").append(item.get("price"))
                           .append("\n");
                }
            }
            response.append("\n🔴 **Non-Veg Items:**\n");
            for (Map<String, Object> item : items) {
                if ("Non-Veg".equals(item.get("category"))) {
                    response.append("  • ").append(item.get("name"))
                           .append(" - ₹").append(item.get("price"))
                           .append("\n");
                }
            }
            response.append("\n💡 Type 'veg' or 'non-veg' for specific categories!");
            return response.toString();
        } catch (Exception e) {
            return "📋 **Our Menu:**\n\n🟢 Veg: Margherita Pizza, Veg Burger, Paneer Butter Masala, Masala Dosa\n\n🔴 Non-Veg: Chicken Biryani, Butter Chicken, Chicken Tikka, Fish Fry\n\nType 'veg' or 'non-veg' for details!";
        }
    }

    private String searchFoodItems(String searchTerm) {
        if (searchTerm.isEmpty()) {
            return "🔍 Please specify what you're looking for.\nExample: 'search pizza' or 'find chicken'";
        }
        
        try {
            String sql = "SELECT name, price, category FROM food_items WHERE LOWER(name) LIKE ? LIMIT 5";
            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql, "%" + searchTerm + "%");
            
            if (items.isEmpty()) {
                return "🔍 No items found matching '" + searchTerm + "'.\nTry a different search term or type 'menu' to see all items.";
            }
            
            StringBuilder response = new StringBuilder("🔍 **Search Results for '" + searchTerm + "':**\n\n");
            for (Map<String, Object> item : items) {
                String category = "Veg".equals(item.get("category")) ? "🟢" : "🔴";
                response.append(category).append(" ").append(item.get("name"))
                       .append(" - ₹").append(item.get("price"))
                       .append("\n");
            }
            return response.toString();
        } catch (Exception e) {
            return "🔍 Try searching for: pizza, biryani, burger, chicken, or pasta";
        }
    }

    private String getPopularItems() {
        return "⭐ **Popular Dishes:**\n\n• Chicken Biryani - ₹150 (Most Ordered)\n• Margherita Pizza - ₹180\n• Butter Chicken - ₹170\n• Paneer Butter Masala - ₹120\n• Veg Burger - ₹80\n\n🔥 These are customer favorites!";
    }

    private String getDeliveryInfo() {
        return "🚚 **Delivery Information:**\n\n• **Free Delivery** on orders above ₹200\n• **Delivery Time:** 30-45 minutes\n• **Delivery Area:** Within 5 km radius\n• **Payment Options:** Cash, Card, UPI\n• **Order Tracking:** Available after order confirmation\n\nNeed help with an existing order? Contact support!";
    }

    private String getPriceInfo(String foodName) {
        if (foodName.isEmpty()) {
            return "💰 Please specify the item name.\nExample: 'price of chicken biryani' or 'how much is pizza?'";
        }
        
        try {
            String sql = "SELECT name, price FROM food_items WHERE LOWER(name) LIKE ? LIMIT 1";
            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql, "%" + foodName + "%");
            
            if (items.isEmpty()) {
                return "💰 Sorry, I couldn't find '" + foodName + "'.\nType 'menu' to see all available items with prices.";
            }
            
            Map<String, Object> item = items.get(0);
            return "💰 **" + item.get("name") + "** costs **₹" + item.get("price") + "**\n\nWould you like to add this to your cart?";
        } catch (Exception e) {
            return "💰 Most items range from ₹50 to ₹300.\nType 'menu' to see all prices!";
        }
    }

    private String getHelpMessage() {
        return "🤖 **I can help you with:**\n\n" +
               "📋 **Menu:** 'menu', 'all items', 'veg', 'non-veg'\n" +
               "🔍 **Search:** 'search pizza', 'find chicken'\n" +
               "⭐ **Popular:** 'popular dishes', 'trending'\n" +
               "💰 **Price:** 'price of biryani'\n" +
               "🚚 **Delivery:** 'delivery info', 'delivery time'\n\n" +
               "Just type your question and I'll help you! 😊";
    }

    private String getDefaultResponse() {
        return "🤔 I didn't understand that.\n\nYou can ask me:\n• 'Show me veg items'\n• 'List all non-veg items'\n• 'What's popular?'\n• 'Delivery info'\n• 'Help'\n\nHow can I assist you today?";
    }

    private String extractSearchTerm(String query) {
        String[] words = query.split(" ");
        for (int i = 0; i < words.length; i++) {
            if (words[i].equalsIgnoreCase("search") || words[i].equalsIgnoreCase("find")) {
                if (i + 1 < words.length) {
                    return words[i + 1];
                }
            }
        }
        return "";
    }

    private String extractFoodName(String query) {
        String[] words = query.split(" ");
        for (int i = 0; i < words.length; i++) {
            if (words[i].equalsIgnoreCase("price") || words[i].equalsIgnoreCase("cost")) {
                if (i + 1 < words.length) {
                    return words[i + 1];
                }
            }
        }
        return "";
    }
}
