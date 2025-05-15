package com.example.hcm25_cpl_ks_java_01_lms.student_learning;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.student.Student;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentLearningRepository extends JpaRepository<EnrolledCourse, Long> {
    Optional<EnrolledCourse> findByStudentIdAndCourseId(Long studentId, Long courseId);

    List<EnrolledCourse> findByStudentId(Long studentId);

    List<EnrolledCourse> findTop5ByStudentIdAndLastAccessedIsNotNullOrderByLastAccessedDesc(Long studentId);
    Optional<EnrolledCourse> findByStudentAndCourse(User student, Course course);
}
