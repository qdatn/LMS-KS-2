package com.example.hcm25_cpl_ks_java_01_lms.session;

import com.example.hcm25_cpl_ks_java_01_lms.common.Constants;
import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseService;
import com.example.hcm25_cpl_ks_java_01_lms.session.dto.CreateSessionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Controller
@RequestMapping("/courses/edit")
@PreAuthorize("@customSecurityService.hasRoleForModule(authentication, 'Session')")
public class SessionController {
    private final SessionService sessionService;
    private final CourseService courseService;

    @Autowired
    private SessionExcelImporter sessionExcelImporter;

    public SessionController(SessionService sessionService, CourseService courseService) {
        this.sessionService = sessionService;
        this.courseService = courseService;
    }

    @GetMapping
    public String listSessions(Model model,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "5") int size,
                               @RequestParam(required = false) String searchTerm) {
        Page<Session> sessions = sessionService.getAllSessions(searchTerm, page, size);
        model.addAttribute("courseSessions", sessions);
        model.addAttribute("content", "course_sessions/list");
        return Constants.LAYOUT;
    }

    @GetMapping("/new")
    public String showCreateForm(Model model) {
        List<Course> courses = courseService.getAllCourses();
        model.addAttribute("courses", courses);
        model.addAttribute("courseSession", new Session());
        model.addAttribute("content", "course_sessions/create");
        return Constants.LAYOUT;
    }

    @PostMapping
    public String createSession(@ModelAttribute Session session, Model model) {
        try {
            sessionService.createSession(session);
            return "redirect:/sessions";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("courseSession", session);
            model.addAttribute("content", "course_sessions/create");
            return Constants.LAYOUT;
        }
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        List<Course> courses = courseService.getAllCourses();
        Session session = sessionService.getSessionById(id);
        if (session != null) {
            model.addAttribute("courses", courses);
            model.addAttribute("courseSession", session);
            model.addAttribute("content", "course_sessions/update");
            return Constants.LAYOUT;
        }
        return "redirect:/sessions";
    }

    @GetMapping("/sessions")
    public String showSessionList(@RequestParam Long courseId,
                                  @RequestParam(required = false) String searchTerm,
                                  Model model) {
        Course course = courseService.findById(courseId);
        if (course == null) {
            return "redirect:/courses";
        }

        // Gọi service để lấy danh sách sessions theo courseId
        List<Session> sessions = sessionService.getAllSessionsSortByOrderNumber(courseId, searchTerm);

        model.addAttribute("searchTerm", searchTerm);
        model.addAttribute("course", course);
        model.addAttribute("courseSessions", sessions);
        model.addAttribute("content", "courses/editsession");

        return Constants.LAYOUT;
    }

    @GetMapping("/sessions/new")
    public String showAddSessionForm(@RequestParam Long courseId, Model model) {
        Course course = courseService.findById(courseId);
        if (course == null) {
            return "redirect:/courses";
        }
        model.addAttribute("courseSession", new Session());
        model.addAttribute("course", course); // Truyền course vào view
        model.addAttribute("content", "course_sessions/create");
        return Constants.LAYOUT;
    }

    @PostMapping("/sessions/add")
    public String addSession(@RequestParam Long courseId, @ModelAttribute Session session, Model model) {
        try {
            Course course = courseService.findById(courseId);
            if (course == null) {
                return "redirect:/courses";
            }
            session.setCourse(course); // Liên kết session với course
            sessionService.createSession(session);
            return "redirect:/courses/edit/sessions?courseId=" + courseId; // Chuyển hướng về list session của course
        } catch (Exception e) {
            model.addAttribute("error", "Error adding session: " + e.getMessage());
            return "course_sessions/create"; // Trả về form nếu có lỗi
        }
    }

    @PostMapping("/sessions/add-multiple")
    public String addMultipleSessions(@Validated @ModelAttribute CreateSessionDTO sessionRequestDTO,
                                      Model model) {
        try {
            Course course = courseService.findById(sessionRequestDTO.getCourseId());
            if (course == null) {
                return "redirect:/courses/edit/sessions?courseId=" + sessionRequestDTO.getCourseId();
            }

            List<Session> sessions = sessionRequestDTO.getSessions().stream().map(sessionDTO -> {
                Session session = new Session();
                session.setName(sessionDTO.getName());
                session.setOrderNumber(sessionDTO.getOrderNumber().longValue());
                session.setCourse(course);
                return session;
            }).toList();

            sessionService.createSessions(sessions); // Lưu danh sách sessions một lần
            return "redirect:/courses/edit/sessions?courseId=" + sessionRequestDTO.getCourseId();
        } catch (Exception e) {
            model.addAttribute("error", "Error adding sessions: " + e.getMessage());
            return "course_sessions/create";
        }
    }


    @PostMapping("/sessions/update/{id}")
    public String updateSession(@RequestParam Long courseId, @PathVariable Long id, @ModelAttribute Session sessionDetails, Model model) {
//        try {
        if (sessionDetails.getName() == null || sessionDetails.getName().trim().isEmpty()) {
            model.addAttribute("error", "Session name cannot be empty");
            model.addAttribute("courseSession", sessionDetails);
            model.addAttribute("content", "course_sessions/update");
            return Constants.LAYOUT;
        }
//            sessionService.updateSession(sessionDetails);
        // Lấy session hiện tại từ DB
        Session existingSession = sessionService.getSessionById(id);

        if (existingSession == null) {
            return "redirect:/courses/edit/sessions/" + courseId + "/list?error=Session not found";
        }

        // Cập nhật thông tin mới
        existingSession.setName(sessionDetails.getName());
        existingSession.setOrderNumber(sessionDetails.getOrderNumber());

        // Đảm bảo courseId không bị mất
        Course course = courseService.findById(courseId);
        existingSession.setCourse(course);

        sessionService.updateSession(existingSession);
        return "redirect:/courses/edit/sessions?courseId=" + courseId;
    }

    @PostMapping("/sessions/update-all")
    @ResponseBody
    public ResponseEntity<?> updateAllSessions(@RequestParam Long courseId, @RequestBody List<Session> sessions) {
        for (Session session : sessions) {
            Session existingSession = sessionService.getSessionById(session.getId());
            if (existingSession != null) {
                existingSession.setName(session.getName());
                existingSession.setOrderNumber(session.getOrderNumber());
                sessionService.updateSession(existingSession);
            }
        }
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    @PostMapping("/sessions/delete/{id}")
    public String deleteSession(@RequestParam Long courseId, @PathVariable Long id) {
        sessionService.deleteSession(id);
        return "redirect:/courses/edit/sessions?courseId=" + courseId;
    }

    @PostMapping("/sessions/delete-all")
    @Transactional
    public ResponseEntity<String> deleteSelectedDepartments(@RequestBody DeleteRequest deleteRequest, Model model) {
        try {
            List<Long> ids = deleteRequest.getIds();
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body("No session selected for deletion");
            }
            for (Long id : ids) {
                sessionService.deleteSession(id);
            }
            return ResponseEntity.ok("Sessions deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete sessions: " + e.getMessage());
        }
    }

    // Class để nhận dữ liệu từ request body
    public static class DeleteRequest {
        private List<Long> ids;

        public List<Long> getIds() {
            return ids;
        }

        public void setIds(List<Long> ids) {
            this.ids = ids;
        }
    }

    @PostMapping("/sessions/import") // Thay đổi mapping
    @PreAuthorize("hasAnyRole('Admin')")
    public String importExcel(@RequestParam Long courseId, @RequestParam("file") MultipartFile file, Model model) {
        model.addAttribute("content", "sessions/list");
        if (file.isEmpty()) {
            model.addAttribute("error", "Please select a file to upload");
            return Constants.LAYOUT;
        }

        try {
            List<Session> sessions = sessionExcelImporter.importSessions(file.getInputStream(), courseId);
            sessionService.saveAllFromExcel(sessions);
            model.addAttribute("success", "Successfully uploaded and imported data");
            return "redirect:/courses/edit/sessions?courseId=" + courseId; // Redirect về danh sách sessions của course cụ thể
        } catch (IOException e) {
            e.printStackTrace();
            model.addAttribute("error", "Failed to import data from file");
            return Constants.LAYOUT;
        }
    }

    @GetMapping("/sessions/export")
    public ResponseEntity<Resource> exportToExcel(
            @RequestParam Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
//            List<Session> sessions = sessionService.getAllSessions("", page, size).getContent();
            Page<Session> sessionPage = sessionService.getSessionsByCourseId(courseId, page, size);
            List<Session> sessions = sessionPage.getContent();
            ByteArrayInputStream in = sessionService.exportToExcel(sessions);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=sessions.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                    .body(new InputStreamResource(in));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sessions/print")
    public String printDepartment(@RequestParam Long courseId, Model model) {
        model.addAttribute("courseSessions", sessionService.getAllSessions("", 0, Integer.MAX_VALUE));
//        model.addAttribute("content", "course_sessions/print");
//        return Constants.LAYOUT;
        return "course_sessions/print";
    }

    @GetMapping("/sessions/download-template")
    public ResponseEntity<Resource> downloadExcelTemplate() {
        try {
            // Đường dẫn tương đối từ thư mục gốc của project
            Path filePath = Paths.get("data-excel/session_template.xlsx");
            Resource resource = new ByteArrayResource(Files.readAllBytes(filePath));

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=session_template.xlsx");
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
