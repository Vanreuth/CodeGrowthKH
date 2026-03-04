export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  orderIndex: number;
  courseCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}
