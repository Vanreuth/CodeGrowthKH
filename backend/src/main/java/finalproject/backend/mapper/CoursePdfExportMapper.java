package finalproject.backend.mapper;

import finalproject.backend.modal.Category;
import finalproject.backend.modal.CoursePdfExport;
import finalproject.backend.response.CoursePdfExportResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class CoursePdfExportMapper {

    public CoursePdfExportResponse toResponse(CoursePdfExport export) {
        List<Integer> categoryIds = export.getCourse() != null && export.getCourse().getCategories() != null
                ? export.getCourse().getCategories().stream()
                .map(Category::getId)
                .toList()
                : Collections.emptyList();

        List<String> categoryNames = export.getCourse() != null && export.getCourse().getCategories() != null
                ? export.getCourse().getCategories().stream()
                .map(Category::getName)
                .toList()
                : Collections.emptyList();

        return CoursePdfExportResponse.builder()
                .id(export.getId())
                .pdfUrl(export.getPdfUrl())
                .pdfName(export.getPdfName())
                .pdfSizeKb(export.getPdfSizeKb())
                .totalPages(export.getTotalPages())
                .totalLessonsIncluded(export.getTotalLessonsIncluded())
                .downloadCount(export.getDownloadCount())
                .generatedAt(export.getGeneratedAt())
                .createdAt(export.getCreatedAt())
                .courseId(export.getCourse() != null ? export.getCourse().getId() : null)
                .courseTitle(export.getCourse() != null ? export.getCourse().getTitle() : null)
                .thumbnail(export.getCourse() != null ? export.getCourse().getThumbnail() : null)
                .level(export.getCourse() != null && export.getCourse().getLevel() != null ? export.getCourse().getLevel().name() : null)
                .categoryIds(categoryIds)
                .categoryNames(categoryNames)
                .build();
    }
}

