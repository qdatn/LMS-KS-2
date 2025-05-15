package com.example.hcm25_cpl_ks_java_01_lms.material;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
public class CourseMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Lob
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private MaterialType type;

    private String fileUrl;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = true)
    private Session session;

    private Long estimatedTimeInMinutes;

    @Column(name = "order_number")
    private Integer order;

    @Override
    public String toString() {
        return name;
    }

    public enum MaterialType {
        PDF,
        YOUTUBE,
        VIDEO,
        AUDIO,
        TEXT
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}