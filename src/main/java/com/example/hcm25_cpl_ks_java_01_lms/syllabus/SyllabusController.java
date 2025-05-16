package com.example.hcm25_cpl_ks_java_01_lms.syllabus;

import com.example.hcm25_cpl_ks_java_01_lms.assessmentType.AssessmentType;
import com.example.hcm25_cpl_ks_java_01_lms.assessmentType.AssessmentTypeController;
import com.example.hcm25_cpl_ks_java_01_lms.assessmentType.AssessmentTypeService;
import com.example.hcm25_cpl_ks_java_01_lms.common.Constants;
import com.example.hcm25_cpl_ks_java_01_lms.role.Role;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.SyllabusService;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate.AssessmentTemplate;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.assessmentTemplate.AssessmentTemplateService;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.Chapter;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.ChapterService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import java.util.Map;


@Controller
@RequestMapping("/syllabuses")
@PreAuthorize("@customSecurityService.hasRoleForModule(authentication, 'Syllabus')")
public class SyllabusController {

    private final SyllabusService syllabusService;

    private final AssessmentTemplateService assessmentTemplateService;

    private final AssessmentTypeService assessmentTypeService;

    private final ChapterService chapterService;

    public SyllabusController(SyllabusService syllabusService, AssessmentTemplateService assessmentTemplateService, AssessmentTypeService assessmentTypeService, ChapterService chapterService) {
        this.syllabusService = syllabusService;
        this.assessmentTemplateService = assessmentTemplateService;
        this.assessmentTypeService = assessmentTypeService;
        this.chapterService = chapterService;
    }

//    @GetMapping
//    public String listSyllabus(Model model) {
//        List<Syllabus> syllabusList = syllabusService.getAllSyllabus();
//        model.addAttribute("syllabusList", syllabusList);
//        return "syllabus/list";
//    }

    @GetMapping
    public String listSyllabus(Model model,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "5") int size,
                               @RequestParam(required = false) String searchTerm) {

        Page<Syllabus> syllabuses = syllabusService.findAllSyllabus(searchTerm, page, size);
        model.addAttribute("syllabuses", syllabuses);
        model.addAttribute("searchTerm", searchTerm);
        model.addAttribute("content", "syllabuses/list");
        return Constants.LAYOUT;
    }


    @GetMapping("/create")
    public String createSyllabusForm(Model model) {
        model.addAttribute("syllabus", new Syllabus());
        model.addAttribute("content", "syllabuses/create");
        return Constants.LAYOUT;
    }

    @PostMapping
    public String saveSyllabus(@ModelAttribute Syllabus syllabus) {
        syllabus.setCreatedDate(LocalDateTime.now());
        syllabusService.saveSyllabus(syllabus);
        return "redirect:/syllabuses";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        Optional<Syllabus> syllabus = syllabusService.getSyllabusById(id);
        List<AssessmentType> assessmentTypes = assessmentTypeService.getAllAssessmentTypes(); // Lấy danh sách AssessmentType

        List<AssessmentTemplate> assessmentTemplateList = assessmentTemplateService.getAssessmentTemplatesBySyllabus(syllabus.get());

        if (syllabus.isPresent()) {
            model.addAttribute("syllabus", syllabus.get());
            model.addAttribute("assessmentTemplates", assessmentTemplateList);
            model.addAttribute("assessmentTypes", assessmentTypes); // Thêm vào model
            model.addAttribute("activeTab", "syllabus"); // Đánh dấu tab đang mở
            model.addAttribute("content", "syllabuses/edit");
            return Constants.LAYOUT;
        }
        else {
            return "redirect:/syllabuses";
        }
    }

    @PostMapping("/edit/{id}")
    public String updateSyllabus(@PathVariable Long id, @ModelAttribute Syllabus syllabusDetails, Model model) {
        try {
//            System.out.println("Syllabus ID: " + id);
//            System.out.println("Syllabus Name: " + syllabusDetails.getName());
//            System.out.println("Assessment Templates: " + syllabusDetails.getAssessmentTemplates());

            syllabusDetails.setId(id);

            // Đảm bảo mỗi AssessmentTemplate có syllabus_id trước khi lưu
            if (syllabusDetails.getAssessmentTemplates() != null) {
                for (AssessmentTemplate at : syllabusDetails.getAssessmentTemplates()) {
                    if (at.getSyllabus() == null) {
                        at.setSyllabus(syllabusDetails); // Gán syllabus cho từng AssessmentTemplate
                    }
//                    System.out.println("AssessmentTemplate ID: " + at.getId() + ", Name: " + at.getName() + ", Syllabus ID: " + at.getSyllabus().getId());
                }
            }

            syllabusService.updateSyllabus(syllabusDetails);
            return "redirect:/syllabuses";
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi chi tiết ra console
            model.addAttribute("error", e.getMessage());
            model.addAttribute("syllabus", syllabusDetails);
            model.addAttribute("content", "syllabuses/edit");
            return Constants.LAYOUT;
        }
    }


    @PostMapping("/delete/{id}")
    public String deleteSyllabus(@PathVariable Long id) {
        syllabusService.deleteSyllabus(id);
        return "redirect:/syllabuses";
    }

    @GetMapping("/detail/{id}")
    public String showDetailForm(@PathVariable Long id, Model model) {
        Optional<Syllabus> syllabus = syllabusService.getSyllabusById(id);
        List<AssessmentType> assessmentTypes = assessmentTypeService.getAllAssessmentTypes(); // Lấy danh sách AssessmentType

        List<AssessmentTemplate> assessmentTemplateList = assessmentTemplateService.getAssessmentTemplatesBySyllabus(syllabus.get());
        System.out.println("---------------------------AssessmentType : "+ assessmentTypes);
        for (AssessmentType type : assessmentTypes) {
            System.out.println("ID: " + type.getId() + ", Name: " + type.getName());
        }
        if (syllabus.isPresent()) {
            model.addAttribute("syllabus", syllabus.get());
            model.addAttribute("assessmentTemplates", assessmentTemplateList);
            model.addAttribute("assessmentTypes", assessmentTypes); // Thêm vào model
            model.addAttribute("content", "syllabuses/detail");
            return Constants.LAYOUT;
        }
        else {
            return "redirect:/syllabuses";
        }
    }

    @GetMapping("/chapters/{syllabusId}")
    public String manageChapters(@PathVariable Long syllabusId, Model model, RedirectAttributes redirectAttributes) {
        Optional<Syllabus> syllabusOpt = syllabusService.getSyllabusById(syllabusId);

        if (syllabusOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Syllabus not found!");
            return "redirect:/syllabuses"; // Điều hướng về trang syllabus nếu không tìm thấy
        }

        Syllabus syllabus = syllabusOpt.get();
        List<Chapter> chapterList = chapterService.getChaptersBySyllabus(syllabus);

        model.addAttribute("syllabus", syllabus); // Thêm syllabus vào model
        model.addAttribute("chapters", chapterList);
        model.addAttribute("activeTab", "chapters"); // Đánh dấu tab đang mở
        model.addAttribute("content", "syllabuses/chapter");

        return Constants.LAYOUT;
    }


}

