package com.example.hcm25_cpl_ks_java_01_lms.session;

import com.example.hcm25_cpl_ks_java_01_lms.role.RoleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public SessionService(SessionRepository sessionRepository, RoleRepository roleRepository) {
        this.sessionRepository = sessionRepository;
        this.roleRepository = roleRepository;
    }

    public Page<Session> getAllSessions(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return sessionRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        }
        return sessionRepository.findAll(pageable);
    }

    public List<Session> getAllSessionsSortByOrderNumber(Long courseId, String searchTerm) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return sessionRepository.searchSessions(courseId, searchTerm);
        }
        return sessionRepository.findByCourseIdOrderByOrderNumberAsc(courseId);
    }

    public void createSession(Session session) {
        sessionRepository.save(session);
    }

    public void createSessions(List<Session> sessions) {
        sessionRepository.saveAll(sessions);
    }

    public List<Session> saveAll(List<Session> sessions) {
        return sessionRepository.saveAll(sessions);
    }

    public Session saveSession(Session session) {
        return sessionRepository.save(session);
    }

    public int getNextOrderNumberForCourse(Long courseId) {
        return sessionRepository.findMaxOrderNumberByCourseId(courseId)
                .orElse(0) + 1;
    }

    public Page<Session> getSessionsByCourseId(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return sessionRepository.findByCourseId(courseId, pageable);
    }

    public Session getSessionById(Long id) {
        return sessionRepository.findById(id).orElse(null);
    }

    public void updateSession(Session sessionDetails) {
        sessionRepository.save(sessionDetails);
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    public ByteArrayInputStream exportToExcel(List<Session> sessions) throws IOException {
        return generateExcel(sessions);
    }

    private ByteArrayInputStream generateExcel(List<Session> sessions) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Sessions");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerCellStyle.setFont(font);

            String[] headers = {"ID", "Name", "Order Number"};
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Create data rows
            int rowIdx = 1;
            for (Session session : sessions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(session.getId());
                row.createCell(1).setCellValue(session.getName());
                row.createCell(2).setCellValue(session.getOrderNumber());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public void saveAllFromExcel(List<Session> sessions) {
        sessionRepository.saveAll(sessions);
    }
}