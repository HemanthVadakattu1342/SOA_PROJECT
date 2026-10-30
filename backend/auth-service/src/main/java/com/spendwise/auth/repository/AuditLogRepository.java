package com.spendwise.auth.repository;

import com.spendwise.auth.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Get audit logs for a specific user
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    // Get all audit logs with pagination (for admin view)
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    // Search by action type
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
}
