package finalproject.backend.controller;

import finalproject.backend.request.CourseRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CourseResponse;
import finalproject.backend.response.LessonResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<CourseResponse> courses = courseService.getAllCourses(pageable);
        return ResponseEntity.ok(ApiResponse.success(courses, "Courses retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug));
    }

    @GetMapping("/slug/{slug}/full")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseWithChapters(
            @PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseWithChapters(slug));
    }

    @GetMapping("/slug/{courseSlug}/lessons/{lessonSlug}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLessonBySlug(
            @PathVariable String courseSlug,
            @PathVariable String lessonSlug) {
        return ResponseEntity.ok(courseService.getLessonBySlug(courseSlug, lessonSlug));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getCoursesByCategory(
            @PathVariable int categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<CourseResponse> courses = courseService.getCoursesByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(courses, "Courses retrieved successfully"));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getCoursesByInstructor(
            @PathVariable Long instructorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<CourseResponse> courses = courseService.getCoursesByInstructor(instructorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(courses, "Courses retrieved successfully"));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getFeaturedCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(
                ApiResponse.success(courseService.getFeaturedCourses(pageable),
                        "Featured courses retrieved successfully"));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getComingSoonCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // default sort: launchDate ascending (soonest first)
        Pageable pageable = PageRequest.of(page, size, Sort.by("launchDate").ascending());
        return ResponseEntity.ok(
                ApiResponse.success(courseService.getComingSoonCourses(pageable),
                        "Coming soon courses retrieved successfully"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @ModelAttribute CourseRequest request,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(courseService.createCourse(request, thumbnail));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @ModelAttribute CourseRequest request,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ResponseEntity.ok(courseService.updateCourse(id, request, thumbnail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.deleteCourse(id));
    }
}
