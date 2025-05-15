package com.example.hcm25_cpl_ks_java_01_lms.course;

import java.util.List;
import lombok.*;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopicFormListWrapper {
    private List<TopicForm> topics;
}