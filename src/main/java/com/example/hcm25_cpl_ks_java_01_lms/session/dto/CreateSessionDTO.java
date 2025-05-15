package com.example.hcm25_cpl_ks_java_01_lms.session.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import org.jetbrains.annotations.NotNull;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CreateSessionDTO {
    @NotNull
    private Long courseId;

    @NotEmpty(message = "Sessions are required")
    private List<SessionDTO> sessions;
}

