package com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate;

import com.example.hcm25_cpl_ks_java_01_lms.assessmentType.AssessmentType;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class AssessmentTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Tên của Assessment (Quiz, Final Practice Test...)

    @Column(nullable = false)
    private int quantity; // Số lượng

    @Column(nullable = false)
    private int weight; // Trọng số

    @ManyToOne
    @JoinColumn(name = "type_id", nullable = true)
    private AssessmentType type; // Tham chiếu đến AssessmentType

    @Column
    private String note; // Ghi chú (nếu có)

    @ManyToOne
    @JoinColumn(name = "syllabus_id", nullable = false)
    @JsonBackReference
    private Syllabus syllabus;
}
