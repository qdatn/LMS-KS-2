package com.example.hcm25_cpl_ks_java_01_lms.material;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.File;
import java.io.IOException;

public class PdfTimeEstimator {
    // Tốc độ đọc trung bình (từ/phút)
    private static final int AVERAGE_READING_SPEED_WPM = 200;

    public static long estimateReadingTimeInMinutes(File pdfFile) throws IOException {
        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            int wordCount = text.split("\\s+").length;
            // Ước tính thời gian (phút) = số từ / tốc độ đọc (từ/phút)
            return (long) Math.ceil((double) wordCount / AVERAGE_READING_SPEED_WPM);
        }
    }

    public static void main(String[] args) throws IOException {
        File pdfFile = new File("path/to/your/pdf.pdf");
        long minutes = estimateReadingTimeInMinutes(pdfFile);
        System.out.printf("Estimated reading time: %d minutes%n", minutes);
    }
}