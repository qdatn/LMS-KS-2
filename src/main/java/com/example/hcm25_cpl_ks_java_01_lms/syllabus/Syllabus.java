package com.example.hcm25_cpl_ks_java_01_lms.syllabus;

import com.example.hcm25_cpl_ks_java_01_lms.course.course_syllabus.CourseSyllabus;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate.AssessmentTemplate;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String syllabusCode;

    private String description;

    private boolean approved;

    private double minMark;

    private boolean active;

    private LocalDateTime createdDate;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<AssessmentTemplate> assessmentTemplates;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseSyllabus> courseSyllabuses;

}

