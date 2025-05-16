package com.example.hcm25_cpl_ks_java_01_lms.syllabus;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Page<Syllabus> findAll(Pageable pageable);

    Page<Syllabus> findByNameContainingIgnoreCase(String name, Pageable pageable);
}

