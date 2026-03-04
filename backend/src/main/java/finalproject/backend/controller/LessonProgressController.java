package finalproject.backend.controller;

import finalproject.backend.modal.User;
import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonProgressResponse;
import finalproject.backend.service.LessonProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lesson-progress")
@RequiredArgsConstructor
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getAuthenticatedUserId(Authentication authentication) {
        return ((User) authentication.getPrincipal()).getId();
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/lesson-progress
     * Save or update scroll position, reading time, completion, PDF download status.
     * userId is injected from the JWT — clients do NOT send userId.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LessonProgressResponse>> upsertProgress(
            Authentication authentication,
            @Valid @RequestBody LessonProgressRequest request) {
        request.setUserId(getAuthenticatedUserId(authentication));
        return ResponseEntity.ok(lessonProgressService.upsertProgress(request));
    }

    /**
     * POST /api/v1/lesson-progress/complete?lessonId={id}
     * Mark a specific lesson as completed for the authenticated user.
     */
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<LessonProgressResponse>> markCompleted(
            Authentication authentication,
            @RequestParam Long lessonId) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.markCompleted(userId, lessonId));
    }

    /**
     * DELETE /api/v1/lesson-progress?lessonId={id}
     * Delete progress record for the authenticated user and given lesson.
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteProgress(
            Authentication authentication,
            @RequestParam Long lessonId) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.deleteProgress(userId, lessonId));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/lesson-progress?lessonId={id}
     * Get progress for the authenticated user on a specific lesson.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<LessonProgressResponse>> getProgress(
            Authentication authentication,
            @RequestParam Long lessonId) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.getProgress(userId, lessonId));
    }

    /**
     * GET /api/v1/lesson-progress/me
     * Get all progress records for the authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<LessonProgressResponse>>> getMyProgress(
            Authentication authentication) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.getProgressByUser(userId));
    }

    /**
     * GET /api/v1/lesson-progress/course/{courseId}
     * Get all progress records for the authenticated user within a course.
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<LessonProgressResponse>>> getProgressByCourse(
            Authentication authentication,
            @PathVariable Long courseId) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.getProgressByCourseAndUser(courseId, userId));
    }

    /**
     * GET /api/v1/lesson-progress/me/completed-count
     * Count completed lessons globally for the authenticated user.
     */
    @GetMapping("/me/completed-count")
    public ResponseEntity<ApiResponse<Long>> countCompleted(Authentication authentication) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.countCompletedByUser(userId));
    }

    /**
     * GET /api/v1/lesson-progress/course/{courseId}/completed-count
     * Count completed lessons in a specific course for the authenticated user.
     */
    @GetMapping("/course/{courseId}/completed-count")
    public ResponseEntity<ApiResponse<Long>> countCompletedByCourse(
            Authentication authentication,
            @PathVariable Long courseId) {
        Long userId = getAuthenticatedUserId(authentication);
        return ResponseEntity.ok(lessonProgressService.countCompletedByCourseAndUser(courseId, userId));
    }
}


