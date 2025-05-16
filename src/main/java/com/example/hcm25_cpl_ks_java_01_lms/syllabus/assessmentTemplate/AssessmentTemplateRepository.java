package com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate;

import com.example.hcm25_cpl_ks_java_01_lms.assessmentType.AssessmentType;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentTemplateRepository extends JpaRepository<AssessmentTemplate, Long>{
    List<AssessmentTemplate> findAll();

    List<AssessmentTemplate> findBySyllabus(Syllabus syllabus);
    List<AssessmentTemplate> findByType(AssessmentType type);

    void deleteBySyllabusId(Long syllabusId);
}
