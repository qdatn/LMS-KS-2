package com.example.hcm25_cpl_ks_java_01_lms.course.mapper;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.request.CourseCreationRequest;
import com.example.hcm25_cpl_ks_java_01_lms.course.request.CourseUpdateRequest;
import com.example.hcm25_cpl_ks_java_01_lms.course.response.CourseResponse;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(source = "instructor.username", target = "instructorName")
    @Mapping(target = "priceDiscount", expression = "java(course.getDiscountedPrice())")
    CourseResponse courseToCourseResponse(Course course);

    List<CourseResponse> coursesToCourseResponses(List<Course> courses);

    @Mapping(target = "id", ignore = true) // ID sẽ được tự động tạo
    Course courseCreationRequestToCourse(CourseCreationRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCourseFromDto(CourseUpdateRequest dto, @MappingTarget Course entity);

    CourseUpdateRequest courseToCourseUpdateRequest(Course course);

}
