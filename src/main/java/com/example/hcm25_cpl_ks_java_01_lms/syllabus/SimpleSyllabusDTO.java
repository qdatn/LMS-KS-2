package com.example.hcm25_cpl_ks_java_01_lms.syllabus;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SimpleSyllabusDTO {
    private Long id;
    private String name;
    private String syllabusCode;
}
