package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO;

import com.example.hcm25_cpl_ks_java_01_lms.delivery_type.DeliveryType;
import lombok.Data;

@Data
public class SectionDetailForm {
    private Long id; // detail id
    private String detailTopic;
    private String learningObjective;
    private DeliveryType deliveryType;
    private Integer duration;
    private String trainingFormat;
    private String notes;
}
