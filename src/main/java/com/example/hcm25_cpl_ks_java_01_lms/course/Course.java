package com.example.hcm25_cpl_ks_java_01_lms.course;

import com.example.hcm25_cpl_ks_java_01_lms.assessment.Assessment;
import com.example.hcm25_cpl_ks_java_01_lms.material.CourseMaterial;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import com.example.hcm25_cpl_ks_java_01_lms.tag.Tag;
import com.example.hcm25_cpl_ks_java_01_lms.topic.Topic;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;


import java.util.List;

@Setter
@Getter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Course name is required")
    private String name;
    @NotBlank(message = "Course code is required")
    private String code;

    @Lob
    @NotNull(message = "Description cannot be empty")
    private String description;  // Rich text field equivalent in Spring Boot

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = true)
    private User creator;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = true)
    private User instructor;

    private boolean published;

    @ManyToMany
    @JoinTable(
            name = "course_prerequisites",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "prerequisite_id")
    )
    private List<Course> prerequisites;

    @ManyToMany
    @JoinTable(
            name = "course_tags",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags;

    private String image;

    @NotNull(message = "Price must be provided")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private float price;
    @Min(value = 0, message = "Discount must be at least 0%")
    @Max(value = 100, message = "Discount cannot exceed 100%")
    private float discount;

    @Min(value = 1, message = "Duration must be at least 1 week")
    private int durationInWeeks; // Added field for course duration

    @NotBlank(message = "Language is required")
    private String language; // Added field for course language
    @NotBlank(message = "Level is required")
    private String level; // Added field for course level (e.g., Beginner, Intermediate, Advanced)

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Session> sessions;

    public float getDiscountedPrice() {
        return price * (1 - discount / 100);
    }

    @Override
    public String toString() {
        return name;
    }

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assessment> assessments;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Topic> topics; // Danh sách các Topic thuộc về Course này

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseMaterial> courseMaterials;
}
