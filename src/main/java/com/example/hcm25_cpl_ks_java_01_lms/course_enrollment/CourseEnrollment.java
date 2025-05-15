package com.example.hcm25_cpl_ks_java_01_lms.course_enrollment;
import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", referencedColumnName = "id")
    private Course course;

    @Column(nullable = false)
    private LocalDateTime enrollmentDate;

    @Override
    public String toString() {
        return "CourseEnrollment{" +
                "user=" + user.getUsername() +
                ", course=" + course.getName() +
                ", enrollmentDate=" + enrollmentDate +
                '}';
    }
}