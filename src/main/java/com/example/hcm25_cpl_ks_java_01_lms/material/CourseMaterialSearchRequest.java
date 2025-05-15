package com.example.hcm25_cpl_ks_java_01_lms.material;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseMaterialSearchRequest {
    private String name;
    private Long sessionId;
    private String type;
    private Long minTime;
    private Long courseId;
}
