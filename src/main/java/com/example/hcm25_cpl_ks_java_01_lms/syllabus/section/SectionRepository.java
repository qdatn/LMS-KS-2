package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findAll();

    List<Section> findByChapterId(Long chapterId);
}
