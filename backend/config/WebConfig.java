package com.fooddelivery.fooddeliverybackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path to static images folder
        String imagePath = new File("src/main/resources/static/images/").getAbsolutePath() + "/";
        
        // Serve images from the static folder
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + imagePath, "classpath:/static/images/")
                .setCachePeriod(3600);
        
        // Also serve uploads folder if needed
        String uploadPath = new File("uploads/").getAbsolutePath() + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath)
                .setCachePeriod(3600);
        
        System.out.println("Images served from: " + imagePath);
        System.out.println("Uploads served from: " + uploadPath);
    }
}