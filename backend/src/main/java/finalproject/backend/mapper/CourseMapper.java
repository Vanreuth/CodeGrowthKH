package finalproject.backend.mapper;

import finalproject.backend.modal.Category;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.User;
import finalproject.backend.repository.LessonProgressRepository;
import finalproject.backend.request.CourseRequest;
import finalproject.backend.response.CourseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final LessonProgressRepository lessonProgressRepository;

    public CourseResponse toResponse(Course course) {
        long enrolled = course.getId() != null
                ? lessonProgressRepository.countDistinctUsersByCourseId(course.getId())
                : 0L;
        long views = course.getViewCount() != null ? course.getViewCount() : 0L;

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .thumbnail(course.getThumbnail())
                .requirements(course.getRequirements())
                .level(course.getLevel())
                .language(course.getLanguage())
                .status(course.getStatus())
                .isFeatured(course.getIsFeatured())
                .isFree(course.getIsFree())
                .totalLessons(course.getTotalLessons())
                .avgRating(course.getAvgRating())
                .viewCount(views)
                .enrolledCount(enrolled)
                .pdfUrl(course.getPdfUrl())
                .pdfName(course.getPdfName())
                .pdfSizeKb(course.getPdfSizeKb())
                .pdfUpdatedAt(course.getPdfUpdatedAt())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .publishedAt(course.getPublishedAt())
                .launchDate(course.getLaunchDate())
                .instructorId(course.getInstructor() != null ? course.getInstructor().getId() : null)
                .instructorName(course.getInstructor() != null ? course.getInstructor().getUsername() : null)
                .categoryId(course.getCategory() != null ? course.getCategory().getId() : 0)
                .categoryName(course.getCategory() != null ? course.getCategory().getName() : null)
                .build();
    }

    public Course toEntity(CourseRequest request, User instructor, Category category) {
        return Course.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .level(request.getLevel())
                .language(request.getLanguage())
                .status(request.getStatus())
                .isFeatured(request.getFeatured())
                .isFree(request.getFree())
                .launchDate(request.getLaunchDate())
                .instructor(instructor)
                .category(category)
                .build();
    }

    public void updateEntity(CourseRequest request, Course course, User instructor, Category category) {
        if (request.getTitle() != null && !request.getTitle().isBlank())
            course.setTitle(request.getTitle());

        if (request.getSlug() != null && !request.getSlug().isBlank())
            course.setSlug(request.getSlug());

        if (request.getDescription() != null && !request.getDescription().isBlank())
            course.setDescription(request.getDescription());

        if (request.getRequirements() != null)
            course.setRequirements(request.getRequirements());

        if (request.getLevel() != null && !request.getLevel().isBlank())
            course.setLevel(request.getLevel());

        if (request.getLanguage() != null && !request.getLanguage().isBlank())
            course.setLanguage(request.getLanguage());

        if (request.getStatus() != null && !request.getStatus().isBlank())
            course.setStatus(request.getStatus());

        course.setIsFeatured(request.getFeatured());
        course.setIsFree(request.getFree());

        // launchDate: always overwrite (null = clear it, value = set it)
        course.setLaunchDate(request.getLaunchDate());

        if (instructor != null)
            course.setInstructor(instructor);

        if (category != null)
            course.setCategory(category);
    }
}
