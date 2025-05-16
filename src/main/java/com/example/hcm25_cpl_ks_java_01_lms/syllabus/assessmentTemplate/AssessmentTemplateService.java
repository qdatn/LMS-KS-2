package com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate;

import com.example.hcm25_cpl_ks_java_01_lms.assessmentType.AssessmentType;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssessmentTemplateService {
    private final AssessmentTemplateRepository assessmentTemplateRepository;

    public AssessmentTemplateService(AssessmentTemplateRepository assessmentTemplateRepository) {
        this.assessmentTemplateRepository = assessmentTemplateRepository;
    }

    // Lấy tất cả AssessmentTemplate
    public List<AssessmentTemplate> getAllAssessmentTemplates() {
        return assessmentTemplateRepository.findAll();
    }

    // Tìm AssessmentTemplate theo ID
    public Optional<AssessmentTemplate> getAssessmentTemplateById(Long id) {
        return assessmentTemplateRepository.findById(id);
    }

    // Lưu AssessmentTemplate mới hoặc cập nhật AssessmentTemplate cũ
    public AssessmentTemplate saveAssessmentTemplate(AssessmentTemplate assessmentTemplate) {
        return assessmentTemplateRepository.save(assessmentTemplate);
    }

    // Xóa AssessmentTemplate theo ID
    public void deleteAssessmentTemplate(Long id) {
        assessmentTemplateRepository.deleteById(id);
    }

    // Lấy tất cả các AssessmentTemplate theo Syllabus
    public List<AssessmentTemplate> getAssessmentTemplatesBySyllabus(Syllabus syllabus) {
        return assessmentTemplateRepository.findBySyllabus(syllabus);
    }

    // Lấy tất cả các AssessmentTemplate theo AssessmentType
    public List<AssessmentTemplate> getAssessmentTemplatesByType(AssessmentType type) {
        return assessmentTemplateRepository.findByType(type);
    }
}
