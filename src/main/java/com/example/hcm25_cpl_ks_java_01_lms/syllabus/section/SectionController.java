package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section;

import com.example.hcm25_cpl_ks_java_01_lms.assessment.AssessmentRepository;
import com.example.hcm25_cpl_ks_java_01_lms.common.Constants;
import com.example.hcm25_cpl_ks_java_01_lms.delivery_type.DeliveryType;
import com.example.hcm25_cpl_ks_java_01_lms.delivery_type.DeliveryTypeService;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.Chapter;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.ChapterRepository;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.ChapterService;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO.SectionDetailForm;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO.SectionFormData;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.sectionDTO.SectionFormWrapper;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.sectionDetail.SectionDetail;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.sectionDetail.SectionDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @Autowired
    private ChapterService chapterService;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private DeliveryTypeService deliveryTypeService;

    @Autowired
    private SectionDetailRepository sectionDetailRepository;

    // Phương thức để hiển thị danh sách các section theo chapterId
    @GetMapping("/chapter/{chapterId}")
    public String getSectionsByChapter(@PathVariable("chapterId") Long chapterId, Model model) {
        List<Section> sections = sectionService.getSectionsByChapterId(chapterId);

        Chapter chapter = chapterService.getChapterById(chapterId).get();
        Syllabus syllabus = chapter.getSyllabus();

        List<DeliveryType> deliveryTypeList = deliveryTypeService.findAll();
        System.out.println("Delivery Type List: " + deliveryTypeList);

        model.addAttribute("deliveryTypes", deliveryTypeList);
        model.addAttribute("sections", sections);
        model.addAttribute("syllabus", syllabus);
        model.addAttribute("chapterId", chapterId);
        model.addAttribute("content", "syllabuses/section");
        return Constants.LAYOUT;
    }

    @PostMapping("/save")
    public String saveSections(
            @RequestParam Long chapterId,
            @ModelAttribute SectionFormWrapper wrapper,
            RedirectAttributes redirectAttributes) {

        System.out.println("Chapter id: " + chapterId);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found"));

        // Lấy tất cả section hiện có trong DB
        List<Section> existingSections = sectionRepository.findByChapterId(chapterId);

        // Tập hợp ID từ form để so sánh
        Set<Long> formSectionIds = wrapper.getSections().stream()
                .filter(s -> s.getId() != null)
                .map(SectionFormData::getId)
                .collect(Collectors.toSet());

        Set<Long> formSectionDetailIds = wrapper.getSections().stream()
                .flatMap(s -> s.getDetails().stream())
                .filter(d -> d.getId() != null)
                .map(SectionDetailForm::getId)
                .collect(Collectors.toSet());

        // Xoá các SectionDetail không còn trong form
        for (Section section : existingSections) {
            for (SectionDetail detail : section.getSectionDetails()) {
                if (detail.getId() != null && !formSectionDetailIds.contains(detail.getId())) {
                    sectionDetailRepository.deleteById(detail.getId());
                }
            }
        }

        // Xoá các Section không còn trong form
        for (Section section : existingSections) {
            if (section.getId() != null && !formSectionIds.contains(section.getId())) {
                sectionRepository.deleteById(section.getId());
            }
        }

        // Lưu các section và sectionDetail từ form
        for (SectionFormData sectionData : wrapper.getSections()) {
            Section section;
            if (sectionData.getId() != null) {
                section = sectionRepository.findById(sectionData.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Section not found"));
                section.setTitle(sectionData.getTitle());
                // update other fields
            } else {
                section = Section.builder()
                        .title(sectionData.getTitle())
                        .content("")
                        .chapter(chapter)
                        .build();
            }

            List<SectionDetail> details = new ArrayList<>();
            for (SectionDetailForm detailForm : sectionData.getDetails()) {
                SectionDetail detail;

                if (detailForm.getId() != null) {
                    detail = sectionDetailRepository.findById(detailForm.getId())
                            .orElseThrow(() -> new IllegalArgumentException("Detail not found"));
                } else {
                    detail = new SectionDetail();
                    detail.setSection(section);
                }

                detail.setDetailTopic(detailForm.getDetailTopic());
                detail.setLearningObjective(detailForm.getLearningObjective());
                detail.setDeliveryType(detailForm.getDeliveryType());
                detail.setDuration(detailForm.getDuration());
                detail.setTrainingFormat(detailForm.getTrainingFormat());
                detail.setNotes(detailForm.getNotes());

                details.add(detail);
            }

            List<SectionDetail> existingDetails = section.getSectionDetails();
            if (existingDetails == null) {
                existingDetails = new ArrayList<>();
                section.setSectionDetails(existingDetails); // Đừng quên set lại nếu dùng setter
            }
            existingDetails.clear();
            existingDetails.addAll(details);

            sectionRepository.save(section); // sectionDetails sẽ được cascade nếu đã cấu hình đúng
        }

        redirectAttributes.addFlashAttribute("message", "Sections saved!");
        return "redirect:/sections/chapter/" + chapterId;
    }


    // Phương thức để xóa một section
    @PostMapping("/delete/{id}")
    public String deleteSection(@PathVariable("id") Long sectionId) {
        sectionService.deleteSection(sectionId);
        return "redirect:/syllabuses/edit/chapter";  // Redirect lại về trang danh sách chapter
    }
}

