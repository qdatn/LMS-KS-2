package com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.Syllabus;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.section.Section;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String name;

    @Column(length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "syllabus_id", nullable = false)
    private Syllabus syllabus;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Section> sections;

}
