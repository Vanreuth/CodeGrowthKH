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
    int countByCourseId(Long courseId);
    int countByChapterId(Long chapterId);
    Optional<Lesson> findByChapterIdAndTitle(Long chapterId, String title);

    boolean existsByCourseIdAndSlug(Long courseId, String slug);

    // For getLessonBySlug: find lesson by its slug scoped to a course slug
    Optional<Lesson> findByCourse_SlugAndSlug(String courseSlug, String lessonSlug);
}

