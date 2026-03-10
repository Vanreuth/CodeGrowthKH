package finalproject.backend.repository;

import finalproject.backend.modal.Category;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository
        extends JpaRepository<Category, Integer>,
        JpaSpecificationExecutor<Category> {

    boolean existsByName(String name);
    boolean existsBySlug(String slug);
    Optional<Category> findBySlug(String slug);
}