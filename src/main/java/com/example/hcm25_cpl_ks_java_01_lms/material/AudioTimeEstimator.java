package com.example.hcm25_cpl_ks_java_01_lms.material;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import java.io.File;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AudioTimeEstimator {

    @Autowired
    private LocalFileStorageService localFileStorageService;

    public long estimateAudioDurationInMinutes(String filePath) throws IOException {
        try {
            File audioFile = new File(filePath);
            if (!audioFile.exists()) {
                log.warn("Audio file does not exist at path: {}", filePath);
                return 0L;
            }

            FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(audioFile);
            grabber.start();
            double durationInSeconds = grabber.getLengthInTime() / 1000000.0; // Convert microseconds to seconds
            grabber.stop();
            
            long minutes = (long) Math.ceil(durationInSeconds / 60.0);
            log.info("Audio duration in minutes: {} for file: {}", minutes, filePath);
            return minutes;
        } catch (Exception e) {
            log.error("Error estimating audio duration for file: {}", filePath, e);
            return 0L;
        }
    }
}