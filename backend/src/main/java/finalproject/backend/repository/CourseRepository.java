package finalproject.backend.repository;

import finalproject.backend.modal.Course;
import finalproject.backend.modal.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    boolean existsByTitle(String title);
    boolean existsBySlug(String slug);
    Optional<Course> findBySlug(String slug);
    Page<Course> findByCategoryId(int categoryId, Pageable pageable);
    Page<Course> findByInstructorId(Long instructorId, Pageable pageable);
    Page<Course> findByStatus(CourseStatus status, Pageable pageable);

    Page<Course> findByIsFeaturedTrue(Pageable pageable);

    Page<Course> findByIsFeaturedTrueAndStatus(CourseStatus status, Pageable pageable);
}
