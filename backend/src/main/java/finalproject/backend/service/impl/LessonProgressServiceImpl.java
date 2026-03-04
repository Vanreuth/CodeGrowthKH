package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.LessonProgressMapper;
import finalproject.backend.modal.Lesson;
import finalproject.backend.modal.LessonProgress;
import finalproject.backend.modal.User;
import finalproject.backend.repository.LessonProgressRepository;
import finalproject.backend.repository.LessonRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.request.LessonProgressRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.LessonProgressResponse;
import finalproject.backend.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressServiceImpl implements LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository         lessonRepository;
    private final UserRepository           userRepository;
    private final LessonProgressMapper     lessonProgressMapper;

    // ─────────────────────────────────────────────────────────────────────────
    //  Write operations
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<LessonProgressResponse> upsertProgress(LessonProgressRequest request) {
        User   user   = findUserOrThrow(request.getUserId());
        Lesson lesson = findLessonOrThrow(request.getLessonId());

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(request.getUserId(), request.getLessonId())
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());

        // Scroll position
        progress.setScrollPct(request.getScrollPct());

        // Accumulate reading time (never let it become negative)
        int current = progress.getReadTimeSeconds() != null ? progress.getReadTimeSeconds() : 0;
        progress.setReadTimeSeconds(current + Math.max(0, request.getReadTimeSeconds()));

        // Mark completed once (idempotent)
        if (request.isCompleted() && !Boolean.TRUE.equals(progress.getCompleted())) {
            progress.markCompleted();
        }

        // PDF downloaded flag (idempotent)
        if (request.isPdfDownloaded() && !Boolean.TRUE.equals(progress.getPdfDownloaded())) {
            progress.setPdfDownloaded(true);
            progress.setPdfDownloadedAt(LocalDateTime.now());
        }

        LessonProgress saved = lessonProgressRepository.save(progress);
        log.info("Upserted progress id={} user={} lesson={}", saved.getId(), user.getId(), lesson.getId());
        return ApiResponse.success(lessonProgressMapper.toResponse(saved), "Progress saved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<LessonProgressResponse> markCompleted(Long userId, Long lessonId) {
        User   user   = findUserOrThrow(userId);
        Lesson lesson = findLessonOrThrow(lessonId);

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());

        if (Boolean.TRUE.equals(progress.getCompleted())) {
            // Already completed — just return without re-saving
            return ApiResponse.success(lessonProgressMapper.toResponse(progress),
                    "Lesson was already completed");
        }

        progress.markCompleted();
        LessonProgress saved = lessonProgressRepository.save(progress);
        log.info("Marked lesson id={} completed for user id={}", lessonId, userId);
        return ApiResponse.success(lessonProgressMapper.toResponse(saved), "Lesson marked as completed");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteProgress(Long userId, Long lessonId) {
        if (!lessonProgressRepository.existsByUserIdAndLessonId(userId, lessonId)) {
            throw new CustomMessageException(
                    "Progress not found for user id: " + userId + " and lesson id: " + lessonId,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));
        }
        lessonProgressRepository.deleteByUserIdAndLessonId(userId, lessonId);
        log.info("Deleted progress for user id={} lesson id={}", userId, lessonId);
        return ApiResponse.success("Progress deleted successfully");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Read operations
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LessonProgressResponse> getProgress(Long userId, Long lessonId) {
        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new CustomMessageException(
                        "Progress not found for user id: " + userId + " and lesson id: " + lessonId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(lessonProgressMapper.toResponse(progress), "Progress retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<LessonProgressResponse>> getProgressByUser(Long userId) {
        ensureUserExists(userId);
        List<LessonProgressResponse> list = lessonProgressRepository.findByUserId(userId)
                .stream()
                .map(lessonProgressMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(list, "Progress list retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<LessonProgressResponse>> getProgressByCourseAndUser(Long courseId, Long userId) {
        ensureUserExists(userId);
        List<LessonProgressResponse> list = lessonProgressRepository.findByCourseIdAndUserId(courseId, userId)
                .stream()
                .map(lessonProgressMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(list, "Course progress retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countCompletedByUser(Long userId) {
        ensureUserExists(userId);
        long count = lessonProgressRepository.countCompletedByUserId(userId);
        return ApiResponse.success(count, "Completed lesson count retrieved");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Long> countCompletedByCourseAndUser(Long courseId, Long userId) {
        ensureUserExists(userId);
        long count = lessonProgressRepository.countCompletedByCourseIdAndUserId(courseId, userId);
        return ApiResponse.success(count, "Completed lesson count for course retrieved");
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "User not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Lesson findLessonOrThrow(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Lesson not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private void ensureUserExists(Long id) {
        if (!userRepository.existsById(id))
            throw new CustomMessageException("User not found with id: " + id,
                    String.valueOf(HttpStatus.NOT_FOUND.value()));
    }
}

