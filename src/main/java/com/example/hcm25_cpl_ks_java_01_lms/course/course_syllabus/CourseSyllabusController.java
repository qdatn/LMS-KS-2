package com.example.hcm25_cpl_ks_java_01_lms.course.course_syllabus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-syllabuses")
public class CourseSyllabusController {

    @Autowired
    private CourseSyllabusService service;

    @GetMapping
    public List<CourseSyllabus> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseSyllabus> getById(@PathVariable Long id) {
        CourseSyllabus cs = service.getById(id);
        return cs != null ? ResponseEntity.ok(cs) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public CourseSyllabus create(@RequestBody CourseSyllabus courseSyllabus) {
        return service.create(courseSyllabus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseSyllabus> update(@PathVariable Long id, @RequestBody CourseSyllabus updated) {
        CourseSyllabus cs = service.update(id, updated);
        return cs != null ? ResponseEntity.ok(cs) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
