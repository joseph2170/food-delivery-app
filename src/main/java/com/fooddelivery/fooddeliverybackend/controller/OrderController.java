package com.fooddelivery.fooddeliverybackend.controller;

import com.fooddelivery.fooddeliverybackend.model.Order;
import com.fooddelivery.fooddeliverybackend.model.OrderItem;
import com.fooddelivery.fooddeliverybackend.model.User;
import com.fooddelivery.fooddeliverybackend.model.Food;
import com.fooddelivery.fooddeliverybackend.repository.OrderRepository;
import com.fooddelivery.fooddeliverybackend.repository.OrderItemRepository;
import com.fooddelivery.fooddeliverybackend.repository.UserRepository;
import com.fooddelivery.fooddeliverybackend.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FoodRepository foodRepository;

    // Create new order
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            System.out.println("=== CREATE ORDER REQUEST ===");
            System.out.println("Order Data: " + orderData);
            
            // Get customer ID safely
            Integer customerId = null;
            Object customerIdObj = orderData.get("customerId");
            if (customerIdObj instanceof Integer) {
                customerId = (Integer) customerIdObj;
            } else if (customerIdObj instanceof String) {
                try {
                    customerId = Integer.parseInt((String) customerIdObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid customer ID format"));
                }
            } else if (customerIdObj instanceof Long) {
                customerId = ((Long) customerIdObj).intValue();
            }
            
            if (customerId == null || customerId == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid customer ID is required"));
            }
            
            // Get items safely
            List<Map<String, Object>> items = null;
            Object itemsObj = orderData.get("items");
            if (itemsObj instanceof List) {
                items = (List<Map<String, Object>>) itemsObj;
            }
            
            if (items == null || items.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No items in order"));
            }
            
            // Get delivery address
            String deliveryAddress = (String) orderData.get("deliveryAddress");
            if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Delivery address is required"));
            }
            
            String paymentMethod = (String) orderData.get("paymentMethod");
            if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
                paymentMethod = "cash";
            }
            
            System.out.println("Customer ID: " + customerId);
            System.out.println("Items count: " + items.size());
            System.out.println("Delivery Address: " + deliveryAddress);
            System.out.println("Payment Method: " + paymentMethod);
            
            // Validate each item has foodId
            for (Map<String, Object> item : items) {
                if (item.get("foodId") == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Food ID is missing for an item"));
                }
            }
            
            // Calculate total amount
            double totalAmount = 0;
            for (Map<String, Object> item : items) {
                Double price = ((Number) item.get("price")).doubleValue();
                Integer quantity = (Integer) item.get("quantity");
                totalAmount += price * quantity;
            }
            
            // Create and save order
            Order order = new Order();
            order.setCustomerId(customerId);
            order.setRestaurantId(1);
            order.setTotalAmount(totalAmount);
            order.setStatus("placed");
            order.setOrderTime(new Date());
            order.setDeliveryAddress(deliveryAddress);
            order.setPaymentMethod(paymentMethod);
            
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MINUTE, 35);
            order.setEstimatedDeliveryTime(String.format("%02d:%02d", cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE)));
            
            Order savedOrder = orderRepository.save(order);
            System.out.println("Order saved with ID: " + savedOrder.getOrderId());
            
            // Save order items
            for (Map<String, Object> item : items) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(savedOrder.getOrderId());
                
                // Get foodId safely
                Integer foodId = null;
                Object foodIdObj = item.get("foodId");
                if (foodIdObj instanceof Integer) {
                    foodId = (Integer) foodIdObj;
                } else if (foodIdObj instanceof String) {
                    try {
                        foodId = Integer.parseInt((String) foodIdObj);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid food ID format: " + foodIdObj);
                        continue;
                    }
                } else if (foodIdObj instanceof Long) {
                    foodId = ((Long) foodIdObj).intValue();
                }
                
                if (foodId == null) {
                    System.out.println("Skipping item with null foodId");
                    continue;
                }
                
                orderItem.setFoodId(foodId);
                orderItem.setQuantity((Integer) item.get("quantity"));
                orderItem.setPrice(((Number) item.get("price")).doubleValue());
                orderItemRepository.save(orderItem);
                System.out.println("Order item saved - Food ID: " + foodId + ", Quantity: " + item.get("quantity"));
            }
            
            // Verify items were saved
            List<OrderItem> savedItems = orderItemRepository.findByOrderId(savedOrder.getOrderId());
            System.out.println("Total order items saved: " + savedItems.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order placed successfully");
            response.put("orderId", savedOrder.getOrderId());
            response.put("estimatedDeliveryTime", order.getEstimatedDeliveryTime());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get user orders
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable Integer userId) {
        try {
            System.out.println("=== GET USER ORDERS ===");
            System.out.println("User ID: " + userId);
            
            if (userId == null || userId == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Valid user ID is required"));
            }
            
            List<Order> orders = orderRepository.findByCustomerIdOrderByOrderTimeDesc(userId);
            System.out.println("Found " + orders.size() + " orders");
            
            List<Map<String, Object>> orderList = new ArrayList<>();
            for (Order order : orders) {
                Map<String, Object> orderInfo = new HashMap<>();
                orderInfo.put("orderId", order.getOrderId());
                orderInfo.put("totalAmount", order.getTotalAmount());
                orderInfo.put("status", order.getStatus());
                orderInfo.put("orderTime", order.getOrderTime());
                orderInfo.put("estimatedDeliveryTime", order.getEstimatedDeliveryTime());
                orderInfo.put("deliveryAddress", order.getDeliveryAddress());
                orderInfo.put("paymentMethod", order.getPaymentMethod());
                
                // Get order items
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                System.out.println("Order " + order.getOrderId() + " has " + items.size() + " items");
                
                List<Map<String, Object>> itemList = new ArrayList<>();
                for (OrderItem item : items) {
                    Map<String, Object> itemInfo = new HashMap<>();
                    Optional<Food> foodOpt = foodRepository.findById(item.getFoodId());
                    String foodName = foodOpt.map(Food::getName).orElse("Unknown Food");
                    itemInfo.put("foodName", foodName);
                    itemInfo.put("quantity", item.getQuantity());
                    itemInfo.put("price", item.getPrice());
                    itemList.add(itemInfo);
                }
                orderInfo.put("items", itemList);
                orderList.add(orderInfo);
            }
            
            System.out.println("Returning " + orderList.size() + " orders");
            return ResponseEntity.ok(orderList);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get single order details
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Integer orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Order not found"));
            }
            
            Order order = orderOpt.get();
            Map<String, Object> orderInfo = new HashMap<>();
            orderInfo.put("orderId", order.getOrderId());
            orderInfo.put("totalAmount", order.getTotalAmount());
            orderInfo.put("status", order.getStatus());
            orderInfo.put("orderTime", order.getOrderTime());
            orderInfo.put("estimatedDeliveryTime", order.getEstimatedDeliveryTime());
            orderInfo.put("deliveryAddress", order.getDeliveryAddress());
            orderInfo.put("paymentMethod", order.getPaymentMethod());
            
            List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
            List<Map<String, Object>> itemList = new ArrayList<>();
            for (OrderItem item : items) {
                Map<String, Object> itemInfo = new HashMap<>();
                Optional<Food> foodOpt = foodRepository.findById(item.getFoodId());
                String foodName = foodOpt.map(Food::getName).orElse("Unknown Food");
                itemInfo.put("foodName", foodName);
                itemInfo.put("quantity", item.getQuantity());
                itemInfo.put("price", item.getPrice());
                itemList.add(itemInfo);
            }
            orderInfo.put("items", itemList);
            
            return ResponseEntity.ok(orderInfo);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Cancel order
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Integer orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Order not found"));
            }
            
            Order order = orderOpt.get();
            if (!"placed".equals(order.getStatus())) {
                return ResponseEntity.status(400).body(Map.of("error", "Order cannot be cancelled. Current status: " + order.getStatus()));
            }
            
            order.setStatus("cancelled");
            orderRepository.save(order);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Order cancelled successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}