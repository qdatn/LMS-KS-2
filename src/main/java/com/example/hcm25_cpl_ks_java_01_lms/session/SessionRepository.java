package com.example.hcm25_cpl_ks_java_01_lms.session;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Page<Session> findByNameContainingIgnoreCase(String searchTerm, Pageable pageable);

    Page<Session> findByCourseId(Long courseId, Pageable pageable);

    List<Session> findByCourseId(Long courseId);

    Optional<Integer> findMaxOrderNumberByCourseId(Long courseId);

    @Transactional
    void deleteByCourse(Course course);

    // Lấy danh sách sessions theo courseId, sắp xếp theo orderNumber tăng dần
    List<Session> findByCourseIdOrderByOrderNumberAsc(Long courseId);

    // Tìm kiếm sessions theo courseId và searchTerm, sắp xếp theo orderNumber
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId AND LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY s.orderNumber ASC")
    List<Session> searchSessions(@Param("courseId") Long courseId, @Param("searchTerm") String searchTerm);

}