package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO.SectionDetailForm;
import lombok.Data;
import java.util.List;

@Data
public class SectionFormData {
    private Long id; // section id
    private String title;
    private List<SectionDetailForm> details;
}
