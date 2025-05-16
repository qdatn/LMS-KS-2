package com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findAll();

    List<Chapter> findBySyllabus(Syllabus syllabus);

    void deleteBySyllabusId(Long syllabusId);
}

