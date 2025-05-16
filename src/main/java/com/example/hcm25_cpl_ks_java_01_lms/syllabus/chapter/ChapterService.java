package com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.SyllabusRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChapterService {
    private final ChapterRepository chapterRepository;

    private final SyllabusRepository syllabusRepository;

    public ChapterService(ChapterRepository chapterRepository, SyllabusRepository syllabusRepository) {
        this.chapterRepository = chapterRepository;
        this.syllabusRepository = syllabusRepository;
    }

    // Lấy tất cả Chapters
    public List<Chapter> getAllChapters() {
        return chapterRepository.findAll();
    }

    // Tìm Chapter theo ID
    public Optional<Chapter> getChapterById(Long id) {
        return chapterRepository.findById(id);
    }

    // Lưu Chapter mới hoặc cập nhật Chapter cũ
    public Chapter saveChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }

    // Xóa Chapter theo ID
    public void deleteChapter(Long id) {
        chapterRepository.deleteById(id);
    }

    // Lấy tất cả Chapters theo Syllabus
    public List<Chapter> getChaptersBySyllabus(Syllabus syllabus) {
        return chapterRepository.findBySyllabus(syllabus);
    }

    //Lấy số lượng chapter dựa trên Syllabus
    public int getChapterCountBySyllabus(Syllabus syllabus) {
        List<Chapter> chapters = chapterRepository.findBySyllabus(syllabus);
        return chapters.size();
    }

    @Transactional
    public void saveChapters(Long syllabusId, List<ChapterDTO> chapterDTOs) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new IllegalArgumentException("Syllabus not found"));

        // Map incoming DTOs by ID for easy lookup
        Map<Long, ChapterDTO> dtoMap = chapterDTOs.stream()
                .filter(dto -> dto.getId() != null)
                .collect(Collectors.toMap(ChapterDTO::getId, dto -> dto));

        List<Chapter> existingChapters = chapterRepository.findBySyllabus(syllabus);
        List<Chapter> resultChapters = new ArrayList<>();

        // Cập nhật các chương đã tồn tại
        for (Chapter chapter : existingChapters) {
            if (dtoMap.containsKey(chapter.getId())) {
                ChapterDTO dto = dtoMap.get(chapter.getId());
                chapter.setName(dto.getName());
                chapter.setDescription(dto.getDescription());
                resultChapters.add(chapter);
            } else {
                // Không có trong danh sách mới, sẽ bị xóa
                chapterRepository.delete(chapter);
            }
        }

        // Thêm mới các chương không có ID
        chapterDTOs.stream()
                .filter(dto -> dto.getId() == null)
                .forEach(dto -> {
                    Chapter newChapter = Chapter.builder()
                            .name(dto.getName())
                            .description(dto.getDescription())
                            .syllabus(syllabus)
                            .build();
                    resultChapters.add(newChapter);
                });

        // Lưu tất cả chương được giữ lại và thêm mới
        chapterRepository.saveAll(resultChapters);

//        // Cập nhật lại numChapter
//        System.out.println("Number chapter: " + resultChapters.size());
//        syllabus.setNumChapter(resultChapters.size());
//        syllabusRepository.save(syllabus);
    }



}
