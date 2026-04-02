package com.fooddelivery.fooddeliverybackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "food_items")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Integer id;

    @Column(name = "restaurant_id")
    private Integer restaurantId;

    private String name;
    private String description;
    private double price;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    private String category;

    // Constructors
    public Food() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Integer restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}