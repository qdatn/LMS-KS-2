package com.example.hcm25_cpl_ks_java_01_lms.course.course_syllabus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseSyllabusService {

    @Autowired
    private CourseSyllabusRepository repository;

    public List<CourseSyllabus> getAll() {
        return repository.findAll();
    }

    public CourseSyllabus getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public CourseSyllabus create(CourseSyllabus courseSyllabus) {
        courseSyllabus.setAssignedDate(LocalDateTime.now());
        return repository.save(courseSyllabus);
    }

    public CourseSyllabus update(Long id, CourseSyllabus updated) {
        CourseSyllabus existing = repository.findById(id).orElse(null);
        if (existing != null) {
            existing.setCourse(updated.getCourse());
            existing.setSyllabus(updated.getSyllabus());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}