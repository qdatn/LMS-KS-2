package com.example.hcm25_cpl_ks_java_01_lms.syllabus;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate.AssessmentTemplate;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate.AssessmentTemplateRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SyllabusService {
    private final SyllabusRepository syllabusRepository;

    private final AssessmentTemplateRepository assessmentRepository;

    public SyllabusService(SyllabusRepository syllabusRepository, AssessmentTemplateRepository assessmentRepository) {
        this.syllabusRepository = syllabusRepository;
        this.assessmentRepository = assessmentRepository;
    }


    public Page<Syllabus> findAllSyllabus(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return syllabusRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        }
        return syllabusRepository.findAll(pageable);
    }

    public Page<Syllabus> findByNameContaining(String searchTerm, Pageable pageable) {
        return syllabusRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
    }

    public Syllabus findById(Long id) {
        return syllabusRepository.findById(id).orElse(null);
    }

    public List<Syllabus> getAllSyllabus() {
        return syllabusRepository.findAll();
    }

    public Syllabus saveSyllabus(Syllabus syllabus) {
        return syllabusRepository.save(syllabus);
    }

    public Optional<Syllabus> getSyllabusById(Long id) { return syllabusRepository.findById(id);}

    public void updateSyllabus(Syllabus syllabus) {
        syllabusRepository.save(syllabus);
    }

    public void deleteSyllabus(Long id) {
        syllabusRepository.deleteById(id);
    }

    public void updateAssessments(List<AssessmentTemplate> assessmentTemplates) {
        assessmentRepository.saveAll(assessmentTemplates);
    }

}

