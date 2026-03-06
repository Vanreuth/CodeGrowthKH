package finalproject.backend.mapper;

import finalproject.backend.modal.CoursePdfExport;
import finalproject.backend.response.CoursePdfExportResponse;
import org.springframework.stereotype.Component;

@Component
public class CoursePdfExportMapper {

    public CoursePdfExportResponse toResponse(CoursePdfExport export) {
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
                .build();
    }
}

