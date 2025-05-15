package com.example.hcm25_cpl_ks_java_01_lms.course;

import com.example.hcm25_cpl_ks_java_01_lms.user.User;
import com.example.hcm25_cpl_ks_java_01_lms.user.UserRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

public class CourseExcelImporter {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public CourseExcelImporter(UserRepository userRepository, CourseRepository courseRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public List<Course> importCourses(InputStream inputStream) throws IOException {
        List<Course> courses = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();

        int rowNumber = 0;
        while (rows.hasNext()) {
            Row currentRow = rows.next();
            // Skip header row
            if (rowNumber == 0) {
                rowNumber++;
                continue;
            }

            Iterator<Cell> cellsInRow = currentRow.iterator();
            Course course = new Course();
            int cellIdx = 0;
            while (cellsInRow.hasNext()) {
                Cell currentCell = cellsInRow.next();
                switch (cellIdx) {
                    case 0: // ID (can be skipped)
                        break;
                    case 1: // Name
                        course.setName(currentCell.getStringCellValue());
                        break;
                    case 2: // Code
                        course.setCode(currentCell.getStringCellValue());
                        break;
                    case 3: // Description
                        course.setDescription(currentCell.getStringCellValue());
                        break;
                    case 4: // Creator (assumed to be a username)
                        String creatorUsername = currentCell.getStringCellValue();
                        User creator = userRepository.findByUsername(creatorUsername)
                                .orElseThrow(() -> new RuntimeException("Creator not found with username: " + creatorUsername));
                        course.setCreator(creator);
                        break;
                    case 5: // Instructor (assumed to be a username)
                        String instructorUsername = currentCell.getStringCellValue();
                        User instructor = userRepository.findByUsername(instructorUsername)
                                .orElseThrow(() -> new RuntimeException("Instructor not found with username: " + instructorUsername));
                        course.setInstructor(instructor);
                        break;
                    case 6: // Price
                        course.setPrice((float) currentCell.getNumericCellValue());
                        break;
                    case 7: // Discount
                        course.setDiscount((float) currentCell.getNumericCellValue());
                        break;
                    case 8: // Duration (weeks)
                        course.setDurationInWeeks((int) currentCell.getNumericCellValue());
                        break;
                    case 9: // Language
                        course.setLanguage(currentCell.getStringCellValue());
                        break;
                    case 10: // Level
                        course.setLevel(currentCell.getStringCellValue());
                        break;
                    case 11: // Published
                        course.setPublished("Yes".equalsIgnoreCase(currentCell.getStringCellValue()));
                        break;
                    case 12: // Prerequisites
                        break;
                    case 13: // Image
                        // Xử lý trường image từ file Excel (dựng link hình ảnh cho khóa học)
                        String imageUrl = currentCell.getStringCellValue();
                        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                            course.setImage(imageUrl);
                        }
                        break;
                    default:
                        break;
                }
                cellIdx++;
            }
            courses.add(course);
        }
        workbook.close();
        return courses;
    }

    // Hàm để xử lý khóa học tiền đề (Prerequisites)
    private List<Course> parsePrerequisites(String prerequisitesCodes) {
        List<Course> prerequisites = new ArrayList<>();
        if (prerequisitesCodes != null && !prerequisitesCodes.isEmpty()) {
            String[] codes = prerequisitesCodes.split(","); // Split the prerequisite string by comma
            for (String code : codes) {
                code = code.trim(); // Remove any leading or trailing whitespace
                Optional<Course> prerequisite = courseRepository.findByCode(code);
                if (prerequisite.isPresent()) {
                    prerequisites.add(prerequisite.get());
                } else {
                    throw new RuntimeException("Prerequisite course with code " + code + " not found.");
                }
            }
        }
        return prerequisites;
    }
}
