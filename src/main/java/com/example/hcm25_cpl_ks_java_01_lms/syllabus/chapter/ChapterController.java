package com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/chapters")
@PreAuthorize("@customSecurityService.hasRoleForModule(authentication, 'Syllabus')")
public class ChapterController {

    @Autowired
    private ChapterService chapterService;

    @PostMapping("/save-all")
    public ResponseEntity<?> saveAllChapters(@RequestParam Long syllabusId,
                                             @RequestBody List<ChapterDTO> chapters) {
        try {
            chapterService.saveChapters(syllabusId, chapters);
            return ResponseEntity.ok("Chapters saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save chapters: " + e.getMessage());
        }
    }
    @PostMapping("/delete/{id}")
    public String deleteChapter(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            System.out.println("Deleted chapter id: " + id);
            Chapter chapter = chapterService.getChapterById(id).get(); // Lấy chapter trước khi xóa
            Long syllabusId = chapter.getSyllabus().getId();

            chapterService.deleteChapter(id); // Gọi service để xóa
            redirectAttributes.addFlashAttribute("success", "Chapter deleted successfully!");
            return "redirect:/syllabuses/chapters/" + syllabusId;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete chapter.");
            return "redirect:/syllabuses"; // fallback nếu lỗi
        }
    }


}
