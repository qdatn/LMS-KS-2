package com.example.hcm25_cpl_ks_java_01_lms.material;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadPdf(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isEmpty()) {
            throw new IllegalArgumentException("Tên tệp không hợp lệ");
        }

        String cleanedFileName = originalFileName
                .replaceAll("[^a-zA-Z0-9._-]", "_");


        String publicId = "course_materials/" + cleanedFileName;

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "raw",
                "type", "upload",
                "folder", "course_materials",
                "public_id", publicId
        ));

        String secureUrl = uploadResult.get("secure_url").toString();
        System.out.println("Uploaded URL: " + secureUrl);

        return secureUrl;
    }
    public String uploadAudio(MultipartFile file) throws IOException {
        try {
            // Get the original filename without extension
            String originalFilename = file.getOriginalFilename();
            String filenameWithoutExtension = originalFilename.substring(0, originalFilename.lastIndexOf("."));
            
            // Upload the file
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "video",
                    "type", "upload",
                    "folder", "course_materials_audios",
                    "public_id", filenameWithoutExtension
            ));
            
            // Log the upload result for debugging
            log.info("Audio upload result: {}", uploadResult);
            
            // Get the secure URL
            String secureUrl = uploadResult.get("secure_url").toString();
            log.info("Uploaded Audio URL: {}", secureUrl);
            
            return secureUrl;
        } catch (Exception e) {
            log.error("Error uploading audio file: {}", e.getMessage(), e);
            throw new IOException("Failed to upload audio file", e);
        }
    }
    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "courses"));
        return (String) uploadResult.get("secure_url");
    }

    public void deleteImage(String imageUrl) throws IOException {
        String publicId = extractPublicId(imageUrl);
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    private String extractPublicId(String url) {
        String[] parts = url.split("/");
        String filename = parts[parts.length - 1];
        return filename.split("\\.")[0];
    }

    public Map getResourceInfo(String publicId, String resourceType) throws Exception {
        try {
            Map result = cloudinary.api().resource(publicId, ObjectUtils.asMap(
                    "resource_type", resourceType
            ));
            log.info("Resource info for {}: {}", publicId, result);
            return result;
        } catch (Exception e) {
            log.error("Error getting resource info for {}: {}", publicId, e.getMessage());
            throw e;
        }
    }

    public String uploadVideo(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "video",
                "type", "upload",
                "folder", "videos",
                "public_id", file.getOriginalFilename().split("\\.")[0]
        ));
        String secureUrl = uploadResult.get("secure_url").toString();
        log.info("Uploaded Video URL: {}", secureUrl);
        return secureUrl;
    }

    private File convertMultipartFileToFile(MultipartFile file) throws IOException {
        File tempFile = File.createTempFile("temp", file.getOriginalFilename());
        file.transferTo(tempFile);
        return tempFile;
    }
}