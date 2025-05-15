package com.example.hcm25_cpl_ks_java_01_lms.material;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LocalFileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String uploadFile(MultipartFile file, String subDirectory, String courseName, String sessionName) throws IOException {
        try {
            log.info("Starting file upload - Original filename: {}, Size: {} bytes", 
                file.getOriginalFilename(), file.getSize());
            
            // Sanitize folder names to be safe for filesystem
            String safeCourseName = sanitizeFolderName(courseName);
            String safeSessionName = sanitizeFolderName(sessionName);
            
            // Create directory structure: uploads/courseName/sessionName/subDirectory
            Path uploadPath = Paths.get(uploadDir, safeCourseName, safeSessionName, subDirectory);
            log.info("Upload path: {}", uploadPath.toAbsolutePath());
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created directory: {}", uploadPath.toAbsolutePath());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            log.info("Generated unique filename: {}", uniqueFilename);

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);
            log.info("File saved successfully to: {}", filePath.toAbsolutePath());

            // Return relative path
            String relativePath = "/uploads/" + safeCourseName + "/" + safeSessionName + "/" + subDirectory + "/" + uniqueFilename;
            log.info("File uploaded successfully. Relative path: {}", relativePath);
            return relativePath;
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            throw new IOException("Failed to upload file", e);
        }
    }

    private String sanitizeFolderName(String name) {
        // Remove or replace characters that might be problematic in file paths
        return name.replaceAll("[^a-zA-Z0-9-_.]", "_")
                  .toLowerCase()
                  .trim();
    }

    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
            Path filePath = Paths.get(uploadDir, fileUrl.substring("/uploads/".length()));
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", fileUrl);
            } else {
                log.warn("File not found for deletion: {}", fileUrl);
            }
        }
    }

    public File getFile(String fileUrl) {
        if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
            Path filePath = Paths.get(uploadDir, fileUrl.substring("/uploads/".length()));
            if (Files.exists(filePath)) {
                return filePath.toFile();
            }
            log.warn("File not found: {}", fileUrl);
        }
        return null;
    }
} 