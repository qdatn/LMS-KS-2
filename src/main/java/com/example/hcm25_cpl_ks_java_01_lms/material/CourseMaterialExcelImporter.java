package com.example.hcm25_cpl_ks_java_01_lms.material;

import com.example.hcm25_cpl_ks_java_01_lms.course.Course;
import com.example.hcm25_cpl_ks_java_01_lms.session.Session;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class CourseMaterialExcelImporter {
    public static List<CourseMaterial> importCourseMaterials(InputStream inputStream) throws IOException {
        List<CourseMaterial> materials = new ArrayList<>();
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
            CourseMaterial material = new CourseMaterial();
            int cellIdx = 0;

            while (cellsInRow.hasNext()) {
                Cell currentCell = cellsInRow.next();
                // Kiểm tra kiểu của ô trước khi đọc
                if (currentCell == null || currentCell.getCellType() == CellType.BLANK) {
                    cellIdx++;
                    continue;
                }

                switch (cellIdx) {
                    case 0: // Name
                        material.setName(getStringCellValue(currentCell));
                        break;
                    case 1: // Description
                        material.setDescription(getStringCellValue(currentCell));
                        break;
                    case 2: // Type
                        String typeValue = getStringCellValue(currentCell);
                        material.setType(CourseMaterial.MaterialType.valueOf(typeValue.toUpperCase()));
                        break;
                    case 3: // File URL
                        material.setFileUrl(getStringCellValue(currentCell));
                        break;
                    case 4: // Course ID
                        Long courseId = getNumericCellValue(currentCell);
                        if (courseId != null) {
                            Course course = new Course();
                            course.setId(courseId);
                            material.setCourse(course);
                        }
                        break;
                    case 5: // Session ID
                        Long sessionId = getNumericCellValue(currentCell);
                        if (sessionId != null) {
                            Session session = new Session();
                            session.setId(sessionId);
                            material.setSession(session);
                        }
                        break;
                    case 6: // Estimated Time (minutes)
                        Long estimatedTime = getNumericCellValue(currentCell);
                        material.setEstimatedTimeInMinutes(estimatedTime != null ? estimatedTime : 0L);
                        break;
                    default:
                        break;
                }
                cellIdx++;
            }
            materials.add(material);
        }

        workbook.close();
        return materials;
    }

    // Helper method để lấy giá trị String từ ô
    private static String getStringCellValue(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return "";
        }
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return "";
    }

    // Helper method để lấy giá trị Numeric từ ô
    private static Long getNumericCellValue(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return (long) cell.getNumericCellValue();
        }
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Long.parseLong(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    public static ByteArrayInputStream generateExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Course Materials Template");

            // Create header row
            Row headerRow = sheet.createRow(0);

            // Define the column headers as per the image
            String[] columns = {
                    "Name",
                    "Description",
                    "Type",
                    "File URL",
                    "Course ID",
                    "Session ID",
                    "Estimated Time (minutes)"
            };

            // Create a cell style for the header
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Populate the header row
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
                sheet.autoSizeColumn(i); // Auto-size the column width
            }
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("Sample Material");
            exampleRow.createCell(1).setCellValue("This is a sample description");
            exampleRow.createCell(2).setCellValue("VIDEO");
            exampleRow.createCell(3).setCellValue("https://www.youtube.com/watch?v=sampleVideo");
            exampleRow.createCell(4).setCellValue(1);
            exampleRow.createCell(5).setCellValue(1);
            exampleRow.createCell(6).setCellValue(10);

            // Write the workbook to a ByteArrayOutputStream
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}