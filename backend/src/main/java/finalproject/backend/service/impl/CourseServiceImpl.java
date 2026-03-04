package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.ChapterMapper;
import finalproject.backend.mapper.CourseMapper;
import finalproject.backend.mapper.LessonMapper;
import finalproject.backend.modal.Category;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import finalproject.backend.modal.User;
import finalproject.backend.repository.CategoryRepository;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.repository.LessonRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.request.CourseRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.ChapterResponse;
import finalproject.backend.response.CourseResponse;
import finalproject.backend.response.LessonResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.service.CourseService;
import finalproject.backend.service.R2StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;
    private final ChapterMapper chapterMapper;
    private final LessonMapper lessonMapper;
    private final LessonRepository lessonRepository;
    private final R2StorageService r2StorageService;

    @Override
    @Transactional
    public ApiResponse<CourseResponse> createCourse(CourseRequest request, MultipartFile thumbnail) {
        // Manual validation (replaces @Valid on multipart endpoint)
        if (request.getTitle() == null || request.getTitle().isBlank())
            throw new CustomMessageException("Course title is required", "400");
        if (request.getSlug() == null || request.getSlug().isBlank())
            throw new CustomMessageException("Slug is required", "400");
        if (request.getDescription() == null || request.getDescription().isBlank())
            throw new CustomMessageException("Description is required", "400");
        if (request.getCategoryId() == null)
            throw new CustomMessageException("Category ID is required", "400");
        if (request.getInstructorId() == null)
            throw new CustomMessageException("Instructor ID is required", "400");

        if (courseRepository.existsByTitle(request.getTitle()))
            throw new CustomMessageException("Course title already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if (courseRepository.existsBySlug(request.getSlug()))
            throw new CustomMessageException("Course slug already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        User instructor = findInstructorOrThrow(request.getInstructorId());
        Category category = findCategoryOrThrow(request.getCategoryId());

        // createdAt, status, level set by @PrePersist
        Course course = courseMapper.toEntity(request, instructor, category);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                course.setThumbnail(r2StorageService.uploadFile(thumbnail, "thumbnails"));
            } catch (IOException e) {
                throw new CustomMessageException("Failed to upload thumbnail: " + e.getMessage());
            }
        }

        Course saved = courseRepository.save(course);
        log.info("Created course id={}", saved.getId());
        return ApiResponse.success(courseMapper.toResponse(saved), "Course created successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getAllCourses(Pageable pageable) {
        Page<Course> page = courseRepository.findAll(pageable);
        return PageResponse.of(page.map(courseMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CourseResponse> getCourseById(Long id) {
        Course course = findCourseOrThrow(id);
        course.setViewCount(course.getViewCount() == null ? 1L : course.getViewCount() + 1);
        courseRepository.save(course);
        return ApiResponse.success(courseMapper.toResponse(course), "Course retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CourseResponse> getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new CustomMessageException(
                        "Course not found with slug: " + slug,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));

        // Increment view count
        course.setViewCount(course.getViewCount() == null ? 1L : course.getViewCount() + 1);
        courseRepository.save(course);

        // Include nested chapters + lessons for full course page rendering
        CourseResponse response = courseMapper.toResponse(course);
        response.setChapters(course.getChapters().stream()
                .map(chapterMapper::toResponseWithLessons)
                .collect(Collectors.toList()));

        return ApiResponse.success(response, "Course retrieved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<CourseResponse> getCourseWithChapters(String slug) {
        return getCourseBySlug(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LessonResponse> getLessonBySlug(String courseSlug, String lessonSlug) {
        Lesson lesson = lessonRepository.findByCourse_SlugAndSlug(courseSlug, lessonSlug)
                .orElseThrow(() -> new CustomMessageException(
                        "Lesson not found with slug: " + lessonSlug + " in course: " + courseSlug,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(lessonMapper.toResponse(lesson), "Lesson retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getCoursesByCategory(int categoryId, Pageable pageable) {
        return PageResponse.of(courseRepository.findByCategoryId(categoryId, pageable)
                .map(courseMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getCoursesByInstructor(Long instructorId, Pageable pageable) {
        return PageResponse.of(courseRepository.findByInstructorId(instructorId, pageable)
                .map(courseMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getFeaturedCourses(Pageable pageable) {
        return PageResponse.of(
                courseRepository.findByIsFeaturedTrueAndStatus("PUBLISHED", pageable)
                        .map(courseMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getComingSoonCourses(Pageable pageable) {
        return PageResponse.of(
                courseRepository.findByStatus("COMING_SOON", pageable)
                        .map(courseMapper::toResponse));
    }

    @Override
    @Transactional
    public ApiResponse<CourseResponse> updateCourse(Long id, CourseRequest request, MultipartFile thumbnail) {
        Course course = findCourseOrThrow(id);

        if (request.getTitle() != null && !request.getTitle().equals(course.getTitle())
                && courseRepository.existsByTitle(request.getTitle()))
            throw new CustomMessageException("Course title already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if (request.getSlug() != null && !request.getSlug().equals(course.getSlug())
                && courseRepository.existsBySlug(request.getSlug()))
            throw new CustomMessageException("Course slug already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        User instructor = request.getInstructorId() != null
                ? findInstructorOrThrow(request.getInstructorId()) : null;

        Category category = request.getCategoryId() != null
                ? findCategoryOrThrow(request.getCategoryId()) : null;

        courseMapper.updateEntity(request, course, instructor, category);
        // updatedAt + publishedAt handled by @PreUpdate

        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                String old = course.getThumbnail();
                if (old != null && !old.isBlank()) r2StorageService.deleteFile(old);
                course.setThumbnail(r2StorageService.uploadFile(thumbnail, "thumbnails"));
            } catch (IOException e) {
                throw new CustomMessageException("Failed to upload thumbnail: " + e.getMessage());
            }
        }

        Course saved = courseRepository.save(course);
        log.info("Updated course id={}", id);
        return ApiResponse.success(courseMapper.toResponse(saved), "Course updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteCourse(Long id) {
        Course course = findCourseOrThrow(id);
        String thumb = course.getThumbnail();
        if (thumb != null && !thumb.isBlank()) {
            try { r2StorageService.deleteFile(thumb); }
            catch (Exception e) { log.warn("R2 thumbnail delete failed for course id={}: {}", id, e.getMessage()); }
        }
        courseRepository.delete(course);
        log.info("Deleted course id={}", id);
        return ApiResponse.success("Course deleted successfully");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Course not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private User findInstructorOrThrow(Long instructorId) {
        return userRepository.findById(instructorId)
                .orElseThrow(() -> new CustomMessageException(
                        "Instructor not found with id: " + instructorId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }

    private Category findCategoryOrThrow(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CustomMessageException(
                        "Category not found with id: " + categoryId,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }
}
