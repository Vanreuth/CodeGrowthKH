package finalproject.backend.repository;

import finalproject.backend.modal.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByChapterIdOrderByOrderIndexAsc(Long chapterId);
    List<Lesson> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    boolean existsByTitleAndChapterId(String title, Long chapterId);

    /**
     * FIX: changed return type from int → long.
     * LessonProgressServiceImpl.checkCourseCompletion() assigns this to `long totalLessons`.
     * Although Java auto-widens int→long, returning long is correct and consistent
     * with countCompletedByCourseIdAndUserId() in LessonProgressRepository which also returns long.
     */
    long countByCourseId(Long courseId);

    // int countByCourseId was the old type — replaced above

    int countByChapterId(Long chapterId);
    Optional<Lesson> findByChapterIdAndTitle(Long chapterId, String title);
    boolean existsByCourseIdAndSlug(Long courseId, String slug);
    Optional<Lesson> findByCourse_SlugAndSlug(String courseSlug, String lessonSlug);
}