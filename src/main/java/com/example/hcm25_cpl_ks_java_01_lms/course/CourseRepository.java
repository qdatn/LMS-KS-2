package com.example.hcm25_cpl_ks_java_01_lms.course;

import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Page<Course> findByNameContainingIgnoreCase(String searchTerm, Pageable pageable);
    Optional<Course> findByName(String name);
    List<Course> findAllByCodeIn(String[] codes);
    Optional<Course> findByCode(String code);
    List<Course> findByNameContainingIgnoreCase(String name);
    long countByInstructor(User instructor);

    Page<Course> findAll(Pageable pageable);

    boolean existsByCode(String code);

    Page<Course> findByPublished(boolean published, Pageable pageable);

    Page<Course> findByNameContainingIgnoreCaseAndPublished(String name, boolean published, Pageable pageable);

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.topics t LEFT JOIN FETCH t.tags WHERE c.id = :courseId")
    Optional<Course> findByIdWithTopicsAndTags(@Param("courseId") Long courseId);
}
