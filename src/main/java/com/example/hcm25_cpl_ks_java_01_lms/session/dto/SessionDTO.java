package com.example.hcm25_cpl_ks_java_01_lms.session.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import org.jetbrains.annotations.NotNull;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class SessionDTO {
    @NotEmpty(message = "Session name is required")
    private String name;

    @NotNull
    private Long orderNumber;
}
