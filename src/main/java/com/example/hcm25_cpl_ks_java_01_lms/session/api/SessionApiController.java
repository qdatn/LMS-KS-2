package com.example.hcm25_cpl_ks_java_01_lms.session.api;

import com.example.hcm25_cpl_ks_java_01_lms.activity.ActivityService;
import com.example.hcm25_cpl_ks_java_01_lms.classes.ClassesService;
import com.example.hcm25_cpl_ks_java_01_lms.config.security.JwtTokenUtils;
import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseService;
import com.example.hcm25_cpl_ks_java_01_lms.course_enrollment.CourseEnrollmentService;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import com.example.hcm25_cpl_ks_java_01_lms.session.SessionController;
import com.example.hcm25_cpl_ks_java_01_lms.session.SessionService;
import com.example.hcm25_cpl_ks_java_01_lms.session.api.response.SessionPageResponse;
import com.example.hcm25_cpl_ks_java_01_lms.session.dto.CreateSessionDTO;
import com.example.hcm25_cpl_ks_java_01_lms.session.dto.SessionDTO;
import com.example.hcm25_cpl_ks_java_01_lms.user.UserService;
import com.example.hcm25_cpl_ks_java_01_lms.user.dto.UserDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
@PreAuthorize("@customSecurityService.hasRoleForModule(authentication, 'Session')")
@Tag(name = "Sessions", description = "API for managing class sessions")
public class SessionApiController {

    private SessionService sessionService;
    private CourseService courseService;

    @Autowired
    public SessionApiController(SessionService sessionService, CourseService courseService) {
        this.courseService = courseService;
        this.sessionService = sessionService;
    }

    @GetMapping
    @Operation(summary = "Get all sessions", description = "Get a paginated list of all sessions with optional search")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval of sessions",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SessionPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<Page<Session>> getAllSessions(
            @Parameter(description = "Search term for filtering sessions") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "Page number (default is 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (default is 5)") @RequestParam(defaultValue = "5") int size) {
        try {
        Page<Session> sessions = sessionService.getAllSessions(searchTerm, page, size);
        return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @Operation(summary = "Get sessions by course ID", description = "Retrieve all sessions of a specific course")
    @GetMapping("/by-course")
    public ResponseEntity<?> getSessionsByCourseId(
            @Parameter(description = "Course ID") @RequestParam Long courseId,
            @Parameter(description = "Search term") @RequestParam(required = false) String searchTerm) {
        List<Session> sessions = sessionService.getAllSessionsSortByOrderNumber(courseId, searchTerm);
        return ResponseEntity.ok(sessions);
    }

    @Operation(summary = "Get session by ID", description = "Retrieve session details by session ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        Session session = sessionService.getSessionById(id);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(session);
    }

    @Operation(summary = "Create a session", description = "Create a new session for a given course")
    @PostMapping
    public ResponseEntity<?> createSession(
            @Parameter(description = "Course ID") @RequestParam Long courseId,
            @RequestBody SessionDTO sessionDTO) {
        Course course = courseService.findById(courseId);
        if (course == null) {
            return ResponseEntity.badRequest().body("Course not found");
        }

        Session session = new Session();
        session.setName(sessionDTO.getName());
        session.setOrderNumber(sessionDTO.getOrderNumber());
        session.setCourse(course);

        sessionService.createSession(session);
        return ResponseEntity.ok(session);
    }

    @Operation(summary = "Create multiple sessions", description = "Create multiple sessions for a course")
    @PostMapping("/batch")
    public ResponseEntity<?> createMultipleSessions(@RequestBody CreateSessionDTO request) {
        Course course = courseService.findById(request.getCourseId());
        if (course == null) {
            return ResponseEntity.badRequest().body("Course not found");
        }

        List<Session> sessions = request.getSessions().stream().map(dto -> {
            Session session = new Session();
            session.setName(dto.getName());
            session.setOrderNumber(dto.getOrderNumber());
            session.setCourse(course);
            return session;
        }).toList();

        sessionService.createSessions(sessions);
        return ResponseEntity.ok(sessions);
    }

    @Operation(summary = "Update a session", description = "Update an existing session by ID")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSession(
            @Parameter(description = "Session ID") @PathVariable Long id,
            @Parameter(description = "Course ID") @RequestParam Long courseId,
            @RequestBody SessionDTO sessionDTO) {
        Session existingSession = sessionService.getSessionById(id);
        if (existingSession == null) {
            return ResponseEntity.notFound().build();
        }

        Course course = courseService.findById(courseId);
        if (course == null) {
            return ResponseEntity.badRequest().body("Course not found");
        }

        existingSession.setName(sessionDTO.getName());
        existingSession.setOrderNumber(sessionDTO.getOrderNumber());
        existingSession.setCourse(course);

        sessionService.updateSession(existingSession);
        return ResponseEntity.ok(existingSession);
    }

    @Operation(summary = "Update multiple sessions", description = "Update a list of sessions by course ID")
    @PutMapping("/batch")
    public ResponseEntity<?> updateMultipleSessions(
            @Parameter(description = "Course ID") @RequestParam Long courseId,
            @RequestBody List<Session> sessions) {
        for (Session session : sessions) {
            Session existing = sessionService.getSessionById(session.getId());
            if (existing != null) {
                existing.setName(session.getName());
                existing.setOrderNumber(session.getOrderNumber());
                sessionService.updateSession(existing);
            }
        }
        return ResponseEntity.ok("Updated successfully");
    }

    @Operation(summary = "Delete a session", description = "Delete a session by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(
            @Parameter(description = "Session ID") @PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @Operation(summary = "Delete multiple sessions", description = "Delete a list of sessions by their IDs")
    @DeleteMapping("/batch")
    public ResponseEntity<?> deleteMultipleSessions(@RequestBody SessionController.DeleteRequest request) {
        List<Long> ids = request.getIds();
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body("No IDs provided");
        }
        for (Long id : ids) {
            sessionService.deleteSession(id);
        }
        return ResponseEntity.ok("Deleted selected sessions");
    }
}