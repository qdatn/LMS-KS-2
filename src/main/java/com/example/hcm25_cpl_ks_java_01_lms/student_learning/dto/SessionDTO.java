package com.example.hcm25_cpl_ks_java_01_lms.student_learning.dto;

import com.example.hcm25_cpl_ks_java_01_lms.material.CourseMaterial;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class SessionDTO {
    private Session session;
    private List<CourseMaterial> materials;
}
