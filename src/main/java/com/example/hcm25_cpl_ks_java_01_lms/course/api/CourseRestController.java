package com.example.hcm25_cpl_ks_java_01_lms.course.api;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseService;
import com.example.hcm25_cpl_ks_java_01_lms.course.mapper.CourseMapper;
import com.example.hcm25_cpl_ks_java_01_lms.course.request.CourseCreationRequest;
import com.example.hcm25_cpl_ks_java_01_lms.course.request.CourseUpdateRequest;
import com.example.hcm25_cpl_ks_java_01_lms.course.response.CourseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@PreAuthorize("@customSecurityService.hasRoleForModule(authentication, 'Courses - Rest')")
@Tag(name = "Courses", description = "API for managing courses in the Learning Management System")
public class CourseRestController {

    private final CourseService courseService;
    private final CourseMapper courseMapper; // Inject CourseMapper


    @GetMapping
    @Operation(summary = "Get all courses", description = "Retrieve a paginated list of all courses, optionally filtered by search term and published status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved courses", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = Map.class)))
    })
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @Parameter(description = "Search term to filter courses by name or other attributes") String searchTerm,
            @RequestParam(required = false) @Parameter(description = "Filter courses by published status (true, false)") Boolean published) {
        try {
            Page<CourseResponse> coursePage = courseService.getAllCoursesWithFilters(page, size, searchTerm, published);
            return ResponseEntity.ok(coursePage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete course", description = "Remove a course from the system by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Course deleted successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = Map.class)))
    })
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok().build(); // Trả về mã 200 OK khi xóa thành công
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse); // Trả về mã 500 và thông báo lỗi
        }
    }

    @PostMapping
    @Operation(summary = "Create a new course", description = "Add a new course to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Course created successfully", content = @Content(schema = @Schema(implementation = Course.class))),
            @ApiResponse(responseCode = "400", description = "Course already exists or invalid data", content = @Content(schema = @Schema(implementation = Map.class)))
    })
    public ResponseEntity<?> createCourse(@RequestBody @Valid @Parameter(description = "Course details to create") CourseCreationRequest request) {
        try {
            Course createdCourse = courseService.createCourse(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse); // Vẫn giả sử Course có toDTO()
        }catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID for update", description = "Retrieve details of a specific course by its ID for updating")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Course found", content = @Content(schema = @Schema(implementation = CourseUpdateRequest.class))),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<?> getCourseForUpdate(@PathVariable @Parameter(description = "ID of the course to retrieve") Long id) {
        try {
            Course course = courseService.getCourseById(id);
            CourseUpdateRequest response = courseMapper.courseToCourseUpdateRequest(course); // Sử dụng mapper
            return ResponseEntity.ok(response);
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing course", description = "Update details of a specific course by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Course updated successfully", content = @Content(schema = @Schema(implementation = Course.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data or course code already exists", content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "404", description = "Course not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = Map.class)))
    })
    public ResponseEntity<?> updateCourse(@PathVariable @Parameter(description = "ID of the course to update") Long id,
                                          @RequestBody @Valid @Parameter(description = "Updated course details") CourseUpdateRequest updateRequest) {
        try {
            Course updatedCourse = courseService.updateCourse(id, updateRequest);
            return ResponseEntity.ok(courseMapper.courseToCourseResponse(updatedCourse)); // Sử dụng mapper để trả về response
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
