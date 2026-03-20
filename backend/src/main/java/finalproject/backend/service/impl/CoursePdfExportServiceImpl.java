package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.CoursePdfExportMapper;
import finalproject.backend.modal.*;
import finalproject.backend.repository.CoursePdfExportRepository;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CoursePdfExportResponse;
import finalproject.backend.service.CoursePdfExportService;
import finalproject.backend.service.CoursePdfGeneratorService;
import finalproject.backend.service.R2StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoursePdfExportServiceImpl implements CoursePdfExportService {

    private final CoursePdfExportRepository pdfExportRepository;
    private final CourseRepository          courseRepository;
    private final CoursePdfExportMapper     pdfExportMapper;
    private final CoursePdfGeneratorService pdfGeneratorService;
    private final R2StorageService          r2StorageService;

    // ── GET ALL ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CoursePdfExportResponse>> getAllCoursePdfs(
            String search,
            String status,
            String level,
            Long categoryId) {
        List<Course> courses = courseRepository.findAll()
                .stream()
                .filter(course -> matchesSearch(course, search))
                .filter(course -> matchesStatus(course, status))
                .filter(course -> matchesLevel(course, level))
                .filter(course -> matchesCategory(course, categoryId))
                .sorted(Comparator
                        .comparing(Course::getOrderIndex, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        Map<Long, CoursePdfExport> exportByCourseId = pdfExportRepository.findAll()
                .stream()
                .filter(e -> e.getCourse() != null && e.getCourse().getId() != null)
                .collect(Collectors.toMap(
                        e -> e.getCourse().getId(),
                        Function.identity(),
                        (a, b) -> a));

        List<CoursePdfExportResponse> rows = courses.stream()
                .map(course -> {
                    CoursePdfExport e = exportByCourseId.get(course.getId());
                    return CoursePdfExportResponse.builder()
                            .id(e != null ? e.getId() : null)
                            .pdfUrl(e != null ? e.getPdfUrl() : null)
                            .pdfName(e != null ? e.getPdfName() : null)
                            .pdfSizeKb(e != null ? e.getPdfSizeKb() : null)
                            .totalPages(e != null && e.getTotalPages() != null ? e.getTotalPages() : 0)
                            .totalLessonsIncluded(e != null && e.getTotalLessonsIncluded() != null ? e.getTotalLessonsIncluded() : 0)
                            .downloadCount(e != null && e.getDownloadCount() != null ? e.getDownloadCount() : 0)
                            .generatedAt(e != null ? e.getGeneratedAt() : null)
                            .createdAt(e != null ? e.getCreatedAt() : null)
                            .courseId(course.getId())
                            .courseTitle(course.getTitle())
                            .thumbnail(course.getThumbnail())
                            .level(course.getLevel() != null ? course.getLevel().name() : null)
                            .categoryIds(course.getCategories() != null
                                    ? course.getCategories().stream().map(Category::getId).toList()
                                    : Collections.emptyList())
                            .categoryNames(course.getCategories() != null
                                    ? course.getCategories().stream().map(Category::getName).toList()
                                    : Collections.emptyList())
                            .build();
                })
                .toList();

        return ApiResponse.success(rows, "Course PDF list retrieved successfully");
    }

    // ── GET ONE ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CoursePdfExportResponse> getPdfExportByCourse(Long courseId) {
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "PDF export not found for course id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(
                pdfExportMapper.toResponse(export),
                "PDF export retrieved successfully");
    }

    // ── SAVE (upsert) ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<CoursePdfExportResponse> savePdfExport(Long courseId, String pdfUrl,
                                                              String pdfName, Long pdfSizeKb,
                                                              int totalPages, int totalLessonsIncluded) {
        Course course = findCourseOrThrow(courseId);

        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseGet(() -> CoursePdfExport.builder().course(course).build());

        export.setPdfUrl(pdfUrl);
        export.setPdfName(pdfName);
        export.setPdfSizeKb(pdfSizeKb);
        export.setTotalPages(totalPages);
        export.setTotalLessonsIncluded(totalLessonsIncluded);
        export.setGeneratedAt(LocalDateTime.now());

        CoursePdfExport saved = pdfExportRepository.save(export);
        log.info("Saved PDF export for courseId={}", courseId);
        return ApiResponse.success(
                pdfExportMapper.toResponse(saved),
                "PDF export saved successfully");
    }

    // ── GENERATE ──────────────────────────────────────────────────────────────

    /**
     * Generates a PDF for the given course and uploads it to Cloudflare R2.
     *
     * Flow:
     *  1. Load course with all chapters + lessons
     *  2. Generate PDF bytes via CoursePdfGeneratorService (Playwright)
     *  3. Upload to R2 using uploadPdf() — returns CDN URL:
     *       https://cdn.codegrowthkh.site/course-pdfs/{uuid}-{slug}.pdf
     *  4. If a previous PDF exists, delete it from R2 first
     *  5. Upsert CoursePdfExport record with the new CDN URL
     */
    @Override
    @Transactional
    public ApiResponse<CoursePdfExportResponse> generatePdf(Long courseId) {
        Course course = findCourseOrThrow(courseId);

        log.info("📄 Generating PDF for courseId={} slug='{}'", courseId, course.getSlug());

        // ── 1. Generate PDF bytes ─────────────────────────────────────────────
        byte[] pdfBytes = pdfGeneratorService.generate(course);
        long sizeKb = pdfBytes.length / 1024;
        log.info("📦 PDF generated — {} KB for courseId={}", sizeKb, courseId);

        // ── 2. Build a human-readable PDF filename from the course title ──────
        //      e.g. "Java-ខ្មែរ.pdf"
        String pdfName = buildPdfName(course);

        // ── 3. Upload to R2 via uploadPdf() ──────────────────────────────────
        //      Returns: https://cdn.codegrowthkh.site/course-pdfs/{uuid}-{slug}.pdf
        String uploadedPdfUrl = r2StorageService.uploadPdf(pdfBytes, course.getSlug());
        // ── 4. Load or create the export record ───────────────────────────────
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseGet(() -> CoursePdfExport.builder().course(course).build());

        String newPdfUrl = appendVersion(uploadedPdfUrl, export.getPdfUrl());
        log.info("☁️  PDF uploaded to R2 → {}", newPdfUrl);

        // ── 5. Delete old R2 object if regenerating ───────────────────────────
        deleteOldPdfIfExists(export.getPdfUrl(), newPdfUrl);

        // ── 6. Count total lessons across all chapters ────────────────────────
        int totalLessons = course.getChapters() == null ? 0 :
                course.getChapters().stream()
                        .filter(ch -> ch.getLessons() != null)
                        .mapToInt(ch -> ch.getLessons().size())
                        .sum();

        // ── 7. Persist metadata ───────────────────────────────────────────────
        export.setPdfName(pdfName);
        export.setPdfUrl(newPdfUrl);               // ← CDN URL stored in DB
        export.setPdfSizeKb(sizeKb);
        export.setTotalPages(0);                   // update if you add page counting
        export.setTotalLessonsIncluded(totalLessons);
        export.setGeneratedAt(LocalDateTime.now());

        CoursePdfExport saved = pdfExportRepository.save(export);
        log.info("✅ PDF export record saved — courseId={} url={}", courseId, newPdfUrl);

        return ApiResponse.success(
                pdfExportMapper.toResponse(saved),
                "PDF generated successfully");
    }

    // ── INCREMENT DOWNLOAD ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<CoursePdfExportResponse> incrementDownloadCount(Long courseId) {
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "PDF export not found for course id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));

        int newCount = export.getDownloadCount() == null ? 1 : export.getDownloadCount() + 1;
        export.setDownloadCount(newCount);

        CoursePdfExport saved = pdfExportRepository.save(export);
        log.info("📥 Download count for courseId={} → {}", courseId, saved.getDownloadCount());

        return ApiResponse.success(
                pdfExportMapper.toResponse(saved),
                "Download count updated");
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<Void> deletePdfExport(Long courseId) {
        CoursePdfExport export = pdfExportRepository.findByCourseId(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "PDF export not found for course id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));

        // Delete the actual file from R2 as well
        if (StringUtils.hasText(export.getPdfUrl())) {
            try {
                r2StorageService.deleteFile(export.getPdfUrl());
                log.info("☁️  Deleted PDF from R2: {}", export.getPdfUrl());
            } catch (Exception e) {
                log.warn("Could not delete PDF from R2 ({}): {}", export.getPdfUrl(), e.getMessage());
            }
        }

        pdfExportRepository.deleteByCourseId(courseId);
        log.info("🗑️  Deleted PDF export record for courseId={}", courseId);
        return ApiResponse.success("PDF export deleted successfully");
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private Course findCourseOrThrow(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomMessageException(
                        "Course not found with id: " + courseId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    /**
     * Builds a readable PDF filename from the course title.
     * Keeps Khmer characters intact, replaces unsafe ASCII chars with "-".
     * e.g. "Java ខ្មែរ (Beginner)" → "Java-ខ្មែរ-Beginner-.pdf"
     */
    private String buildPdfName(Course course) {
        return course.getSlug() + ".pdf";
    }

    /**
     * Deletes the old PDF from R2 only if it exists and is different from the new one.
     * Silently swallows errors — a stale file in R2 should never block a regeneration.
     */
    private void deleteOldPdfIfExists(String oldUrl, String newUrl) {
        if (!StringUtils.hasText(oldUrl)) return;
        String oldKey = r2StorageService.extractKeyFromUrl(oldUrl);
        String newKey = r2StorageService.extractKeyFromUrl(newUrl);
        if (oldKey.equals(newKey)) return;
        try {
            r2StorageService.deleteFile(oldUrl);
            log.info("🗑️  Old PDF deleted from R2: {}", oldUrl);
        } catch (Exception e) {
            log.warn("Could not delete old PDF from R2 ({}): {}", oldUrl, e.getMessage());
        }
    }

    private String appendVersion(String pdfUrl, String previousPdfUrl) {
        if (!StringUtils.hasText(pdfUrl)) return pdfUrl;

        int nextVersion = extractVersion(previousPdfUrl) + 1;
        String separator = pdfUrl.contains("?") ? "&" : "?";
        return pdfUrl + separator + "v=" + nextVersion;
    }

    private int extractVersion(String pdfUrl) {
        if (!StringUtils.hasText(pdfUrl)) return 0;

        int queryIndex = pdfUrl.indexOf('?');
        if (queryIndex < 0 || queryIndex == pdfUrl.length() - 1) return 0;

        String query = pdfUrl.substring(queryIndex + 1);
        for (String part : query.split("&")) {
            if (!part.startsWith("v=")) continue;
            try {
                return Integer.parseInt(part.substring(2));
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        return 0;
    }

    private boolean matchesSearch(Course course, String search) {
        if (!StringUtils.hasText(search)) return true;

        String keyword = search.trim().toLowerCase();
        String title = course.getTitle() == null ? "" : course.getTitle().toLowerCase();
        String slug = course.getSlug() == null ? "" : course.getSlug().toLowerCase();
        return title.contains(keyword) || slug.contains(keyword);
    }

    private boolean matchesStatus(Course course, String status) {
        if (!StringUtils.hasText(status)) return true;

        try {
            CourseStatus expected = CourseStatus.valueOf(status.trim().toUpperCase());
            return course.getStatus() == expected;
        } catch (IllegalArgumentException ignored) {
            return true;
        }
    }

    private boolean matchesLevel(Course course, String level) {
        if (!StringUtils.hasText(level)) return true;

        try {
            CourseLevel expected = CourseLevel.valueOf(level.trim().toUpperCase());
            return course.getLevel() == expected;
        } catch (IllegalArgumentException ignored) {
            return true;
        }
    }

    private boolean matchesCategory(Course course, Long categoryId) {
        if (categoryId == null) return true;
        if (course.getCategories() == null || course.getCategories().isEmpty()) return false;

        return course.getCategories().stream()
                .anyMatch(category -> category != null && category.getId() != null && category.getId().equals(categoryId));
    }
}
