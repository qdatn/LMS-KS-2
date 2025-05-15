package com.example.hcm25_cpl_ks_java_01_lms.material;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Java2DFrameConverter;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class VideoTimeEstimator {
    
    @Autowired
    private LocalFileStorageService localFileStorageService;
    
    public long estimateDurationInMinutes(String videoUrl) {
        try {
            File videoFile = localFileStorageService.getFile(videoUrl);
            if (videoFile == null) {
                log.warn("Could not find video file at URL: {}", videoUrl);
                return 0L;
            }

            FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(videoFile);
            grabber.start();
            double durationInSeconds = grabber.getLengthInTime() / 1000000.0; // Convert microseconds to seconds
            grabber.stop();
            
            long minutes = (long) Math.ceil(durationInSeconds / 60.0);
            log.info("Video duration in minutes: {}", minutes);
            return minutes;
        } catch (Exception e) {
            log.error("Error estimating video duration for URL: {}", videoUrl, e);
            return 0L;
        }
    }
    
    private String extractPublicId(String url) {
        try {
            String[] parts = url.split("/");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("videos")) {
                    String filename = parts[i + 1].split("\\.")[0];
                    return "videos/" + filename;
                }
            }
            log.warn("Could not extract publicId from URL: {}", url);
            return "";
        } catch (Exception e) {
            log.error("Error extracting publicId from URL: {}", url, e);
            return "";
        }
    }
} 