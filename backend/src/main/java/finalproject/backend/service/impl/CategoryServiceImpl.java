package finalproject.backend.service.impl;

import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.mapper.CategoryMapper;
import finalproject.backend.modal.Category;
import finalproject.backend.repository.CategoryRepository;
import finalproject.backend.request.CategoryRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CategoryResponse;
import finalproject.backend.response.PageResponse;
import finalproject.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public ApiResponse<CategoryResponse> createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName()))
            throw new CustomMessageException("Category name already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if (categoryRepository.existsBySlug(request.getSlug()))
            throw new CustomMessageException("Category slug already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        // createdAt + isActive set by @PrePersist
        Category saved = categoryRepository.save(categoryMapper.toEntity(request));
        log.info("Created category id={}", saved.getId());
        return ApiResponse.success(categoryMapper.toResponse(saved), "Category created successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> getAllCategories(
            Pageable pageable,
            String search,
            String status,
            Boolean hasCourses) {

        // ✅ Build spec from CategoryRepository directly
        Specification<Category> spec = Specification
                .where(searchByTitleOrSlug(search))
                .and(hasStatus(status))
                .and(hasCourses(hasCourses));

        Page<Category> page = categoryRepository.findAll(spec, pageable); // ✅ works because of JpaSpecificationExecutor
        return PageResponse.of(page.map(categoryMapper::toResponse));
    }

    // ── Specs defined inline — no need for separate CategorySpec.java ─────────

    private Specification<Category> searchByTitleOrSlug(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return null;
            String like = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),  // ✅ "name" not "title"
                    cb.like(cb.lower(root.get("slug")), like)
            );
        };
    }

    private Specification<Category> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("status"), status.toUpperCase());
        };
    }

    private Specification<Category> hasCourses(Boolean hasCourses) {
        return (root, query, cb) -> {
            if (hasCourses == null) return null;
            var size = cb.size(root.get("courses"));
            return hasCourses
                    ? cb.greaterThan(size, 0)
                    : cb.equal(size, 0);
        };
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CategoryResponse> getCategoryById(int id) {
        Category category = findOrThrow(id);
        return ApiResponse.success(categoryMapper.toResponse(category), "Category retrieved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CategoryResponse> getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new CustomMessageException(
                        "Category not found with slug: " + slug,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(categoryMapper.toResponse(category), "Category retrieved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<CategoryResponse> updateCategory(int id, CategoryRequest request) {
        Category category = findOrThrow(id);

        if (request.getName() != null && !request.getName().equals(category.getName())
                && categoryRepository.existsByName(request.getName()))
            throw new CustomMessageException("Category name already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if (request.getSlug() != null && !request.getSlug().equals(category.getSlug())
                && categoryRepository.existsBySlug(request.getSlug()))
            throw new CustomMessageException("Category slug already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        categoryMapper.updateEntity(request, category);
        Category saved = categoryRepository.save(category);
        log.info("Updated category id={}", id);
        return ApiResponse.success(categoryMapper.toResponse(saved), "Category updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteCategory(int id) {
        categoryRepository.delete(findOrThrow(id));
        log.info("Deleted category id={}", id);
        return ApiResponse.success("Category deleted successfully");
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private Category findOrThrow(int id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CustomMessageException(
                        "Category not found with id: " + id,
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
    }
}
