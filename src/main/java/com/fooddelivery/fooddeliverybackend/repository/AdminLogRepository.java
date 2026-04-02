package com.fooddelivery.fooddeliverybackend.repository;

import com.fooddelivery.fooddeliverybackend.model.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    List<AdminLog> findAllByOrderByCreatedAtDesc();
    List<AdminLog> findByAdminIdOrderByCreatedAtDesc(Long adminId);
}