package finalproject.backend.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CoursePdfExportResponse {

    private Long id;
    private String pdfUrl;
    private String pdfName;
    private Long pdfSizeKb;
    private int totalPages;
    private int totalLessonsIncluded;
    private int downloadCount;
    private LocalDateTime generatedAt;
    private LocalDateTime createdAt;

    // Course reference
    private Long courseId;
    private String courseTitle;
    private String thumbnail;
    private String level;
}

