"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  RefreshCw,
  Layers,
  BookOpen,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCategories } from "@/hooks/useCategories";
import type { CategoryResponse } from "@/types/apiType";
import { toast } from "sonner";

const EMPTY_CATEGORIES: CategoryResponse[] = [];

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Category Row Skeleton ────────────────────────────────────────────────────

function CategoryRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    orderIndex: 0,
  });

  const { data, loading, refetch, create, update, remove } = useCategories({ page, size: pageSize });

  const categories = data?.content ?? EMPTY_CATEGORIES;
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;
  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        searchTerm === "" ||
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && cat.isActive) ||
        (statusFilter === "Inactive" && !cat.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: totalElements,
      active: categories.filter((c) => c.isActive).length,
      totalCourses: categories.reduce((acc, c) => acc + (c.courseCount ?? 0), 0),
    };
  }, [categories, totalElements]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }
    return fallback;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Categories refreshed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to refresh categories"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const slug = formData.slug.trim();

    if (!name) {
      return "Category name is required.";
    }
    if (!slug) {
      return "Slug is required.";
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return "Slug must use lowercase letters, numbers, and hyphens only.";
    }

    return null;
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setFormError(null);
    setSlugManuallyEdited(false);
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true,
      orderIndex: totalElements + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryResponse) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormError(null);
    setSlugManuallyEdited(true);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive,
      orderIndex: category.orderIndex,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      isActive: formData.isActive,
      orderIndex: formData.orderIndex,
    };

    try {
      if (modalMode === "add") {
        await create(payload);
        toast.success("Category created successfully");
      } else if (selectedCategory) {
        await update(selectedCategory.id, payload);
        toast.success("Category updated successfully");
      }

      setIsModalOpen(false);
      await refetch();
    } catch (error) {
      const message = getErrorMessage(
        error,
        modalMode === "add" ? "Failed to create category" : "Failed to update category",
      );
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: CategoryResponse) => {
    setStatusUpdatingId(category.id);
    try {
      await update(category.id, {
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        isActive: !category.isActive,
        orderIndex: category.orderIndex,
      });
      toast.success(
        `Category ${category.isActive ? "deactivated" : "activated"} successfully`,
      );
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update category status"));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteCategory = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await remove(deleteTarget.id);
      toast.success("Category deleted successfully");

      if (categories.length === 1 && page > 0) {
        setPage((prev) => Math.max(0, prev - 1));
      } else {
        await refetch();
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete category"));
    } finally {
      setDeletingId(null);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const colors = [
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage course categories and organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || isRefreshing) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Total Categories"
          value={stats.total}
          color="#8b5cf6"
          loading={loading}
        />
        <StatCard
          icon={Eye}
          label="Active Categories"
          value={stats.active}
          color="#10b981"
          loading={loading}
        />
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
          color="#3b82f6"
          loading={loading}
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Organize your courses by category</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Slug</TableHead>
                  <TableHead className="font-semibold">Courses</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <CategoryRowSkeleton key={i} />)
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => {
                    const gradient = colors[category.id % colors.length];
                    return (
                      <TableRow key={category.id} className="group hover:bg-muted/30">
                        <TableCell>
                          <span className="text-sm text-muted-foreground font-mono">
                            {category.orderIndex}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}
                            >
                              {category.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {category.name}
                              </p>
                              {category.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{category.courseCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {category.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 gap-1 text-xs">
                              <Check className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0 gap-1 text-xs">
                              <X className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openEditModal(category)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleToggleStatus(category)}
                                disabled={statusUpdatingId === category.id || deletingId === category.id}
                              >
                                {statusUpdatingId === category.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : category.isActive ? (
                                  <>
                                    <EyeOff className="h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive gap-2"
                                onClick={() => setDeleteTarget(category)}
                                disabled={statusUpdatingId === category.id || deletingId === category.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Category
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Layers className="h-12 w-12 mb-3 opacity-50" />
                        <p className="font-medium">No categories found</p>
                        <p className="text-sm">Try adjusting your search or create a new category</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {totalElements} categories
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPage(0);
                  setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[96px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setFormError(null);
            setSlugManuallyEdited(false);
            setSelectedCategory(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add" ? "Add New Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "add"
                ? "Create a new category for organizing courses"
                : "Update category information"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Web Development"
                  value={formData.name}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: modalMode === "add" && !slugManuallyEdited ? generateSlug(name) : formData.slug,
                    });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="web-development"
                  value={formData.slug}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs: /courses/category/{formData.slug || "slug"}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  disabled={isSubmitting}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    min="0"
                    value={formData.orderIndex}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch
                      checked={formData.isActive}
                      disabled={isSubmitting}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <span className="text-sm">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {modalMode === "add" ? "Create Category" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> will be permanently removed.
              {(deleteTarget?.courseCount ?? 0) > 0 && (
                <>
                  {" "}
                  This category currently has {deleteTarget?.courseCount} course(s).
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
