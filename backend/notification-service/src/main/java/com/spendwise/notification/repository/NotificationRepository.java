package com.spendwise.notification.repository;

import com.spendwise.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification>  findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification>  findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);
    long                countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    void markAllReadForUser(Long userId);
}
