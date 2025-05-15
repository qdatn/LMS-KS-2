package com.example.hcm25_cpl_ks_java_01_lms.material;

import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import com.example.hcm25_cpl_ks_java_01_lms.session.SessionRepository;
import com.example.hcm25_cpl_ks_java_01_lms.material.dto.MaterialPositionUpdateDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CourseMaterialService {
    private final CourseMaterialRepository courseMaterialRepository;
    private final SessionRepository sessionRepository;
    private final AudioTimeEstimator audioTimeEstimator;
    private final CourseMaterialMapper courseMaterialMapper;
    private final VideoTimeEstimator videoTimeEstimator;

    @Autowired
    public CourseMaterialService(CourseMaterialRepository courseMaterialRepository, SessionRepository sessionRepository, AudioTimeEstimator audioTimeEstimator, CourseMaterialMapper courseMaterialMapper, VideoTimeEstimator videoTimeEstimator) {
        this.courseMaterialRepository = courseMaterialRepository;
        this.sessionRepository = sessionRepository;
        this.audioTimeEstimator = audioTimeEstimator;
        this.courseMaterialMapper = courseMaterialMapper;
        this.videoTimeEstimator = videoTimeEstimator;
    }

    public void calculateAndSetPdfEstimatedTime(CourseMaterial material, File pdfFile) {
        try {
            long estimatedTime = PdfTimeEstimator.estimateReadingTimeInMinutes(pdfFile);
            material.setEstimatedTimeInMinutes(estimatedTime);
            log.info("Estimated reading time: {} minutes", estimatedTime);
        } catch (IOException e) {
            log.error("Error calculating estimated reading time", e);
        }
    }
    public void calculateAndSetYoutubeEstimatedTime(CourseMaterial material) throws IOException {
        if (material.getFileUrl() != null &&
                (material.getFileUrl().contains("youtube.com/watch?v=") || material.getFileUrl().contains("youtu.be/"))) {
            String videoId = extractVideoId(material.getFileUrl());
            if (videoId != null) {
                long estimatedTime = YoutubeTimeEstimator.getVideoDurationInMinutes(videoId);
                material.setEstimatedTimeInMinutes(estimatedTime);
                courseMaterialRepository.save(material);
            }
        }
    }
    public void calculateAndSetAudioEstimatedTime(CourseMaterial material) throws IOException {
        if (material.getFileUrl() != null && material.getFileUrl().contains("cloudinary.com")) {
            long estimatedTime = audioTimeEstimator.estimateAudioDurationInMinutes(material.getFileUrl());
            material.setEstimatedTimeInMinutes(estimatedTime);
            log.info("Estimated audio duration: {} minutes", estimatedTime);
            courseMaterialRepository.save(material);
        }
    }
    public void calculateAndSetVideoEstimatedTime(CourseMaterial material) throws IOException {
        if (material.getFileUrl() != null) {
            long estimatedTime = videoTimeEstimator.estimateDurationInMinutes(material.getFileUrl());
            material.setEstimatedTimeInMinutes(estimatedTime);
            log.info("Estimated video duration: {} minutes", estimatedTime);
            courseMaterialRepository.save(material);
        }
    }
    private String extractVideoId(String youtubeUrl) {
        if (youtubeUrl.contains("youtube.com/watch?v=")) {
            String[] parts = youtubeUrl.split("v=");
            if (parts.length > 1) {
                return parts[1].split("&")[0];
            }
        } else if (youtubeUrl.contains("youtu.be/")) {
            String[] parts = youtubeUrl.split("youtu.be/");
            if (parts.length > 1) {
                return parts[1].split("\\?")[0];
            }
        }
        return null;
    }
    public Page<CourseMaterial> getAllMaterials(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return courseMaterialRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        }
        return courseMaterialRepository.findAll(pageable);
    }

    public Page<CourseMaterialDTO> searchMaterials(String name, Long sessionId, CourseMaterial.MaterialType materialType, Integer minTime, Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CourseMaterial> materialPage = courseMaterialRepository.searchMaterials(name, sessionId, materialType, minTime, courseId, pageable);
        return materialPage.map(courseMaterialMapper::toDTO);
    }

    public List<CourseMaterial> getAllMaterials() {
        return courseMaterialRepository.findAll();
    }

    public void createMaterial(CourseMaterial material) {
        courseMaterialRepository.save(material);
    }

    public CourseMaterial getMaterialById(Long id) {
        return courseMaterialRepository.findById(id).orElse(null);
    }

    public void updateMaterial(CourseMaterial materialDetails) {
        courseMaterialRepository.save(materialDetails);
    }

    public void deleteMaterial(Long id) {
        courseMaterialRepository.deleteById(id);
    }

    public void saveAllFromExcel(List<CourseMaterial> materials) {
        courseMaterialRepository.saveAll(materials);
    }

    public List<CourseMaterial> findByCourseId(Long courseId) {
        return courseMaterialRepository.findByCourseId(courseId);
    }

    public List<CourseMaterial> findBySessionId(Long sessionId) {
        List<CourseMaterial> materials = new ArrayList<>(courseMaterialRepository.findBySessionId(sessionId));
        // Sort materials by order_number
        materials.sort((m1, m2) -> {
            if (m1.getOrder() == null && m2.getOrder() == null) return 0;
            if (m1.getOrder() == null) return 1;
            if (m2.getOrder() == null) return -1;
            return m1.getOrder().compareTo(m2.getOrder());
        });
        return materials;
    }
    public Page<CourseMaterial> getMaterialsBySessionId(Long sessionId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return courseMaterialRepository.findBySessionIdAndNameContainingIgnoreCase(sessionId, searchTerm, pageable);
        }
        return courseMaterialRepository.findBySessionId(sessionId, pageable);
    }

    public Page<CourseMaterial> getMaterialsByCourseId(Long courseId, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return courseMaterialRepository.findByCourseIdAndNameContainingIgnoreCase(courseId, searchTerm, pageable);
        }
        return courseMaterialRepository.findByCourseId(courseId, pageable);
    }

    public ByteArrayInputStream exportToExcel(List<CourseMaterial> materials) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Course Materials");

            // Tạo header (bỏ cột ID)
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Name", "Description", "Type", "File URL", "Course ID", "Session ID", "Estimated Time (minutes)"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Điền dữ liệu (bỏ cột ID)
            int rowIdx = 1;
            for (CourseMaterial material : materials) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(material.getName() != null ? material.getName() : "");
                row.createCell(1).setCellValue(material.getDescription() != null ? material.getDescription() : "");
                row.createCell(2).setCellValue(material.getType() != null ? material.getType().toString() : "");
                row.createCell(3).setCellValue(material.getFileUrl() != null ? material.getFileUrl() : "");
                row.createCell(4).setCellValue(material.getCourse() != null && material.getCourse().getId() != null ? material.getCourse().getId() : 0);
                row.createCell(5).setCellValue(material.getSession() != null && material.getSession().getId() != null ? material.getSession().getId() : 0);
                row.createCell(6).setCellValue(material.getEstimatedTimeInMinutes() != null ? material.getEstimatedTimeInMinutes() : 0);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    @Transactional
    public void updateMaterialPositions(List<MaterialPositionUpdateDTO> updates) {
        for (MaterialPositionUpdateDTO update : updates) {
            CourseMaterial material = courseMaterialRepository.findById(update.getMaterialId().longValue())
                    .orElseThrow(() -> new RuntimeException("Material not found with id: " + update.getMaterialId()));
            
            Session session = sessionRepository.findById(update.getSessionId().longValue())
                    .orElseThrow(() -> new RuntimeException("Session not found with id: " + update.getSessionId()));
            
            // Update material's session and order
            material.setSession(session);
            material.setOrder(update.getOrder());
            
            courseMaterialRepository.save(material);
        }
    }

    public CourseMaterial saveMaterial(CourseMaterial courseMaterial) {
        return courseMaterialRepository.save(courseMaterial);
    }
}