package com.example.hcm25_cpl_ks_java_01_lms.syllabus.sectionDetail;

import com.example.hcm25_cpl_ks_java_01_lms.delivery_type.DeliveryType;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.Section;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "section_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SectionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String detailTopic;

    @Column(name = "learning_objective", length = 1000)
    private String learningObjective;

    @Column(name = "output_standard", length = 1000)
    private String outputStandard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_type_id") // Đây là tên cột FK trong DB
    private DeliveryType deliveryType;


    @Column(nullable = true)
    private Integer duration;

    @Column(name = "training_format", length = 100)
    private String trainingFormat;

    @Column(length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;
}
