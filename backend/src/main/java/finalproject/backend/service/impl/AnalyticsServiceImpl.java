package finalproject.backend.service.impl;

import finalproject.backend.mapper.CourseMapper;
import finalproject.backend.mapper.UserMapper;
import finalproject.backend.modal.Category;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.User;
import finalproject.backend.repository.CategoryRepository;
import finalproject.backend.repository.CourseEnrollmentFirstSeenView;
import finalproject.backend.repository.CourseRepository;
import finalproject.backend.repository.LessonProgressRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.response.AnalyticsBreakdownResponse;
import finalproject.backend.response.AnalyticsCategoryResponse;
import finalproject.backend.response.AnalyticsTimelinePointResponse;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CourseResponse;
import finalproject.backend.response.DashboardAnalyticsResponse;
import finalproject.backend.response.UserResponse;
import finalproject.backend.service.AnalyticsService;
import finalproject.backend.util.RoleUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Map<String, String> LEVEL_COLORS = Map.of(
            "BEGINNER", "#10b981",
            "INTERMEDIATE", "#f59e0b",
            "ADVANCED", "#ef4444"
    );

    private static final Map<String, String> ROLE_COLORS = Map.of(
            "ADMIN", "#8b5cf6",
            "USER", "#64748b",
            "MODERATOR", "#f59e0b"
    );

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseMapper courseMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DashboardAnalyticsResponse> getDashboardAnalytics(String range) {
        List<Course> courses = courseRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Category> categories = categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "orderIndex"));
        List<CourseEnrollmentFirstSeenView> enrollmentFirstSeen = lessonProgressRepository.findCourseEnrollmentFirstSeen();
        List<LocalDateTime> completionMoments = lessonProgressRepository.findCompletedAtMoments();

        DashboardAnalyticsResponse response = DashboardAnalyticsResponse.builder()
                .totalCourses(courses.size())
                .totalUsers(users.size())
                .totalCategories(categories.size())
                .totalEnrollments(enrollmentFirstSeen.size())
                .publishedCourses(countCoursesByStatus(courses, "PUBLISHED"))
                .draftCourses(countCoursesByStatus(courses, "DRAFT"))
                .featuredCourses(courses.stream().filter(course -> Boolean.TRUE.equals(course.getIsFeatured())).count())
                .activeUsers(users.stream().filter(user -> "ACTIVE".equalsIgnoreCase(user.getStatus())).count())
                .activeCategories(categories.stream().filter(category -> Boolean.TRUE.equals(category.getIsActive())).count())
                .coursesByLevel(buildCoursesByLevel(courses))
                .coursesByCategory(buildCoursesByCategory(categories))
                .usersByRole(buildUsersByRole(users))
                .recentCourses(courses.stream().limit(5).map(courseMapper::toResponse).toList())
                .recentUsers(users.stream().limit(5).map(userMapper::toResponse).toList())
                .activitySeries(buildActivitySeries(normalizeRange(range), users, enrollmentFirstSeen, completionMoments))
                .build();

        return ApiResponse.success(response, "Dashboard analytics retrieved successfully");
    }

    private long countCoursesByStatus(List<Course> courses, String status) {
        return courses.stream()
                .filter(course -> course.getStatus() != null && status.equalsIgnoreCase(course.getStatus().name()))
                .count();
    }

    private List<AnalyticsBreakdownResponse> buildCoursesByLevel(List<Course> courses) {
        return courses.stream()
                .collect(Collectors.groupingBy(
                        course -> course.getLevel() != null ? course.getLevel().name() : "BEGINNER",
                        LinkedHashMap::new,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .map(entry -> AnalyticsBreakdownResponse.builder()
                        .name(titleCase(entry.getKey()))
                        .value(entry.getValue())
                        .fill(LEVEL_COLORS.getOrDefault(entry.getKey(), "#6366f1"))
                        .build())
                .toList();
    }

    private List<AnalyticsCategoryResponse> buildCoursesByCategory(List<Category> categories) {
        return categories.stream()
                .map(category -> AnalyticsCategoryResponse.builder()
                        .name(category.getName())
                        .courses(category.getCourses() != null ? category.getCourses().size() : 0)
                        .build())
                .filter(entry -> entry.getCourses() > 0)
                .sorted(Comparator.comparingLong(AnalyticsCategoryResponse::getCourses).reversed())
                .limit(8)
                .toList();
    }

    private List<AnalyticsBreakdownResponse> buildUsersByRole(List<User> users) {
        return users.stream()
                .collect(Collectors.groupingBy(
                        this::resolvePrimaryRole,
                        LinkedHashMap::new,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .map(entry -> AnalyticsBreakdownResponse.builder()
                        .name(entry.getKey())
                        .value(entry.getValue())
                        .fill(ROLE_COLORS.getOrDefault(entry.getKey(), "#64748b"))
                        .build())
                .toList();
    }

    private List<AnalyticsTimelinePointResponse> buildActivitySeries(
            String range,
            List<User> users,
            List<CourseEnrollmentFirstSeenView> enrollments,
            List<LocalDateTime> completions
    ) {
        return switch (range) {
            case "7d" -> buildDailySeries(7, users, enrollments, completions);
            case "90d" -> buildWeeklySeries(13, users, enrollments, completions);
            default -> buildDailySeries(30, users, enrollments, completions);
        };
    }

    private List<AnalyticsTimelinePointResponse> buildDailySeries(
            int days,
            List<User> users,
            List<CourseEnrollmentFirstSeenView> enrollments,
            List<LocalDateTime> completions
    ) {
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        DateTimeFormatter formatter = days <= 7
                ? DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH)
                : DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

        LinkedHashMap<LocalDate, MutableCounts> buckets = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            buckets.put(start.plusDays(i), new MutableCounts());
        }

        for (User user : users) {
            incrementDailyBucket(buckets, toDate(user.getCreatedAt()), CountType.USERS, start);
        }

        for (CourseEnrollmentFirstSeenView enrollment : enrollments) {
            incrementDailyBucket(buckets, toDate(enrollment.getFirstSeenAt()), CountType.ENROLLMENTS, start);
        }

        for (LocalDateTime completion : completions) {
            incrementDailyBucket(buckets, toDate(completion), CountType.COMPLETIONS, start);
        }

        return buckets.entrySet().stream()
                .map(entry -> AnalyticsTimelinePointResponse.builder()
                        .label(entry.getKey().format(formatter))
                        .enrollments(entry.getValue().enrollments)
                        .users(entry.getValue().users)
                        .completions(entry.getValue().completions)
                        .build())
                .toList();
    }

    private List<AnalyticsTimelinePointResponse> buildWeeklySeries(
            int weeks,
            List<User> users,
            List<CourseEnrollmentFirstSeenView> enrollments,
            List<LocalDateTime> completions
    ) {
        LocalDate currentWeekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate start = currentWeekStart.minusWeeks(weeks - 1L);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

        List<WeekBucket> buckets = new ArrayList<>();
        for (int i = 0; i < weeks; i++) {
            LocalDate weekStart = start.plusWeeks(i);
            buckets.add(new WeekBucket(weekStart, weekStart.plusDays(6), new MutableCounts()));
        }

        for (User user : users) {
            incrementWeeklyBucket(buckets, toDate(user.getCreatedAt()), CountType.USERS);
        }

        for (CourseEnrollmentFirstSeenView enrollment : enrollments) {
            incrementWeeklyBucket(buckets, toDate(enrollment.getFirstSeenAt()), CountType.ENROLLMENTS);
        }

        for (LocalDateTime completion : completions) {
            incrementWeeklyBucket(buckets, toDate(completion), CountType.COMPLETIONS);
        }

        return buckets.stream()
                .map(bucket -> AnalyticsTimelinePointResponse.builder()
                        .label(bucket.start.format(formatter))
                        .enrollments(bucket.counts.enrollments)
                        .users(bucket.counts.users)
                        .completions(bucket.counts.completions)
                        .build())
                .toList();
    }

    private void incrementDailyBucket(
            Map<LocalDate, MutableCounts> buckets,
            LocalDate date,
            CountType countType,
            LocalDate start
    ) {
        if (date == null || date.isBefore(start)) return;
        MutableCounts counts = buckets.get(date);
        if (counts == null) return;
        switch (countType) {
            case USERS -> counts.users++;
            case ENROLLMENTS -> counts.enrollments++;
            case COMPLETIONS -> counts.completions++;
        }
    }

    private void incrementWeeklyBucket(List<WeekBucket> buckets, LocalDate date, CountType countType) {
        if (date == null) return;
        for (WeekBucket bucket : buckets) {
            if (!date.isBefore(bucket.start) && !date.isAfter(bucket.end)) {
                switch (countType) {
                    case USERS -> bucket.counts.users++;
                    case ENROLLMENTS -> bucket.counts.enrollments++;
                    case COMPLETIONS -> bucket.counts.completions++;
                }
                return;
            }
        }
    }

    private String resolvePrimaryRole(User user) {
        Set<String> roles = user.getRoles() == null
                ? Set.of()
                : user.getRoles().stream()
                .map(role -> {
                    try {
                        return RoleUtil.normalize(role.getName());
                    } catch (IllegalArgumentException ignored) {
                        return RoleUtil.ROLE_USER;
                    }
                })
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (roles.contains(RoleUtil.ROLE_ADMIN)) return "ADMIN";
        if (roles.contains(RoleUtil.ROLE_MODERATOR)) return "MODERATOR";
        return "USER";
    }

    private String normalizeRange(String range) {
        if ("7d".equalsIgnoreCase(range)) return "7d";
        if ("90d".equalsIgnoreCase(range)) return "90d";
        return "30d";
    }

    private LocalDate toDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }

    private String titleCase(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase(Locale.ENGLISH);
        if (normalized.isEmpty()) return "";
        return normalized.substring(0, 1).toUpperCase(Locale.ENGLISH) + normalized.substring(1);
    }

    private enum CountType {
        USERS,
        ENROLLMENTS,
        COMPLETIONS
    }

    private static final class MutableCounts {
        private long enrollments;
        private long users;
        private long completions;
    }

    private static final class WeekBucket {
        private final LocalDate start;
        private final LocalDate end;
        private final MutableCounts counts;

        private WeekBucket(LocalDate start, LocalDate end, MutableCounts counts) {
            this.start = start;
            this.end = end;
            this.counts = counts;
        }
    }
}
