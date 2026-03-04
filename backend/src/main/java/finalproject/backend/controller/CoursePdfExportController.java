package finalproject.backend.controller;

import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CoursePdfExportResponse;
import finalproject.backend.service.CoursePdfExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course/pdf")
@RequiredArgsConstructor
public class CoursePdfExportController {

    private final CoursePdfExportService coursePdfExportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoursePdfExportResponse>>> getAllCoursePdfs() {
        return ResponseEntity.ok(coursePdfExportService.getAllCoursePdfs());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CoursePdfExportResponse>> getPdfExportByCourse(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.getPdfExportByCourse(courseId));
    }

    @PostMapping("/{courseId}/download")
    public ResponseEntity<ApiResponse<CoursePdfExportResponse>> incrementDownloadCount(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.incrementDownloadCount(courseId));
    }

    @PostMapping("/{courseId}/generate")
    public ResponseEntity<ApiResponse<CoursePdfExportResponse>> generate(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.generatePdf(courseId));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deletePdfExport(@PathVariable Long courseId) {
        return ResponseEntity.ok(coursePdfExportService.deletePdfExport(courseId));
    }
}

