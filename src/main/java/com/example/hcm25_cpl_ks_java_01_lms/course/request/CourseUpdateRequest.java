package com.example.hcm25_cpl_ks_java_01_lms.course.request;

import lombok.Data;

@Data
public class CourseUpdateRequest {
    private String name;
    private String code;
    private String description;
    private boolean published;
    private String image;
    private float price;
    private float discount;
    private int durationInWeeks;
    private String language;
    private String level;
}