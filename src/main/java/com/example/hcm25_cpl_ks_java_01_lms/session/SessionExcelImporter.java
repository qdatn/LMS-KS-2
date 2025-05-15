package com.example.hcm25_cpl_ks_java_01_lms.session;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.course.CourseRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

//public class SessionExcelImporter {
//    public static List<Session> importSessions(InputStream inputStream) throws IOException, IOException {
//        List<Session> sessions = new ArrayList<>();
//        Workbook workbook = new XSSFWorkbook(inputStream);
//
//        Sheet sheet = workbook.getSheetAt(0);
//        Iterator<Row> rows = sheet.iterator();
//
//        int rowNumber = 0;
//        while (rows.hasNext()) {
//            Row currentRow = rows.next();
//            // Skip header
//            if (rowNumber == 0) {
//                rowNumber++;
//                continue;
//            }
//
//            Iterator<Cell> cellsInRow = currentRow.iterator();
//
//            Session session = new Session();
//            int cellIdx = 0;
//            while (cellsInRow.hasNext()) {
//                Cell currentCell = cellsInRow.next();
//                switch (cellIdx) {
//                    case 0:
//                        session.setName(currentCell.getStringCellValue());
//                        break;
//                    case 1:
//                        session.setOrderNumber(Integer.valueOf((int) currentCell.getNumericCellValue()));
//                        break;
//                    default:
//                        break;
//                }
//                cellIdx++;
//            }
//
//            sessions.add(session);
//        }
//
//        workbook.close();
//        return sessions;
//    }
//}

@Component
public class SessionExcelImporter {

    @Autowired
    private CourseRepository courseRepository; // Inject CourseRepository

    public List<Session> importSessions(InputStream inputStream, Long courseId) throws IOException {
        List<Session> sessions = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                Iterator<Cell> cellsInRow = currentRow.iterator();
                Session session = new Session();
                int cellIdx = 0;

                while (cellsInRow.hasNext()) {
                    Cell currentCell = cellsInRow.next();
                    switch (cellIdx) {
                        case 0:
//                            session.setName(currentCell.getStringCellValue());
                            break;
                        case 1:
                            session.setName(currentCell.getStringCellValue());
                            break;
                        case 2:
                            session.setOrderNumber(Long.valueOf((long) currentCell.getNumericCellValue()));
                            break;
                        default:
                            break;
                    }
                    cellIdx++;
                }
                // Tìm Course bằng courseId và set vào Session
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    session.setCourse(course);
                    sessions.add(session);
                } else {
                    // Xử lý trường hợp Course không tồn tại (ví dụ: throw exception, log lỗi)
                    System.err.println("Course with ID " + courseId + " not found. Skipping session.");
                }
            }
        }
        return sessions;
    }
}