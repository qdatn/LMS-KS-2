package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO.SectionFormData;
import lombok.Data;
import java.util.List;

@Data
public class SectionFormWrapper {
    private List<SectionFormData> sections;
}