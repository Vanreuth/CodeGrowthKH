package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.ChapterMapper;
import finalproject.backend.mapper.CourseMapper;
import finalproject.backend.mapper.LessonMapper;
import finalproject.backend.modal.Category;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.CourseLevel;
import finalproject.backend.modal.CourseStatus;
import finalproject.backend.modal.Lesson;
import finalproject.backend.modal.User;
import finalproject.backend.repository.CategoryRepository;
import finalproject.backend.repository.CoursePdfExportRepository;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.repository.LessonProgressRepository;
import finalproject.backend.repository.LessonRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.request.CourseRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CourseResponse;
import finalproject.backend.response.InstructorStatsResponse;
import finalproject.backend.response.LessonResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.service.CourseService;
import finalproject.backend.service.R2StorageService;
import finalproject.backend.util.RoleUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
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
    private final LessonProgressRepository lessonProgressRepository;
    private final CoursePdfExportRepository coursePdfExportRepository;
    private final R2StorageService r2StorageService;

    @Override
    @Transactional
    public ApiResponse<CourseResponse> createCourse(CourseRequest request, MultipartFile thumbnail) {
        // Manual validation (replaces @Valid on multipart endpoint)
        if (request.getTitle() == null || request.getTitle().isBlank())
            throw new CustomMessageException("Course title is required", "400");
        if (request.getCategoryId() == null)
            throw new CustomMessageException("Category ID is required", "400");

        User currentUser = getCurrentUser();
        request.setInstructorId(currentUser.getId());

        // Auto-generate slug from title if not provided
        if (request.getSlug() == null || request.getSlug().isBlank()) {
            request.setSlug(generateSlug(request.getTitle()));
        }

        if (courseRepository.existsByTitle(request.getTitle()))
            throw new CustomMessageException("Course title already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if (courseRepository.existsBySlug(request.getSlug()))
            throw new CustomMessageException("Course slug already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        User instructor = currentUser;
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
    public PageResponse<CourseResponse> getAllCourses(
            Pageable pageable,
            String  search,
            String  status,
            String  level,
            Long    categoryId,
            Boolean isFeatured,
            Boolean isFree) {

        Specification<Course> spec = Specification
                .where(searchByTitleOrSlug(search))
                .and(hasStatus(status))
                .and(hasLevel(level))
                .and(hasCategory(categoryId))
                .and(isFeatured(isFeatured))
                .and(isFree(isFree));

        if (isAuthenticatedInstructor() && !isCurrentUserAdmin()) {
            spec = spec.and(hasInstructor(getCurrentUserId()));
        }

        Page<Course> page = courseRepository.findAll(spec, pageable);
        return PageResponse.of(page.map(courseMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getInstructorCourses(
            Pageable pageable,
            String search,
            String status,
            String level,
            Long categoryId,
            Boolean isFeatured,
            Boolean isFree) {
        return getAllCourses(pageable, search, status, level, categoryId, isFeatured, isFree);
    }

    // ─── Specifications ───────────────────────────────────────────────────────

    private Specification<Course> searchByTitleOrSlug(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;
            String like = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), like),
                    cb.like(cb.lower(root.get("slug")),  like)
            );
        };
    }

    private Specification<Course> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            try {
                return cb.equal(root.get("status"), CourseStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return null; // invalid status → ignored
            }
        };
    }

    private Specification<Course> hasLevel(String level) {
        return (root, query, cb) -> {
            if (level == null || level.isBlank()) return null;
            try {
                return cb.equal(root.get("level"), CourseLevel.valueOf(level.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    private Specification<Course> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    private Specification<Course> isFeatured(Boolean isFeatured) {
        return (root, query, cb) -> {
            if (isFeatured == null) return null;
            return cb.equal(root.get("isFeatured"), isFeatured);
        };
    }

    private Specification<Course> isFree(Boolean isFree) {
        return (root, query, cb) -> {
            if (isFree == null) return null;
            return cb.equal(root.get("isFree"), isFree);
        };
    }

    private Specification<Course> hasInstructor(Long instructorId) {
        return (root, query, cb) -> {
            if (instructorId == null) return null;
            return cb.equal(root.get("instructor").get("id"), instructorId);
        };
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
                courseRepository.findByIsFeaturedTrueAndStatus(CourseStatus.PUBLISHED, pageable)
                        .map(courseMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> getComingSoonCourses(Pageable pageable) {
        return PageResponse.of(
                courseRepository.findByStatus(CourseStatus.COMING_SOON, pageable)
                        .map(courseMapper::toResponse));
    }

    @Override
    @Transactional
    public ApiResponse<CourseResponse> updateCourse(Long id, CourseRequest request, MultipartFile thumbnail) {
        Course course = findCourseOrThrow(id);
        validateCourseOwnership(course);

        // Auto-generate slug from title if slug is not provided but title changed
        if ((request.getSlug() == null || request.getSlug().isBlank())
                && request.getTitle() != null && !request.getTitle().isBlank()) {
            request.setSlug(generateSlug(request.getTitle()));
        }

        if (request.getTitle() != null && !request.getTitle().equals(course.getTitle())
                && courseRepository.existsByTitle(request.getTitle()))
            throw new CustomMessageException("Course title already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if (request.getSlug() != null && !request.getSlug().equals(course.getSlug())
                && courseRepository.existsBySlug(request.getSlug()))
            throw new CustomMessageException("Course slug already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        User instructor = isCurrentUserAdmin() && request.getInstructorId() != null
            ? findInstructorOrThrow(request.getInstructorId())
            : null;

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
        validateCourseOwnership(course);

        // 1) Delete all lesson-progress records that reference this course's lessons
        lessonProgressRepository.deleteByCourseId(id);

        // 2) Delete PDF export metadata if it exists
        if (coursePdfExportRepository.existsByCourseId(id)) {
            coursePdfExportRepository.deleteByCourseId(id);
        }

        // 3) Delete thumbnail from R2 storage
        String thumb = course.getThumbnail();
        if (thumb != null && !thumb.isBlank()) {
            try { r2StorageService.deleteFile(thumb); }
            catch (Exception e) { log.warn("R2 thumbnail delete failed for course id={}: {}", id, e.getMessage()); }
        }

        // 4) Delete course (cascades to chapters → lessons → code_snippets)
        courseRepository.delete(course);
        log.info("Deleted course id={}", id);
        return ApiResponse.success("Course deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CourseResponse> getInstructorCourseById(Long id) {
        Course course = findCourseOrThrow(id);
        validateCourseOwnership(course);
        return ApiResponse.success(courseMapper.toResponse(course), "Instructor course retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<InstructorStatsResponse> getInstructorStats() {
        List<Course> courses = isCurrentUserAdmin()
                ? courseRepository.findAll()
                : courseRepository.findAllByInstructorId(getCurrentUserId());

        long totalStudents = 0L;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Course course : courses) {
            long enrolledCount = lessonProgressRepository.countDistinctUsersByCourseId(course.getId());
            totalStudents += enrolledCount;

            BigDecimal price = Boolean.TRUE.equals(course.getIsFree())
                    ? BigDecimal.ZERO
                    : (course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO);

            totalRevenue = totalRevenue.add(price.multiply(BigDecimal.valueOf(enrolledCount)));
        }

        InstructorStatsResponse stats = InstructorStatsResponse.builder()
                .totalCourses(courses.size())
                .totalStudents(totalStudents)
                .totalRevenue(totalRevenue)
                .build();

        return ApiResponse.success(stats, "Instructor stats retrieved successfully");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolve the current authenticated user's ID from the security context.
     */
    private Long getCurrentUserId() {
        return getCurrentUser().getId();
        }

        private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            throw new CustomMessageException(
                "Authentication required",
                String.valueOf(HttpStatus.UNAUTHORIZED.value()));
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
            .or(() -> userRepository.findByEmail(username))
            .orElseThrow(() -> new CustomMessageException(
                "Authenticated user not found",
                String.valueOf(HttpStatus.UNAUTHORIZED.value())));
    }

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


    private String generateSlug(String title) {
        if (title == null) return "course-" + UUID.randomUUID().toString().substring(0, 8);

        String slug = title
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s\\-\u1780-\u17FF\u19E0-\u19FF]", "") // ✅ keep Khmer unicode
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (slug.isBlank()) {
            slug = "course-" + UUID.randomUUID().toString().substring(0, 8);
        }

        return ensureUniqueSlug(slug);
    }
    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (courseRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private void validateCourseOwnership(Course course) {
        if (isCurrentUserAdmin()) {
            return;
        }

        Long currentUserId = getCurrentUserId();
        Long instructorId = course.getInstructor() != null ? course.getInstructor().getId() : null;

        if (instructorId == null || !instructorId.equals(currentUserId)) {
            throw new CustomMessageException(
                    "You can only manage your own courses",
                    String.valueOf(HttpStatus.FORBIDDEN.value()));
        }
    }

    private boolean isAuthenticatedInstructor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return false;
        }

        return authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals(RoleUtil.ROLE_INSTRUCTOR));
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return false;
        }

        return authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals(RoleUtil.ROLE_ADMIN));
    }
}
