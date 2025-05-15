package com.example.hcm25_cpl_ks_java_01_lms.course_enrollment;

import com.example.hcm25_cpl_ks_java_01_lms.common.Constants;
import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import com.example.hcm25_cpl_ks_java_01_lms.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.*;

@Controller
@RequestMapping("/enrollments")
public class CourseEnrollmentController {
    private final CourseEnrollmentService courseEnrollmentService;
    private final UserService userService;

    @Autowired
    public CourseEnrollmentController(CourseEnrollmentService courseEnrollmentService, UserService userService) {
        this.courseEnrollmentService = courseEnrollmentService;
        this.userService = userService;
    }

    @GetMapping
    public String listCourseEnrollments(Model model,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(required = false) String searchTerm,
                                        @RequestParam(required = false, defaultValue = "false") boolean groupByCourse) {

        if (groupByCourse) {
            List<CourseEnrollment> allEnrollments = courseEnrollmentService.getAllEnrollments(searchTerm, 0, Integer.MAX_VALUE).getContent();
            Map<Course, List<User>> grouped = new LinkedHashMap<>();

            for (CourseEnrollment e : allEnrollments) {
                if (e.getUser() != null && e.getUser().getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase("STUDENT"))) {
                    grouped.computeIfAbsent(e.getCourse(), k -> new ArrayList<>()).add(e.getUser());
                }
            }
            model.addAttribute("groupedEnrollments", grouped);
            model.addAttribute("content", "courseenrollments/grouped");
            return Constants.LAYOUT;
        } else {
            Page<CourseEnrollment> courseEnrollments = courseEnrollmentService.getAllEnrollments(searchTerm, page, size);
            model.addAttribute("courseEnrollments", courseEnrollments);
            model.addAttribute("searchTerm", searchTerm);
            model.addAttribute("content", "courseenrollments/list");
            return Constants.LAYOUT;
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteCourseEnrollment(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        try {
            courseEnrollmentService.deleteCourseEnrollment(id);
            redirectAttributes.addFlashAttribute("success", "Course enrollment deleted successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete course enrollment: " + e.getMessage());
        }
        return "redirect:/enrollments";
    }

    @PostMapping("/delete/bulk")
    public String deleteCourseEnrollments(@RequestParam("enrollmentIds") List<Long> enrollmentIds, RedirectAttributes redirectAttributes) {
        try {
            courseEnrollmentService.deleteCourseEnrollments(enrollmentIds);
            redirectAttributes.addFlashAttribute("success", "Course enrollments deleted successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete course enrollments: " + e.getMessage());
        }
        return "redirect:/enrollments";
    }

    @GetMapping("/export")
    public String exportCourseEnrollments(Model model) {
        model.addAttribute("error", "Export functionality is not yet implemented.");
        return "redirect:/enrollments";
    }
}