package com.example.hcm25_cpl_ks_java_01_lms.material;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMaterialMapper {
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "session.id", target = "sessionId")
    @Mapping(source = "session", target = "session")
    CourseMaterialDTO toDTO(CourseMaterial courseMaterial);

    CourseMaterial toEntity(CourseMaterialDTO courseMaterialDTO);

    List<CourseMaterialDTO> toDtoList(List<CourseMaterial> courseMaterials);
}
