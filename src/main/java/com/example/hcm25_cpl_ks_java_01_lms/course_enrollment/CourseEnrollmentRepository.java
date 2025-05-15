package com.example.hcm25_cpl_ks_java_01_lms.course_enrollment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByCourseId(Long courseId);
    List<CourseEnrollment> findByUserId(Long userId);

    Page<CourseEnrollment> findByCourseNameContaining(String courseName, PageRequest pageRequest);

    List<CourseEnrollment>  findByCourse_Id(Long courseId);

    boolean existsByCourseIdAndUserId(Long courseId, Long userId);
}