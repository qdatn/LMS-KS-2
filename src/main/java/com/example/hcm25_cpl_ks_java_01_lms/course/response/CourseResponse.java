package com.example.hcm25_cpl_ks_java_01_lms.course.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CourseResponse {
    private Long id;
    private String name;
    private String code;
    private boolean published;
    private String image;
    private float price;
    private float priceDiscount;
    private String instructorName;
}
