package finalproject.backend.repository;

import finalproject.backend.modal.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    // ─── Single record ────────────────────────────────────────────────────────

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);

    // ─── By user ──────────────────────────────────────────────────────────────

    /** All progress for a user, newest activity first (for account page activity tab). */
    List<LessonProgress> findByUserIdOrderByUpdatedAtDesc(Long userId);

    /** Legacy — unordered. Prefer findByUserIdOrderByUpdatedAtDesc for display. */
    List<LessonProgress> findByUserId(Long userId);

    // ─── By lesson ────────────────────────────────────────────────────────────

    List<LessonProgress> findByLessonId(Long lessonId);

    // ─── By course + user ─────────────────────────────────────────────────────

    /**
     * FIX: added @Param on both parameters.
     * Without @Param, Spring Data cannot bind named parameters in @Query
     * when the class is compiled without -parameters flag → BindingException at runtime.
     */
    @Query("SELECT lp FROM LessonProgress lp WHERE lp.lesson.course.id = :courseId AND lp.user.id = :userId")
    List<LessonProgress> findByCourseIdAndUserId(@Param("courseId") Long courseId,
                                                 @Param("userId")   Long userId);

    // ─── Counts ───────────────────────────────────────────────────────────────

    /** FIX: added @Param. */
    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.completed = true")
    long countCompletedByUserId(@Param("userId") Long userId);

    /** FIX: added @Param on both parameters. */
    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.lesson.course.id = :courseId AND lp.user.id = :userId AND lp.completed = true")
    long countCompletedByCourseIdAndUserId(@Param("courseId") Long courseId,
                                           @Param("userId")   Long userId);

    /** Count distinct users who have any progress record for a course (enrolled / studying). */
    @Query("SELECT COUNT(DISTINCT lp.user.id) FROM LessonProgress lp WHERE lp.lesson.course.id = :courseId")
    long countDistinctUsersByCourseId(@Param("courseId") Long courseId);

    /**
     * NEW: Count how many distinct courses a user has at least one completed lesson in.
     * Used by the account page "distinctCourses" stat.
     */
    @Query("SELECT COUNT(DISTINCT lp.lesson.course.id) FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.completed = true")
    long countDistinctCompletedCoursesByUserId(@Param("userId") Long userId);

    /**
     * NEW: Total reading time (seconds) accumulated across all lessons for a user.
     * Avoids loading the full list into memory just to sum one field.
     */
    @Query("SELECT COALESCE(SUM(lp.readTimeSeconds), 0) FROM LessonProgress lp WHERE lp.user.id = :userId")
    long sumReadTimeSecondsByUserId(@Param("userId") Long userId);

    // ─── Deletes ──────────────────────────────────────────────────────────────

    /** FIX: added @Param on both parameters. */
    @Modifying
    @Query("DELETE FROM LessonProgress lp WHERE lp.user.id = :userId AND lp.lesson.id = :lessonId")
    void deleteByUserIdAndLessonId(@Param("userId")   Long userId,
                                   @Param("lessonId") Long lessonId);

    /** FIX: added @Param. */
    @Modifying
    @Query("DELETE FROM LessonProgress lp WHERE lp.lesson.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}