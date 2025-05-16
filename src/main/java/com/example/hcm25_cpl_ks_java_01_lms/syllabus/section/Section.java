package com.example.hcm25_cpl_ks_java_01_lms.syllabus.section;

import com.example.hcm25_cpl_ks_java_01_lms.syllabus.chapter.Chapter;
import com.example.hcm25_cpl_ks_java_01_lms.syllabus.sectionDetail.SectionDetail;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "sections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String content;

    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SectionDetail> sectionDetails;
}

