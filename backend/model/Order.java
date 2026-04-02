package com.fooddelivery.fooddeliverybackend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;
    
    @Column(name = "customer_id")
    private Integer customerId;
    
    @Column(name = "restaurant_id")
    private Integer restaurantId;
    
    @Column(name = "total_amount")
    private Double totalAmount;
    
    private String status;
    
    @Column(name = "order_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date orderTime;
    
    @Column(name = "delivery_address")
    private String deliveryAddress;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "estimated_delivery_time")
    private String estimatedDeliveryTime;

    // Getters and Setters
    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    
    public Integer getCustomerId() { return customerId; }
    public void setCustomerId(Integer customerId) { this.customerId = customerId; }
    
    public Integer getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Integer restaurantId) { this.restaurantId = restaurantId; }
    
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Date getOrderTime() { return orderTime; }
    public void setOrderTime(Date orderTime) { this.orderTime = orderTime; }
    
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }
}