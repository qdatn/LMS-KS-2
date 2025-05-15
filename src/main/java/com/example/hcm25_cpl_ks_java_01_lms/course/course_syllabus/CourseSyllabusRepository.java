package com.example.hcm25_cpl_ks_java_01_lms.course.course_syllabus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseSyllabusRepository extends JpaRepository<CourseSyllabus, Long> {
    List<CourseSyllabus> findBySyllabusIdIn(List<Long> syllabusIds);
}
