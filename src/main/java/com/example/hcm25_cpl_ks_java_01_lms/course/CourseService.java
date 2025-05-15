package com.example.hcm25_cpl_ks_java_01_lms.course;

import com.example.hcm25_cpl_ks_java_01_lms.certificate.CertificateRepository;
import com.example.hcm25_cpl_ks_java_01_lms.course.mapper.CourseMapper;
import com.example.hcm25_cpl_ks_java_01_lms.course.request.CourseCreationRequest;
import com.example.hcm25_cpl_ks_java_01_lms.course.request.CourseUpdateRequest;
import com.example.hcm25_cpl_ks_java_01_lms.course.response.CourseResponse;
import com.example.hcm25_cpl_ks_java_01_lms.feedback.course.CourseFeedbackRepository;
import com.example.hcm25_cpl_ks_java_01_lms.feedback.report.course.CourseFeedbackReport;
import com.example.hcm25_cpl_ks_java_01_lms.feedback.report.course.CourseFeedbackReportRepository;
import com.example.hcm25_cpl_ks_java_01_lms.feedback.report.instructor.InstructorFeedbackReport;
import com.example.hcm25_cpl_ks_java_01_lms.feedback.report.instructor.InstructorFeedbackReportRepository;
import com.example.hcm25_cpl_ks_java_01_lms.material.CloudinaryService;
import com.example.hcm25_cpl_ks_java_01_lms.material.CourseMaterialService;
import com.example.hcm25_cpl_ks_java_01_lms.modulegroup.ModuleGroup;
import com.example.hcm25_cpl_ks_java_01_lms.notification.services.NotificationSenderService;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import com.example.hcm25_cpl_ks_java_01_lms.session.SessionRepository;
import com.example.hcm25_cpl_ks_java_01_lms.tag.Tag;
import com.example.hcm25_cpl_ks_java_01_lms.tag.TagRepository;
import com.example.hcm25_cpl_ks_java_01_lms.topic.Topic;
import com.example.hcm25_cpl_ks_java_01_lms.topic.TopicRepository;
import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import com.example.hcm25_cpl_ks_java_01_lms.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final CloudinaryService cloudinaryService;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final CourseFeedbackReportRepository courseFeedbackReportRepository;
    private final CourseFeedbackRepository courseFeedbackRepository;
    private final InstructorFeedbackReportRepository instructorFeedbackReportRepository;

    private final TopicRepository topicRepository;
    private final TagRepository tagRepository;
    private final CourseMapper courseMapper;
    private final CourseMaterialService courseMaterialService;

    @Autowired
    private CertificateRepository certificateRepository;
//    @Autowired
//    public CourseService(CourseRepository courseRepository, CloudinaryService cloudinaryService, SessionRepository sessionRepository, UserRepository userRepository, CourseFeedbackReportRepository courseFeedbackReportRepository, InstructorFeedbackReportRepository instructorFeedbackReportRepository, TopicRepository topicRepository, TagRepository tagRepository) {
//        this.courseRepository = courseRepository;
//        this.cloudinaryService = cloudinaryService;
//        this.sessionRepository = sessionRepository;
//        this.userRepository = userRepository;
//        this.courseFeedbackReportRepository = courseFeedbackReportRepository;
//        this.instructorFeedbackReportRepository = instructorFeedbackReportRepository;
//        this.topicRepository = topicRepository;
//        this.tagRepository = tagRepository;
//    }
    private final NotificationSenderService notificationSenderService;

    public Page<Course> getAllCourses(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return courseRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        }
        return courseRepository.findAll(pageable);
    }
    public List<Course> getAllCourses(String searchTerm) {
        if (searchTerm == null || searchTerm.isEmpty()) {
            return courseRepository.findAll();
        }
        return courseRepository.findByNameContainingIgnoreCase(searchTerm);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public void createCourse(Course course, MultipartFile file) throws IOException {
        // Lấy thông tin creator và instructor từ database
        Optional<User> creatorOpt = userRepository.findById(course.getCreator().getId());
        Optional<User> instructorOpt = userRepository.findById(course.getInstructor().getId());

        if (creatorOpt.isEmpty() || instructorOpt.isEmpty()) {
            throw new IllegalArgumentException("Creator or Instructor not found.");
        }

        course.setCreator(creatorOpt.get());
        course.setInstructor(instructorOpt.get());

        // Xử lý upload ảnh lên Cloudinary
        if (file != null && !file.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(file);
            course.setImage(imageUrl);
        }

        // Lưu khóa học trước để có ID
        Course savedCourse = courseRepository.save(course);

        // Tạo và lưu CourseFeedbackReport
        CourseFeedbackReport courseFeedbackReport = new CourseFeedbackReport();
        courseFeedbackReport.setCourse(savedCourse); // Liên kết với khóa học vừa tạo
        courseFeedbackReport.setAverageRating(0.0); // Giá trị mặc định
        courseFeedbackReport.setTotalFeedback(0);
        courseFeedbackReport.setTotalPositiveFeedback(0);
        courseFeedbackReport.setTotalNegativeFeedback(0);
        courseFeedbackReport.setTotalNeutralFeedback(0);
        courseFeedbackReportRepository.save(courseFeedbackReport);

        // Tạo và lưu InstructorFeedbackReport
        User instructor = savedCourse.getInstructor();
        Optional<InstructorFeedbackReport> iFeedbackReport = instructorFeedbackReportRepository.findByInstructor(instructor);
        if (!iFeedbackReport.isPresent()) { // Dùng isPresent() thay vì isEmpty()
            System.out.println("Creating new InstructorFeedbackReport...");
            InstructorFeedbackReport instructorFeedbackReport = new InstructorFeedbackReport();
            instructorFeedbackReport.setInstructor(instructor);
            instructorFeedbackReport.setAverageRating(0.0);
            instructorFeedbackReport.setTotalFeedback(0);
            instructorFeedbackReport.setTotalPositiveFeedback(0);
            instructorFeedbackReport.setTotalNegativeFeedback(0);
            instructorFeedbackReport.setTotalNeutralFeedback(0);
            instructorFeedbackReportRepository.save(instructorFeedbackReport);
        } else {
            System.out.println("InstructorFeedbackReport already exists.");
        }

    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    public void updateCourse(Long id, Course courseDetails, MultipartFile file) throws IOException {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 🔹 Lấy creator và instructor từ database
        User creator = userRepository.findById(courseDetails.getCreator().getId())
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        User instructor = userRepository.findById(courseDetails.getInstructor().getId())
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        existingCourse.setCreator(creator);
        existingCourse.setInstructor(instructor);

        // 🔹 Cập nhật thông tin chung của course
        existingCourse.setName(courseDetails.getName());
        existingCourse.setCode(courseDetails.getCode());
        existingCourse.setDescription(courseDetails.getDescription());
        existingCourse.setPrice(courseDetails.getPrice());
        existingCourse.setDiscount(courseDetails.getDiscount());
        existingCourse.setDurationInWeeks(courseDetails.getDurationInWeeks());
        existingCourse.setLanguage(courseDetails.getLanguage());
        existingCourse.setLevel(courseDetails.getLevel());
        existingCourse.setPublished(courseDetails.isPublished());

        // 🔹 Xử lý cập nhật ảnh nếu có
        if (file != null && !file.isEmpty()) {
            if (existingCourse.getImage() != null) {
                cloudinaryService.deleteImage(existingCourse.getImage());
            }
            String imageUrl = cloudinaryService.uploadImage(file);
            existingCourse.setImage(imageUrl);
        }

        courseRepository.save(existingCourse);
        notificationSenderService.sendCourseUpdateNotification(existingCourse);
    }

    @Transactional
    public Course toggleCourseStatus(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setPublished(!course.isPublished());
        return courseRepository.save(course);
    }


    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

//        // 1. Lấy danh sách tất cả các Session thuộc về Course này
//        List<Session> sessionsToDelete = sessionRepository.findByCourseId(course.getId());
//
//        // 2. Duyệt qua từng Session và xóa các CourseMaterial liên quan
//        for (Session session : sessionsToDelete) {
//            // Tìm và xóa tất cả CourseMaterial liên quan đến Session này
//            courseMaterialService.de(session);
//        }

//        sessionRepository.deleteByCourse(course);

        courseFeedbackReportRepository.deleteByCourse(course);
        courseFeedbackRepository.deleteByCourse(course);
        User instructor = course.getInstructor();
        Optional<InstructorFeedbackReport> instructorFeedbackReportOpt = instructorFeedbackReportRepository.findByInstructor(instructor);
        if (instructorFeedbackReportOpt.isPresent()) {

            long courseCount = courseRepository.countByInstructor(instructor);
            if (courseCount <= 1) {
                instructorFeedbackReportRepository.delete(instructorFeedbackReportOpt.get());
            }
        }
        certificateRepository.deleteByCourse(course);
        try {

            if (course.getImage() != null && !course.getImage().isEmpty()) {
                cloudinaryService.deleteImage(course.getImage());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image from Cloudinary: " + e.getMessage());
        }

        courseRepository.delete(course);
    }

    public ByteArrayInputStream exportToExcel(List<Course> courses) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Courses");

            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "ID", "Name", "Code", "Description", "Creator", "Instructor", "Price", "Discount",
                    "Duration", "Language", "Level", "Published", "Prerequisites", "Image"
            };
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            // Dữ liệu khóa học
            int rowIdx = 1;
            for (Course course : courses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(course.getId());
                row.createCell(1).setCellValue(course.getName());
                row.createCell(2).setCellValue(course.getCode());
                row.createCell(3).setCellValue(course.getDescription());
                row.createCell(4).setCellValue(course.getCreator() != null ? course.getCreator().getUsername() : "N/A");
                row.createCell(5).setCellValue(course.getInstructor() != null ? course.getInstructor().getUsername() : "N/A");
                row.createCell(6).setCellValue(course.getPrice());
                row.createCell(7).setCellValue(course.getDiscount());
                row.createCell(8).setCellValue(course.getDurationInWeeks());
                row.createCell(9).setCellValue(course.getLanguage());
                row.createCell(10).setCellValue(course.getLevel());
                row.createCell(11).setCellValue(course.isPublished() ? "Yes" : "No");

                // Xuất các khóa học tiền đề (Prerequisites) dưới dạng mã khóa học
                String prerequisites = course.getPrerequisites().stream()
                        .map(Course::getCode)  // Dùng mã khóa học thay vì tên
                        .collect(Collectors.joining(", "));
                row.createCell(12).setCellValue(prerequisites);

                // Xuất đường dẫn ảnh của khóa học
                row.createCell(13).setCellValue(course.getImage() != null ? course.getImage() : ""); // Đảm bảo đường dẫn ảnh không null
            }

            // Chuyển dữ liệu thành byte array
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private ByteArrayInputStream generateExcel(List<Course> courses) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Courses");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerCellStyle.setFont(font);

            String[] headers = {"ID", "Name", "Code", "Description", "Published", "Price", "Discount", "Duration", "Language", "Level"};
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Create data rows
            int rowIdx = 1;
            for (Course course : courses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(course.getId());
                row.createCell(1).setCellValue(course.getName());
                row.createCell(2).setCellValue(course.getCode());
                row.createCell(3).setCellValue(course.getDescription());
                row.createCell(4).setCellValue(course.isPublished());
                row.createCell(5).setCellValue(course.getPrice());
                row.createCell(6).setCellValue(course.getDiscount());
                row.createCell(7).setCellValue(course.getDurationInWeeks());
                row.createCell(8).setCellValue(course.getLanguage());
                row.createCell(9).setCellValue(course.getLevel());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public void saveAllFromExcel(List<Course> courses) {
        List<CourseFeedbackReport> courseReports = new ArrayList<>();
        Map<User, InstructorFeedbackReport> instructorReports = new HashMap<>();

        for (Course course : courses) {
            Course savedCourse = courseRepository.save(course);

            // Tạo CourseFeedbackReport
            CourseFeedbackReport courseFeedbackReport = new CourseFeedbackReport();
            courseFeedbackReport.setCourse(savedCourse);
            courseFeedbackReport.setAverageRating(0.0);
            courseFeedbackReport.setTotalFeedback(0);
            courseFeedbackReport.setTotalPositiveFeedback(0);
            courseFeedbackReport.setTotalNegativeFeedback(0);
            courseFeedbackReport.setTotalNeutralFeedback(0);
            courseReports.add(courseFeedbackReport);

            // Tạo InstructorFeedbackReport nếu chưa tồn tại
            User instructor = savedCourse.getInstructor();
            if (instructorFeedbackReportRepository.findByInstructor(instructor).isEmpty()) {
                InstructorFeedbackReport instructorFeedbackReport = new InstructorFeedbackReport();
                instructorFeedbackReport.setInstructor(instructor);
                instructorFeedbackReport.setAverageRating(0.0);
                instructorFeedbackReport.setTotalFeedback(0);
                instructorFeedbackReport.setTotalPositiveFeedback(0);
                instructorFeedbackReport.setTotalNegativeFeedback(0);
                instructorFeedbackReport.setTotalNeutralFeedback(0);
                instructorReports.put(instructor, instructorFeedbackReport);
            }
        }

        courseFeedbackReportRepository.saveAll(courseReports);
        instructorFeedbackReportRepository.saveAll(instructorReports.values());
        courseRepository.saveAll(courses);
    }

    public Course findById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public List<Course> findCoursesByIds(List<Long> courseIds) {
        return courseRepository.findAllById(courseIds);
    }

    public List<Map<String, Object>> getCourseOfDepartment() {
        return courseRepository.findAll()
                .stream()
                .map(course -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", course.getId());
                    userMap.put("name", course.getName());
                    return userMap;
                })
                .collect(Collectors.toList());
    }

    public Optional<Course> getCourseByCode(String courseCode) {
        // Assuming you have a method in your CourseRepository to find courses by their code
        return courseRepository.findByCode(courseCode);
    }

    public List<Course> getCoursesByIds(List<Long> ids) {
        return courseRepository.findAllById(ids);
    }


    public List<InstructorDTO> getAllInstructors() {
        return courseRepository.findAll().stream()
                .map(course -> course.getInstructor())
                .filter(instructor -> instructor != null)
                .collect(Collectors.toMap(User::getId, instructor -> new InstructorDTO(instructor.getId(), instructor.getUsername()), (a, b) -> a))
                .values()
                .stream()
                .collect(Collectors.toList());
    }

    @Transactional
    public void addTopicToCourse(Course course, Topic topic) {
        topic.setCourse(course); // Thiết lập mối quan hệ ngược lại
        if (course.getTopics() == null) {
            course.setTopics(new ArrayList<>());
        }
        if (!course.getTopics().contains(topic)) {
            course.getTopics().add(topic);
        }
        courseRepository.save(course); // Lưu course để cập nhật mối quan hệ
    }

    public Course getCourseByIdWithTopicsAndTags(Long courseId) {
        return courseRepository.findByIdWithTopicsAndTags(courseId).orElse(null);
    }

    public Course saveCourse(Course course) {
        return courseRepository.save(course);
    }

    @Transactional
    public void removeTopicFromCourse(Course course, Topic topic) {
        if (course != null && course.getTopics() != null && topic != null) {
            course.getTopics().remove(topic);
            courseRepository.save(course);
        }
    }


    public record InstructorDTO(Long id, String username) {}
//
//    @Transactional
//    public void saveCourseTopicsAndTags(Long courseId, List<TopicForm> topicForms) {
//        // Tìm course theo ID, nếu không tìm thấy thì ném exception
//        Course course = courseRepository.findById(courseId)
//                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));
//
//        // Kiểm tra nếu danh sách topicForms không null
//        if (topicForms != null) {
//            for (TopicForm topicForm : topicForms) {
//                // Kiểm tra nếu topicName không null hoặc rỗng
//                if (topicForm.getTopicName() != null && !topicForm.getTopicName().trim().isEmpty()) {
//                    // Tạo mới một Topic và thiết lập các thuộc tính
//                    Topic topic = new Topic();
//                    topic.setCourse(course);
//                    topic.setTopicName(topicForm.getTopicName().trim());
//
//                    // Lưu topic vào database
//                    Topic savedTopic = topicRepository.save(topic);
//
//                    // Kiểm tra nếu danh sách tags không null
//                    if (topicForm.getTags() != null) {
//                        for (String tagName : topicForm.getTags()) {
//                            // Kiểm tra nếu tagName không null hoặc rỗng
//                            if (tagName != null && !tagName.trim().isEmpty()) {
//                                // Tạo mới một Tag và thiết lập các thuộc tính
//                                Tag tag = new Tag();
//                                tag.setTopic(savedTopic);
//                                tag.setTagName(tagName.trim());
//
//                                // Kiểm tra xem tag đã tồn tại cho topic này chưa (tùy chọn)
//                                if (!tagRepository.existsByTagNameAndTopic(tag.getTagName(), savedTopic)) {
//                                    // Lưu tag vào database
//                                    tagRepository.save(tag);
//                                }
//                            }
//                        }
//                    }
//                }
//            }
//        }
//    }

    @Transactional
    public void saveCourseTopicsAndTags(Long courseId, List<TopicForm> topicForms) {
        // Tìm course theo ID, nếu không tìm thấy thì ném exception
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        // Lấy danh sách các Topic hiện có của Course
        List<Topic> existingTopics = topicRepository.findByCourse(course);
        Map<Integer, Topic> existingTopicMap = existingTopics.stream()
                .collect(Collectors.toMap(Topic::getTopicId, topic -> topic));

        // Kiểm tra nếu danh sách topicForms không null
        if (topicForms != null) {
            for (TopicForm topicForm : topicForms) {
                // Kiểm tra nếu topicName không null hoặc rỗng
                if (topicForm.getTopicName() != null && !topicForm.getTopicName().trim().isEmpty()) {
                    // Nếu topicForm có index (tức là đã tồn tại), cập nhật Topic hiện có
                    if (topicForm.getIndex() != null && existingTopicMap.containsKey(topicForm.getIndex())) {
                        Topic existingTopic = existingTopicMap.get(topicForm.getIndex());
                        existingTopic.setTopicName(topicForm.getTopicName().trim());
                        topicRepository.save(existingTopic);

                        // Xử lý các Tag của Topic hiện có
                        updateTagsForTopic(existingTopic, topicForm.getTags());
                    } else {
                        // Nếu topicForm không có index (tức là mới), tạo Topic mới
                        Topic newTopic = new Topic();
                        newTopic.setCourse(course);
                        newTopic.setTopicName(topicForm.getTopicName().trim());
                        Topic savedTopic = topicRepository.save(newTopic);

                        // Thêm các Tag mới cho Topic mới
                        addTagsForTopic(savedTopic, topicForm.getTags());
                    }
                }
            }
        }

        // Xóa các Topic không còn tồn tại trong danh sách topicForms
        List<Integer> existingTopicIds = existingTopics.stream()
                .map(Topic::getTopicId)
                .collect(Collectors.toList());
        List<Integer> newTopicIds = topicForms.stream()
                .filter(topicForm -> topicForm.getIndex() != null)
                .map(TopicForm::getIndex)
                .collect(Collectors.toList());
        List<Integer> topicsToDelete = existingTopicIds.stream()
                .filter(id -> !newTopicIds.contains(id))
                .collect(Collectors.toList());

        if (!topicsToDelete.isEmpty()) {
            topicRepository.deleteAllById(topicsToDelete);
        }
    }

    private void updateTagsForTopic(Topic topic, List<String> tags) {
        if (tags != null) {
            Set<String> uniqueTagsInForm = new HashSet<>(tags); // Lấy danh sách tag duy nhất từ form

            // Lấy danh sách các Tag hiện có của Topic
            List<Tag> existingTags = tagRepository.findByTopic(topic);
            Set<String> existingTagNames = existingTags.stream()
                    .map(Tag::getTagName)
                    .collect(Collectors.toSet());

            // Xóa các Tag không còn tồn tại trong danh sách tags của form
            List<Tag> tagsToDelete = existingTags.stream()
                    .filter(existingTag -> !uniqueTagsInForm.contains(existingTag.getTagName()))
                    .collect(Collectors.toList());

            if (!tagsToDelete.isEmpty()) {
                tagRepository.deleteAll(tagsToDelete); // Sử dụng deleteAll để xóa entities
            }

            // Thêm các Tag mới (có trong form nhưng chưa tồn tại)
            for (String tagName : uniqueTagsInForm) {
                if (tagName != null && !tagName.trim().isEmpty() && !existingTagNames.contains(tagName)) {
                    Tag newTag = new Tag();
                    newTag.setTopic(topic);
                    newTag.setTagName(tagName.trim());
                    tagRepository.save(newTag);
                }
            }
        }
    }

    private void addTagsForTopic(Topic topic, List<String> tags) {
        if (tags != null && !tags.isEmpty()) {
            Set<String> uniqueTags = new HashSet<>(tags);
            List<Tag> tagsToSave = new ArrayList<>();
            for (String tagName : uniqueTags) {
                if (tagName != null && !tagName.trim().isEmpty()) {
                    Tag tag = new Tag();
                    tag.setTopic(topic);
                    tag.setTagName(tagName.trim());
                    tagsToSave.add(tag);
                }
            }
            if (!tagsToSave.isEmpty()) {
                tagRepository.saveAll(tagsToSave);
            }
        }
    }

    public Page<CourseResponse> getAllCoursesWithFilters(int page, int size, String searchTerm, Boolean published) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> coursePage;

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            if (published != null) {
                coursePage = courseRepository.findByNameContainingIgnoreCaseAndPublished(searchTerm, published, pageable);
            } else {
                coursePage = courseRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
            }
        } else {
            if (published != null) {
                coursePage = courseRepository.findByPublished(published, pageable);
            } else {
                coursePage = courseRepository.findAll(pageable);
            }
        }
        return coursePage.map(courseMapper::courseToCourseResponse);
    }

    @Transactional
    public Course createCourse(CourseCreationRequest request) {
        // Kiểm tra xem course code đã tồn tại chưa (ví dụ)
        if (courseRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Course with code " + request.getCode() + " already exists.");
        }

        Course course = courseMapper.courseCreationRequestToCourse(request);

        return courseRepository.save(course);
    }

//    public Course getCourseById(Long id) {
//        return courseRepository.findById(id)
//                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));
//    }

    @Transactional
    public Course updateCourse(Long id, CourseUpdateRequest updateRequest) {
        Course existingCourse = getCourseById(id);
        // Kiểm tra xem code mới có bị trùng với khóa học khác không
        if (!updateRequest.getCode().equals(existingCourse.getCode()) && courseRepository.existsByCode(updateRequest.getCode())) {
            throw new IllegalArgumentException("Course with code " + updateRequest.getCode() + " already exists.");
        }
        courseMapper.updateCourseFromDto(updateRequest, existingCourse);
        return courseRepository.save(existingCourse);
    }
}
