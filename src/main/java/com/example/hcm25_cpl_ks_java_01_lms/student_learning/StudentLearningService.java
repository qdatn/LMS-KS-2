package com.example.hcm25_cpl_ks_java_01_lms.student_learning;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseRepository;
import com.example.hcm25_cpl_ks_java_01_lms.student.Student;
import com.example.hcm25_cpl_ks_java_01_lms.student.StudentRepository;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import com.example.hcm25_cpl_ks_java_01_lms.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentLearningService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentLearningRepository enrolledCourseRepository;

    public void updateLastAccessed(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));

        EnrolledCourse enrolledCourse = enrolledCourseRepository
                .findByStudentAndCourse(student, course)
                .orElseGet(() -> EnrolledCourse.builder()
                        .student(student)
                        .course(course)
                        .enrolledAt(LocalDateTime.now()) // hoặc bạn có thể để null nếu chưa cần
                        .build());

        enrolledCourse.setLastAccessed(LocalDateTime.now());
        enrolledCourseRepository.save(enrolledCourse);
    }

    public List<Course> getRecentlyAccessedCourses(Long studentId) {
        return enrolledCourseRepository.findTop5ByStudentIdAndLastAccessedIsNotNullOrderByLastAccessedDesc(studentId)
                .stream()
                .map(EnrolledCourse::getCourse)
                .toList();
    }

    public List<Course> getEnrolledCourses(Long studentId) {
        return enrolledCourseRepository.findByStudentId(studentId)
                .stream()
                .map(EnrolledCourse::getCourse)
                .toList();
    }
}
