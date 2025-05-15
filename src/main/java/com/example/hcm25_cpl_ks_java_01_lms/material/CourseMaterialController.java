package com.example.hcm25_cpl_ks_java_01_lms.material;

import com.example.hcm25_cpl_ks_java_01_lms.common.Constants;
import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseService;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import com.example.hcm25_cpl_ks_java_01_lms.session.SessionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.io.FileWriter;
import java.nio.file.Files;

import lombok.extern.slf4j.Slf4j;
import com.example.hcm25_cpl_ks_java_01_lms.material.dto.MaterialPositionUpdateDTO;
import com.example.hcm25_cpl_ks_java_01_lms.material.LocalFileStorageService;

@Slf4j
@Controller
@RequestMapping("/course-materials")
public class CourseMaterialController {

    @Autowired
    private CourseMaterialService courseMaterialService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private LocalFileStorageService localFileStorageService;

    @Autowired
    private AudioTimeEstimator audioTimeEstimator;

    @Autowired
    private VideoTimeEstimator videoTimeEstimator;

    @GetMapping
    public String listMaterials(Model model,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size,
                                @RequestParam(required = false) String search,
                                @RequestParam(required = false) Long courseId) {
        Page<CourseMaterial> materialPage;
        Course currentCourse = null;
        List<Session> sessions = null;
    
        Map<Session, List<CourseMaterial>> sessionMaterialMap = new LinkedHashMap<>();
    
        if (courseId != null) {
            materialPage = courseMaterialService.getMaterialsByCourseId(courseId, search, page, size);
            currentCourse = courseService.findById(courseId);
            if (currentCourse != null) {
                sessions = sessionService.getSessionsByCourseId(courseId, 0, Integer.MAX_VALUE).getContent();
    
                for (Session session : sessions) {
                    List<CourseMaterial> materials = new ArrayList<>(courseMaterialService.findBySessionId(session.getId()));
                    // Sort materials by order_number
                    materials.sort((m1, m2) -> {
                        if (m1.getOrder() == null && m2.getOrder() == null) return 0;
                        if (m1.getOrder() == null) return 1;
                        if (m2.getOrder() == null) return -1;
                        return m1.getOrder().compareTo(m2.getOrder());
                    });
                    sessionMaterialMap.put(session, materials);
                }
            }
            model.addAttribute("currentCourse", currentCourse);
        } else {
            materialPage = courseMaterialService.getAllMaterials(search, page, size);
            sessions = sessionService.getAllSessions(null, 0, Integer.MAX_VALUE).getContent();
        }
    
        List<CourseMaterial> materials = new ArrayList<>(materialPage.getContent());
        // Sort materials by order_number
        materials.sort((m1, m2) -> {
            if (m1.getOrder() == null && m2.getOrder() == null) return 0;
            if (m1.getOrder() == null) return 1;
            if (m2.getOrder() == null) return -1;
            return m1.getOrder().compareTo(m2.getOrder());
        });
    
        model.addAttribute("materials", materials);
        model.addAttribute("availableTypes", CourseMaterial.MaterialType.values());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", materialPage.getTotalPages());
        model.addAttribute("totalItems", materialPage.getTotalElements());
        model.addAttribute("size", size);
        model.addAttribute("search", search);
        model.addAttribute("courses", courseService.getAllCourses());
        model.addAttribute("sessionsOfCourse", sessions);
        model.addAttribute("sessionMaterialMap", sessionMaterialMap);
        model.addAttribute("content", "course_materials/list");
        return Constants.LAYOUT;
    }

    @GetMapping("/search")
    @ResponseBody
    public Page<CourseMaterialDTO> searchMaterials(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minTime,
            @RequestParam(required = false) Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        CourseMaterial.MaterialType materialType = null;
        if (type != null && !type.isEmpty()) {
          materialType = CourseMaterial.MaterialType.valueOf(type);
        }
            return courseMaterialService.searchMaterials(name, sessionId, materialType, minTime, courseId, page, size);
    }
    

    @GetMapping("/new")
    public String showCreateForm(Model model, @RequestParam(required = false) Long courseId) {
        CourseMaterial material = new CourseMaterial();
        if (courseId != null) {
            Course currentCourse = courseService.findById(courseId);
            model.addAttribute("currentCourse", currentCourse);
            material.setCourse(currentCourse);
        }
        model.addAttribute("material", material);
        model.addAttribute("courses", courseService.getAllCourses(null, 0, Integer.MAX_VALUE).getContent());
        model.addAttribute("materialTypes", CourseMaterial.MaterialType.values());
        model.addAttribute("content", "course_materials/create");
        return Constants.LAYOUT;
    }

    @PostMapping
    public String createMaterial(@RequestParam Map<String, String> allParams,
                           @RequestParam(required = false) List<MultipartFile> pdfFiles,
                           @RequestParam(required = false) List<MultipartFile> audioFiles,
                           @RequestParam(required = false) List<MultipartFile> videoFiles,
                           @RequestParam Long courseId,
                           @RequestParam Long sessionId) throws IOException {
        Course course = courseService.findById(courseId);
        Session session = sessionService.getSessionById(sessionId);
        if (course == null || session == null) {
            return "redirect:/course-materials?courseId=" + courseId;
        }

        // Get material count from form data
        String materialCountStr = allParams.get("materialCount");
        int materialCount = 1; // Default to 1 if not specified
        if (materialCountStr != null && !materialCountStr.isEmpty()) {
            try {
                materialCount = Integer.parseInt(materialCountStr);
            } catch (NumberFormatException e) {
                log.error("Invalid materialCount value: {}", materialCountStr);
                return "redirect:/course-materials?courseId=" + courseId;
            }
        }
        log.info("Number of materials to create: {}", materialCount);

        // Process each material
        for (int i = 0; i < materialCount; i++) {
            String materialName = allParams.get("materials[" + i + "].name");
            String materialTypeStr = allParams.get("materials[" + i + "].type");
            
            // Skip if required fields are missing
            if (materialName == null || materialName.isEmpty() || materialTypeStr == null || materialTypeStr.isEmpty()) {
                log.warn("Skipping material {} due to missing name or type", i);
                continue;
            }
            
            CourseMaterial material = new CourseMaterial();
            material.setName(materialName);
            material.setType(CourseMaterial.MaterialType.valueOf(materialTypeStr));
            material.setCourse(course);
            material.setSession(session);
            
            log.info("Processing material {} - Name: {}, Type: {}", i, material.getName(), material.getType());
            log.info("PDF files: {}, Audio files: {}, Video files: {}", 
                pdfFiles != null ? pdfFiles.size() : 0,
                audioFiles != null ? audioFiles.size() : 0,
                videoFiles != null ? videoFiles.size() : 0);

            if (material.getType() == CourseMaterial.MaterialType.TEXT) {
                String textContent = allParams.get("materials[" + i + "].description");
                log.info("Text content received: {}", textContent);
                if (textContent != null && !textContent.isEmpty()) {
                    // Tạo file tạm thời chứa nội dung text
                    File tempFile = File.createTempFile("text-", ".txt");
                    log.info("Created temp file: {}", tempFile.getAbsolutePath());
                    try (FileWriter writer = new FileWriter(tempFile)) {
                        writer.write(textContent);
                    }
                    
                    // Đọc nội dung file
                    byte[] fileContent = Files.readAllBytes(tempFile.toPath());
                    log.info("File content size: {} bytes", fileContent.length);
                    
                    // Tạo MultipartFile từ byte array
                    MultipartFile multipartFile = new MultipartFile() {
                        @Override
                        public String getName() {
                            return "file";
                        }

                        @Override
                        public String getOriginalFilename() {
                            return tempFile.getName();
                        }

                        @Override
                        public String getContentType() {
                            return MediaType.TEXT_PLAIN_VALUE;
                        }

                        @Override
                        public boolean isEmpty() {
                            return fileContent.length == 0;
                        }

                        @Override
                        public long getSize() {
                            return fileContent.length;
                        }

                        @Override
                        public byte[] getBytes() {
                            return fileContent;
                        }

                        @Override
                        public InputStream getInputStream() {
                            return new ByteArrayInputStream(fileContent);
                        }

                        @Override
                        public void transferTo(File dest) throws IOException, IllegalStateException {
                            Files.write(dest.toPath(), fileContent);
                        }
                    };
                    
                    // Upload file sử dụng LocalFileStorageService
                    String fileUrl = localFileStorageService.uploadFile(multipartFile, "texts", course.getName(), session.getName());
                    log.info("File uploaded successfully. URL: {}", fileUrl);
                    material.setFileUrl(fileUrl);
                    
                    // Tính thời gian đọc dựa trên số từ (giả sử đọc 200 từ/phút)
                    int wordCount = textContent.split("\\s+").length;
                    long estimatedTimeInMinutes = (long) Math.ceil(wordCount / 200.0);
                    material.setEstimatedTimeInMinutes(estimatedTimeInMinutes);
                    log.info("Estimated reading time: {} minutes for {} words", estimatedTimeInMinutes, wordCount);
                    
                    // Xóa file tạm
                    tempFile.delete();
                } else {
                    log.warn("Text content is null or empty");
                }
            } else if (material.getType() == CourseMaterial.MaterialType.PDF) {
                log.info("Processing PDF material");
                if (pdfFiles != null && i < pdfFiles.size()) {
                    MultipartFile pdfFile = pdfFiles.get(i);
                    if (pdfFile != null && !pdfFile.isEmpty()) {
                        log.info("Uploading PDF file: {}", pdfFile.getOriginalFilename());
                        String fileUrl = localFileStorageService.uploadFile(pdfFile, "pdfs", course.getName(), session.getName());
                        material.setFileUrl(fileUrl);
                        log.info("PDF file uploaded successfully. URL: {}", fileUrl);
                        File tempFile = convertMultipartFileToFile(pdfFile);
                        courseMaterialService.calculateAndSetPdfEstimatedTime(material, tempFile);
                        tempFile.deleteOnExit();
                    } else {
                        log.warn("PDF file is null or empty for material: {}", material.getName());
                    }
                } else {
                    log.warn("PDF files array is null or index out of bounds");
                }
            } else if (material.getType() == CourseMaterial.MaterialType.AUDIO) {
                log.info("Processing AUDIO material");
                if (audioFiles != null && i < audioFiles.size()) {
                    MultipartFile audioFile = audioFiles.get(i);
                    if (audioFile != null && !audioFile.isEmpty()) {
                        log.info("Uploading audio file: {}", audioFile.getOriginalFilename());
                        String fileUrl = localFileStorageService.uploadFile(audioFile, "audios", course.getName(), session.getName());
                        material.setFileUrl(fileUrl);
                        log.info("Audio file uploaded successfully. URL: {}", fileUrl);
                        
                        try {
                            // Tạo file tạm thời để đọc metadata
                            File tempFile = File.createTempFile("audio-", ".tmp");
                            audioFile.transferTo(tempFile);
                            
                            // Đọc thời lượng từ file tạm
                            long estimatedTime = audioTimeEstimator.estimateAudioDurationInMinutes(tempFile.getAbsolutePath());
                            material.setEstimatedTimeInMinutes(estimatedTime);
                            log.info("Estimated audio duration: {} minutes", estimatedTime);
                            
                            // Xóa file tạm
                            tempFile.delete();
                        } catch (Exception e) {
                            log.error("Error estimating audio duration: {}", e.getMessage());
                            // Nếu không đọc được thời lượng, sử dụng giá trị mặc định
                            material.setEstimatedTimeInMinutes(0L);
                        }
                    } else {
                        log.warn("Audio file is null or empty for material: {}", material.getName());
                    }
                } else {
                    log.warn("Audio files array is null or index out of bounds");
                }
            } else if (material.getType() == CourseMaterial.MaterialType.VIDEO) {
                log.info("Processing VIDEO material");
                if (videoFiles != null && i < videoFiles.size()) {
                    MultipartFile videoFile = videoFiles.get(i);
                    if (videoFile != null && !videoFile.isEmpty()) {
                        log.info("Uploading video file: {}", videoFile.getOriginalFilename());
                        try {
                            String fileUrl = localFileStorageService.uploadFile(videoFile, "videos", course.getName(), session.getName());
                            material.setFileUrl(fileUrl);
                            log.info("Video file uploaded successfully. URL: {}", fileUrl);
                            long estimatedTime = videoTimeEstimator.estimateDurationInMinutes(fileUrl);
                            material.setEstimatedTimeInMinutes(estimatedTime);
                            log.info("Estimated video duration: {} minutes", estimatedTime);
                        } catch (Exception e) {
                            log.error("Error uploading video file: {}", e.getMessage(), e);
                            throw new IOException("Failed to upload video file: " + e.getMessage(), e);
                        }
                    } else {
                        log.warn("Video file is null or empty for material: {}", material.getName());
                    }
                } else {
                    log.warn("Video files array is null or index out of bounds");
                }
            } else if (material.getType() == CourseMaterial.MaterialType.YOUTUBE) {
                String youtubeUrl = allParams.get("materials[" + i + "].youtubeUrl");
                if (youtubeUrl != null && !youtubeUrl.isEmpty()) {
                    material.setFileUrl(youtubeUrl);
                    courseMaterialService.calculateAndSetYoutubeEstimatedTime(material);
                }
            }

            log.info("Saving material to database");
            courseMaterialService.createMaterial(material);
            log.info("Material saved successfully");
        }

        log.info("All materials created successfully");
        return "redirect:/course-materials?courseId=" + courseId;
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        CourseMaterial material = courseMaterialService.getMaterialById(id);
        if (material == null) {
            return "redirect:/course-materials";
        }
        model.addAttribute("material", material);
        model.addAttribute("courses", courseService.getAllCourses(null, 0, Integer.MAX_VALUE).getContent());
        model.addAttribute("materialTypes", CourseMaterial.MaterialType.values());
        model.addAttribute("content", "course_materials/create");
        return Constants.LAYOUT;
    }

    @PostMapping("/update")
    public String updateMaterial(@ModelAttribute CourseMaterial material,
                                 @RequestParam(required = false) MultipartFile pdfFile,
                                 @RequestParam(required = false) MultipartFile audioFile,
                                 @RequestParam(required = false) MultipartFile videoFile,
                                 @RequestParam Long courseId,
                                 @RequestParam Long sessionId) throws IOException {
        CourseMaterial existingMaterial = courseMaterialService.getMaterialById(material.getId());
        if (existingMaterial == null) {
            return "redirect:/course-materials?courseId=" + courseId;
        }

        Course course = courseService.findById(courseId);
        Session session = sessionService.getSessionById(sessionId);
        if (course == null || session == null) {
            return "redirect:/course-materials?courseId=" + courseId;
        }

        material.setEstimatedTimeInMinutes(existingMaterial.getEstimatedTimeInMinutes());
        material.setCourse(course);
        material.setSession(session);

        if (pdfFile != null && !pdfFile.isEmpty()) {
            String fileUrl = localFileStorageService.uploadFile(pdfFile, "pdfs", course.getName(), session.getName());
            material.setFileUrl(fileUrl);
            File tempFile = convertMultipartFileToFile(pdfFile);
            courseMaterialService.calculateAndSetPdfEstimatedTime(material, tempFile);
            tempFile.deleteOnExit();
        } else if (audioFile != null && !audioFile.isEmpty()) {
            String fileUrl = localFileStorageService.uploadFile(audioFile, "audios", course.getName(), session.getName());
            material.setFileUrl(fileUrl);
            courseMaterialService.calculateAndSetAudioEstimatedTime(material);
        } else if (videoFile != null && !videoFile.isEmpty()) {
            String fileUrl = localFileStorageService.uploadFile(videoFile, "videos", course.getName(), session.getName());
            material.setFileUrl(fileUrl);
            courseMaterialService.calculateAndSetVideoEstimatedTime(material);
        } else if (material.getFileUrl() != null && !material.getFileUrl().isEmpty() &&
                !material.getFileUrl().equals(existingMaterial.getFileUrl()) && material.getType() == CourseMaterial.MaterialType.YOUTUBE) {
            courseMaterialService.calculateAndSetYoutubeEstimatedTime(material);
        }

        courseMaterialService.updateMaterial(material);
        return "redirect:/course-materials?courseId=" + courseId;
    }

    @GetMapping("/delete/{id}")
    public String deleteMaterial(@PathVariable Long id) {
        courseMaterialService.deleteMaterial(id);
        return "redirect:/course-materials";
    }

    @PostMapping("/delete-all")
    public ResponseEntity<String> deleteSelectedMaterials(@RequestBody DeleteRequest deleteRequest) {
        try {
            List<Long> ids = deleteRequest.getIds();
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body("No materials selected for deletion");
            }
            for (Long id : ids) {
                courseMaterialService.deleteMaterial(id);
            }
            return ResponseEntity.ok("Materials deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete materials: " + e.getMessage());
        }
    }

    private File convertMultipartFileToFile(MultipartFile file) throws IOException {
        File tempFile = File.createTempFile("upload-", ".pdf");
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());
        }
        return tempFile;
    }

    @PostMapping("/import")
    public String importExcel(@RequestParam("file") MultipartFile file, Model model) {
        if (file.isEmpty()) {
            model.addAttribute("error", "Please select a file to upload");
            return listMaterials(model, 0, 5, null, null);
        }
        try {
            List<CourseMaterial> materials = CourseMaterialExcelImporter.importCourseMaterials(file.getInputStream());
            courseMaterialService.saveAllFromExcel(materials);
            return "redirect:/course-materials";
        } catch (IOException e) {
            model.addAttribute("error", "Failed to import data from file");
            return listMaterials(model, 0, 5, null, null);
        }
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> exportToExcel(@RequestParam(required = false) String search) {
        try {
            List<CourseMaterial> materials = search != null && !search.isEmpty()
                    ? courseMaterialService.getAllMaterials().stream()
                    .filter(m -> m.getName() != null && m.getName().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList())
                    : courseMaterialService.getAllMaterials();

            ByteArrayInputStream in = courseMaterialService.exportToExcel(materials);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=course_materials.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                    .body(new InputStreamResource(in));
        } catch (Exception e) {
            log.error("Error exporting course materials to Excel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download-template")
    public ResponseEntity<Resource> downloadExcelTemplate() {
        try {
            ByteArrayInputStream in = CourseMaterialExcelImporter.generateExcelTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=course_materials_template.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                    .body(new InputStreamResource(in));
        } catch (IOException e) {
            log.error("Error generating Excel template", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/print")
    public String printMaterials(Model model, @RequestParam(required = false) String search) {
        // Lấy toàn bộ dữ liệu với size tối đa, không phân trang
        Page<CourseMaterial> materialPage = courseMaterialService.getAllMaterials(search, 0, Integer.MAX_VALUE);
        model.addAttribute("materials", materialPage.getContent());
        return "course_materials/print";
    }
    @GetMapping("/sessions-by-course/{courseId}")
    @ResponseBody
    public List<SessionDTO> getSessionsByCourseId(@PathVariable Long courseId) {
        if (courseId == null) {
            log.error("Course ID is null");
            return List.of();
        }
        log.info("Fetching sessions for courseId: {}", courseId);
        Page<Session> sessionPage = sessionService.getSessionsByCourseId(courseId, 0, Integer.MAX_VALUE);
        return sessionPage.getContent().stream()
                .map(session -> new SessionDTO(session.getId(), session.getName()))
                .collect(Collectors.toList());
    }

    @PostMapping("/update-positions")
    public ResponseEntity<?> updateMaterialPositions(@RequestBody List<MaterialPositionUpdateDTO> updates) {
        try {
            courseMaterialService.updateMaterialPositions(updates);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class DeleteRequest {
        private List<Long> ids;

        public List<Long> getIds() {
            return ids;
        }

        public void setIds(List<Long> ids) {
            this.ids = ids;
        }
    }
    public static class SessionDTO {
        private Long id;
        private String name;

        public SessionDTO(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }
    }

}