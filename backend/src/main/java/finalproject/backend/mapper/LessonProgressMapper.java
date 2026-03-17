package finalproject.backend.mapper;

import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import finalproject.backend.modal.LessonProgress;
import finalproject.backend.modal.User;
import finalproject.backend.response.LessonProgressResponse;
import org.springframework.stereotype.Component;

@Component
public class LessonProgressMapper {

    public LessonProgressResponse toResponse(LessonProgress progress) {
        if (progress == null) return null;

        // Pull related entities once — avoids repeated null checks below
        Lesson lesson  = progress.getLesson();
        Course course  = lesson  != null ? lesson.getCourse()  : null;
        User   user    = progress.getUser();

        return LessonProgressResponse.builder()
                // ── Progress fields ───────────────────────────────────────────
                .id(progress.getId())
                .completed(Boolean.TRUE.equals(progress.getCompleted()))
                .completedAt(progress.getCompletedAt())
                // Default 0 so the frontend never has to null-check these numbers
                .scrollPct(progress.getScrollPct()        != null ? progress.getScrollPct()        : 0)
                .readTimeSeconds(progress.getReadTimeSeconds() != null ? progress.getReadTimeSeconds() : 0)
                .pdfDownloaded(Boolean.TRUE.equals(progress.getPdfDownloaded()))
                .pdfDownloadedAt(progress.getPdfDownloadedAt())
                // ── Timestamps ────────────────────────────────────────────────
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                // ── User ──────────────────────────────────────────────────────
                .userId(user   != null ? user.getId()       : null)
                .username(user != null ? user.getUsername() : null)
                // ── Lesson ────────────────────────────────────────────────────
                .lessonId(lesson    != null ? lesson.getId()    : null)
                .lessonTitle(lesson != null ? lesson.getTitle() : null)
                // ── Course ────────────────────────────────────────────────────
                .courseId(course    != null ? course.getId()    : null)
                .courseTitle(course != null ? course.getTitle() : null)
                .build();
    }
}