package com.example.hcm25_cpl_ks_java_01_lms.session.api.response;

import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class SessionPageResponse {
    @Schema(description = "List of sessions")
    private List<Session> content;

    @Schema(description = "Total number of elements")
    private long totalElements;

    @Schema(description = "Total number of pages")
    private int totalPages;

    @Schema(description = "Current page number")
    private int pageNumber;

    @Schema(description = "Size of the page")
    private int pageSize;

}
