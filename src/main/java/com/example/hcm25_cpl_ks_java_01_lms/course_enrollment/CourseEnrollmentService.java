package com.example.hcm25_cpl_ks_java_01_lms.course_enrollment;
import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseRepository;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import com.example.hcm25_cpl_ks_java_01_lms.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Autowired
    public CourseEnrollmentService(CourseEnrollmentRepository courseEnrollmentRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public void enrollStudents(Long courseId, List<Long> studentIds) {
        for (Long studentId : studentIds) {
            if (courseEnrollmentRepository.existsByCourseIdAndUserId(courseId, studentId)) {
                continue;
            }
            CourseEnrollment courseEnrollment = new CourseEnrollment();
            Optional<Course> course = courseRepository.findById(courseId);
            Optional<User> student = userRepository.findById(studentId);

            if (course.isPresent() && student.isPresent()) {
                courseEnrollment.setCourse(course.get());
                courseEnrollment.setUser(student.get());
                courseEnrollment.setEnrollmentDate(LocalDateTime.now());
                courseEnrollmentRepository.save(courseEnrollment);
            }
        }
    }

    public Page<CourseEnrollment> getAllEnrollments(String searchTerm, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);

        if (searchTerm != null && !searchTerm.isEmpty()) {
            return courseEnrollmentRepository.findByCourseNameContaining(searchTerm, pageRequest);
        }

        return courseEnrollmentRepository.findAll(pageRequest);
    }

    public List<CourseEnrollment> getEnrollmentsByCourse(Long courseId) {
        return courseEnrollmentRepository.findByCourseId(courseId);
    }

    public List<CourseEnrollment> getEnrollmentsByUser(Long userId) {
        return courseEnrollmentRepository.findByUserId(userId);
    }

    public List<User> findAllRecipientsByCourseId(Long courseId) {
        return courseEnrollmentRepository.findByCourseId(courseId)
                .stream()
                .map(CourseEnrollment::getUser)
                .toList();
    }
    public void deleteCourseEnrollment(Long id) {
        if (!courseEnrollmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Course enrollment with ID " + id + " not found.");
        }
        courseEnrollmentRepository.deleteById(id);
    }

    public void deleteCourseEnrollments(List<Long> enrollmentIds) {
        for (Long id : enrollmentIds) {
            if (courseEnrollmentRepository.existsById(id)) {
                courseEnrollmentRepository.deleteById(id);
            }
        }
    }

    public List<User> findUsersByCourse(Long courseId) {
        return courseEnrollmentRepository.findByCourse_Id(courseId)
                .stream()
                .map(CourseEnrollment::getUser)
                .toList();
    }
    public boolean isAnyStudentEnrolled(Long courseId, List<User> students) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourseId(courseId);
        for (CourseEnrollment ce : enrollments) {
            if (students.contains(ce.getUser())) return true;
        }
        return false;
    }
}
