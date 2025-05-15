package com.example.hcm25_cpl_ks_java_01_lms.material;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseMaterialDTO {
    private Long id;
    private String name;
    private String description;
    private String type;
    private String fileUrl;
    private Long estimatedTimeInMinutes;
    private Integer order;
    private Long courseId;
    private Long sessionId;
    private CourseMaterialController.SessionDTO session;

}