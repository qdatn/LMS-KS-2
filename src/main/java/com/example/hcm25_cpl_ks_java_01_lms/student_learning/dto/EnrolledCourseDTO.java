package com.example.hcm25_cpl_ks_java_01_lms.student_learning.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class EnrolledCourseDTO {
    private Long id;
    private String name;
    private String description;
    private String code;
    private String image;
    private LocalDateTime lastAccessed;

}
