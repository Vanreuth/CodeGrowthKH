package finalproject.backend.mapper;

import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import finalproject.backend.modal.LessonProgress;
import finalproject.backend.response.LessonProgressResponse;
import org.springframework.stereotype.Component;

@Component
public class LessonProgressMapper {

    public LessonProgressResponse toResponse(LessonProgress progress) {
        Lesson lesson = progress.getLesson();
        Course course = lesson != null ? lesson.getCourse() : null;

        return LessonProgressResponse.builder()
                .id(progress.getId())
                .completed(Boolean.TRUE.equals(progress.getCompleted()))
                .completedAt(progress.getCompletedAt())
                .scrollPct(progress.getScrollPct() != null ? progress.getScrollPct() : 0)
                .readTimeSeconds(progress.getReadTimeSeconds() != null ? progress.getReadTimeSeconds() : 0)
                .pdfDownloaded(Boolean.TRUE.equals(progress.getPdfDownloaded()))
                .pdfDownloadedAt(progress.getPdfDownloadedAt())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .userId(progress.getUser()    != null ? progress.getUser().getId()       : null)
                .username(progress.getUser()  != null ? progress.getUser().getUsername() : null)
                .lessonId(lesson  != null ? lesson.getId()    : null)
                .lessonTitle(lesson != null ? lesson.getTitle() : null)
                .courseId(course  != null ? course.getId()    : null)
                .courseTitle(course != null ? course.getTitle() : null)
                .build();
    }
}




