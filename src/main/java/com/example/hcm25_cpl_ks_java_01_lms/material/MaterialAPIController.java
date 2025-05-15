package com.example.hcm25_cpl_ks_java_01_lms.material;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import com.example.hcm25_cpl_ks_java_01_lms.material.dto.MaterialPositionUpdateDTO;

@RestController
@RequestMapping("/api/materials")
public class MaterialAPIController {

    private final CourseMaterialService materialService;

    @Autowired
    public MaterialAPIController(CourseMaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    public ResponseEntity<Page<CourseMaterial>> getAllMaterials(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(materialService.getAllMaterials(searchTerm, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterial> getMaterialById(@PathVariable Long id) {
        CourseMaterial material = materialService.getMaterialById(id);
        if (material != null) {
            return ResponseEntity.ok(material);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<CourseMaterial> createMaterial(@RequestBody CourseMaterial material) {
        // If it's a text material, save the content to a file
        if (material.getType() == CourseMaterial.MaterialType.TEXT) {
            try {
                // Create a unique filename
                String fileName = "material_" + System.currentTimeMillis() + ".txt";
                String filePath = "data/materials/" + fileName;
                File file = new File(filePath);
                file.getParentFile().mkdirs();
                
                // Save the text content to file
                try (FileWriter writer = new FileWriter(file)) {
                    writer.write(material.getDescription());
                }
                
                // Update the material's file URL
                material.setFileUrl("/data/materials/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        materialService.createMaterial(material);
        return ResponseEntity.ok(material);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseMaterial> updateMaterial(
            @PathVariable Long id,
            @RequestBody CourseMaterial materialDetails) {
        CourseMaterial existingMaterial = materialService.getMaterialById(id);
        if (existingMaterial != null) {
            materialDetails.setId(id);
            materialService.updateMaterial(materialDetails);
            return ResponseEntity.ok(materialDetails);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        CourseMaterial material = materialService.getMaterialById(id);
        if (material != null) {
            materialService.deleteMaterial(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterial>> getMaterialsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.findByCourseId(courseId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<CourseMaterial>> getMaterialsBySessionId(@PathVariable Long sessionId) {
        return ResponseEntity.ok(materialService.findBySessionId(sessionId));
    }

    @GetMapping("/course/{courseId}/search")
    public ResponseEntity<Page<CourseMaterial>> searchMaterialsByCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(materialService.getMaterialsByCourseId(courseId, searchTerm, page, size));
    }

    @GetMapping("/session/{sessionId}/search")
    public ResponseEntity<Page<CourseMaterial>> searchMaterialsBySession(
            @PathVariable Long sessionId,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(materialService.getMaterialsBySessionId(sessionId, searchTerm, page, size));
    }

    @PostMapping("/import")
    public ResponseEntity<String> importMaterials(@RequestParam("file") MultipartFile file) {
        try {
            List<CourseMaterial> materials = CourseMaterialExcelImporter.importCourseMaterials(file.getInputStream());
            materialService.saveAllFromExcel(materials);
            return ResponseEntity.ok("Materials imported successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error importing materials: " + e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportMaterials() {
        try {
            List<CourseMaterial> materials = materialService.getAllMaterials();
            ByteArrayInputStream in = materialService.exportToExcel(materials);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=materials.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(in));
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/update-positions")
    public ResponseEntity<String> updateMaterialPositions(@RequestBody List<MaterialPositionUpdateDTO> updates) {
        try {
            materialService.updateMaterialPositions(updates);
            return ResponseEntity.ok("Material positions updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating material positions: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/text")
    public ResponseEntity<String> updateTextContent(@PathVariable Long id, @RequestBody String content) {
        try {
            CourseMaterial material = materialService.getMaterialById(id);
            if (material == null) {
                return ResponseEntity.notFound().build();
            }

            if (material.getType() != CourseMaterial.MaterialType.TEXT) {
                return ResponseEntity.badRequest().body("Material is not of type TEXT");
            }

            // Save text content to file
            String fileName = "material_" + id + ".txt";
            String filePath = "data/materials/" + fileName;
            File file = new File(filePath);
            file.getParentFile().mkdirs();
            
            try (FileWriter writer = new FileWriter(file)) {
                writer.write(content);
            }

            // Update material URL
            material.setFileUrl("/data/materials/" + fileName);
            materialService.updateMaterial(material);

            return ResponseEntity.ok("Text content updated successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error updating text content: " + e.getMessage());
        }
    }
} 