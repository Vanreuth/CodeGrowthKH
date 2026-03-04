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
public class LessonProgressResponse {

    private Long id;
    private boolean completed;
    private LocalDateTime completedAt;
    private int scrollPct;
    private int readTimeSeconds;
    private boolean pdfDownloaded;
    private LocalDateTime pdfDownloadedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User
    private Long userId;
    private String username;

    // Lesson
    private Long lessonId;
    private String lessonTitle;

    // Course (derived from lesson → chapter → course)
    private Long courseId;
    private String courseTitle;
}



