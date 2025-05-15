package com.example.hcm25_cpl_ks_java_01_lms.material;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {

    List<CourseMaterial> findByCourseId(Long courseId);

    List<CourseMaterial> findBySessionId(Long sessionId);

    List<CourseMaterial> findByType(CourseMaterial.MaterialType type);

    Page<CourseMaterial> findByNameContainingIgnoreCase(String searchTerm, Pageable pageable);

    Page<CourseMaterial> findBySessionId(Long sessionId, Pageable pageable);

    Page<CourseMaterial> findBySessionIdAndNameContainingIgnoreCase(Long sessionId, String searchTerm, Pageable pageable);

    Page<CourseMaterial> findByCourseId(Long courseId, Pageable pageable);

    Page<CourseMaterial> findByCourseIdAndNameContainingIgnoreCase(Long courseId, String searchTerm, Pageable pageable);

    @Query("SELECT m FROM CourseMaterial m WHERE " +
            "(:name IS NULL OR m.name LIKE %:name%) AND " +
            "(:sessionId IS NULL OR m.session.id = :sessionId) AND " +
            "(:type IS NULL OR m.type = :type) AND " +
            "(:minTime IS NULL OR m.estimatedTimeInMinutes >= :minTime) AND " +
            "(:courseId IS NULL OR m.course.id = :courseId)")
    Page<CourseMaterial> searchMaterials(
            @Param("name") String name,
            @Param("sessionId") Long sessionId,
            @Param("type") CourseMaterial.MaterialType type,
            @Param("minTime") Integer minTime,
            @Param("courseId") Long courseId,
            Pageable pageable);
}