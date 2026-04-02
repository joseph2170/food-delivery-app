package com.fooddelivery.fooddeliverybackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/check")
public class TestController {

    @GetMapping("/paths")
    public Map<String, Object> checkPaths() {
        Map<String, Object> result = new HashMap<>();
        
        // Check uploads folder
        File uploadsDir = new File("uploads");
        result.put("uploads_exists", uploadsDir.exists());
        result.put("uploads_path", uploadsDir.getAbsolutePath());
        
        if (uploadsDir.exists()) {
            String[] files = uploadsDir.list();
            result.put("uploads_files", files != null ? files.length : 0);
            if (files != null && files.length > 0) {
                result.put("sample_files", files);
            }
        }
        
        // Check images folder
        File imagesDir = new File("src/main/resources/static/images");
        result.put("images_exists", imagesDir.exists());
        result.put("images_path", imagesDir.getAbsolutePath());
        
        if (imagesDir.exists()) {
            String[] files = imagesDir.list();
            result.put("images_files", files != null ? files.length : 0);
        }
        
        return result;
    }
}