package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    // Lấy tất cả các section theo chapterId
    public List<Section> getSectionsByChapterId(Long chapterId) {
        return sectionRepository.findByChapterId(chapterId);
    }

    // Lưu danh sách các section
    public void saveSections(List<Section> sections) {
        sectionRepository.saveAll(sections);
    }

    // Xóa một section
    public void deleteSection(Long sectionId) {
        sectionRepository.deleteById(sectionId);
    }
}
