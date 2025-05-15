package com.example.hcm25_cpl_ks_java_01_lms.student_learning.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class MaterialProgressDTO {
    private Long userId;
    private Long courseId;
    private Long sessionId;
    private Long materialId;

//    private int accessCount; // số lần truy cập
//    private long totalStudyTime; // tổng thời gian học, tính bằng giây
//    private Long estimatedTime; // thời gian ước tính hoàn thành, tính bằng giây
//    private LocalDateTime lastAccessed;
//    private LocalDateTime startTime; // thời điểm bắt đầu học gần nhất
}
