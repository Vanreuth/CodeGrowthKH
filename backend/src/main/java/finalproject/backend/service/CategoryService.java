package finalproject.backend.service;

import finalproject.backend.request.CategoryRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.CategoryResponse;
import finalproject.backend.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    ApiResponse<CategoryResponse> createCategory(CategoryRequest request);
    PageResponse<CategoryResponse> getAllCategories(
            Pageable pageable,
            String search,
            String status,
            Boolean hasCourses
    );
    ApiResponse<CategoryResponse> getCategoryById(int id);
    ApiResponse<CategoryResponse> getCategoryBySlug(String slug);
    ApiResponse<CategoryResponse> updateCategory(int id, CategoryRequest request);
    ApiResponse<Void> deleteCategory(int id);
}
