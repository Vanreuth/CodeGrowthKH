package finalproject.backend.service;

import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonProgressResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LessonProgressService {

    /** Create or update progress for a lesson. */
    ApiResponse<LessonProgressResponse> upsertProgress(LessonProgressRequest request);

    /** Mark a lesson as 100 % completed for the given user. */
    ApiResponse<LessonProgressResponse> markCompleted(Long userId, Long lessonId);

    /** Get progress for a specific user + lesson pair. */
    ApiResponse<LessonProgressResponse> getProgress(Long userId, Long lessonId);

    /** Get all lesson progress records for a user. */
    ApiResponse<List<LessonProgressResponse>> getProgressByUser(Long userId);

    /** Get all lesson progress records for a user within a specific course. */
    ApiResponse<List<LessonProgressResponse>> getProgressByCourseAndUser(Long courseId, Long userId);

    /** Count how many lessons a user has completed (globally). */
    ApiResponse<Long> countCompletedByUser(Long userId);

    /** Count how many lessons a user has completed in a specific course. */
    ApiResponse<Long> countCompletedByCourseAndUser(Long courseId, Long userId);

    /** Delete a progress record (admin or owner only). */
    ApiResponse<Void> deleteProgress(Long userId, Long lessonId);
}



