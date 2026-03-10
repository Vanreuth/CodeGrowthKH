"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2, Eye, Edit3, PlusCircle, Upload, ImageOff, X,
  BookOpen, Users, Star, Globe, Tag, DollarSign, Sparkles, Clock,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Switch }   from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CourseResponse, CourseRequest, CourseStatus, CourseLevel } from "@/types/courseType";
import type { CategoryResponse } from "@/types/category";

// ─── Mode Config ──────────────────────────────────────────────────────────────
const MODE_CONFIG = {
  view : { Icon: Eye,        accent: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/40",         label: "Course Details",    hint: "Viewing course information." },
  edit : { Icon: Edit3,      accent: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40",       label: "Edit Course",       hint: "Update the fields below, then save." },
  add  : { Icon: PlusCircle, accent: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40",   label: "Create New Course", hint: "Fill in the details to publish a new course." },
};

const GRADIENTS = [
  "from-violet-500 via-purple-500 to-indigo-600",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-sky-500 via-blue-500 to-indigo-500",
];

// ─── Empty form ───────────────────────────────────────────────────────────────
const emptyForm = (): CourseFormState => ({
  title: "", description: "", level: "BEGINNER", status: "DRAFT",
  language: "Khmer", categoryId: undefined, _categoryStr: "",
  featured: false, comingSoon: false, isFree: true, price: 0,
  requirements: "", launchDate: "",
});

type CourseFormState = CourseRequest & { _categoryStr: string };

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CourseDialogProps {
  isOpen      : boolean;
  onOpenChange: (open: boolean) => void;
  mode        : "view" | "add" | "edit";
  course      : CourseResponse | null;
  categories  : CategoryResponse[];
  onSubmit    : (data: CourseRequest, thumbnail?: File) => Promise<void>;
  isSubmitting?: boolean;
  onSwitchToEdit?: (course: CourseResponse) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-7 w-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</p>
        <div className="text-sm font-medium mt-0.5">{children}</div>
      </div>
    </div>
  );
}

const LEVEL_BADGE: Record<string, string> = {
  BEGINNER    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ADVANCED    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const STATUS_BADGE: Record<string, { cls: string; dot: string; label: string }> = {
  PUBLISHED  : { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500", label: "Published"   },
  DRAFT      : { cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",           dot: "bg-slate-400",  label: "Draft"       },
  FEATURED   : { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",        dot: "bg-amber-500",  label: "Featured"    },
  COMING_SOON: { cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",                dot: "bg-sky-500",    label: "Coming Soon" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function CourseDialog({
  isOpen, onOpenChange, mode, course, categories,
  onSubmit, isSubmitting = false, onSwitchToEdit,
}: CourseDialogProps) {
  const [form, setForm]                         = useState<CourseFormState>(emptyForm());
  const [thumbnailFile, setThumbnailFile]       = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = mode === "view";
  const { Icon, accent, bg, label, hint } = MODE_CONFIG[mode];

  // Sync form when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    if (course && mode !== "add") {
      setForm({
        title       : course.title,
        description : course.description ?? "",
        level       : course.level ?? "BEGINNER",
        status      : course.status ?? "DRAFT",
        language    : course.language ?? "English",
        categoryId  : course.categoryId,
        _categoryStr: course.categoryId ? String(course.categoryId) : "",
        featured    : (course.featured || course.isFeatured) ?? false,
        comingSoon  : course.comingSoon ?? false,
        isFree      : course.isFree ?? true,
        price       : course.price ?? 0,
        requirements: course.requirements ?? "",
        launchDate  : course.launchDate ?? "",
      });
      setThumbnailPreview(course.thumbnail ?? null);
    } else {
      setForm(emptyForm());
      setThumbnailPreview(null);
    }
    setThumbnailFile(null);
  }, [isOpen, mode, course]);

  const setField = <K extends keyof CourseFormState>(key: K, value: CourseFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!form.title.trim()) return;
    const payload: CourseRequest = {
      title       : form.title.trim(),
      description : form.description || undefined,
      level       : form.level,
      status      : form.status,
      language    : form.language || undefined,
      categoryId  : form.categoryId,
      featured    : form.featured,
      comingSoon  : form.comingSoon,
      isFree      : form.isFree,
      price       : form.isFree ? 0 : (form.price ?? 0),
      requirements: form.requirements || undefined,
      launchDate  : form.comingSoon && form.launchDate ? form.launchDate : undefined,
    };
    await onSubmit(payload, thumbnailFile ?? undefined);
  };

  // Thumbnail for view mode
  const viewThumbnail = course?.thumbnail
    ? <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
    : (
      <div className={cn(
        "h-full w-full bg-gradient-to-br flex items-center justify-center text-white text-3xl font-bold",
        GRADIENTS[(course?.id ?? 0) % GRADIENTS.length],
      )}>
        {course?.title.charAt(0)}
      </div>
    );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">

        {/* ── Colored Header ── */}
        <div className={cn("px-6 pt-6 pb-5 border-b", bg)}>
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className={cn("p-1.5 rounded-lg bg-background/80 border shadow-sm")}>
                <Icon className={cn("h-4 w-4", accent)} />
              </div>
              <DialogTitle className="text-base font-semibold">{label}</DialogTitle>
            </div>
            <DialogDescription className="text-sm">{hint}</DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Body ── */}
        {isReadOnly ? (
          /* ── VIEW MODE ── */
          <div className="px-6 py-5 space-y-6">
            {/* Thumbnail + title */}
            <div className="flex gap-4">
              <div className="h-20 w-32 rounded-xl overflow-hidden border flex-shrink-0 shadow-sm">
                {viewThumbnail}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg leading-tight">{course?.title}</h3>
                {course?.categoryName && (
                  <Badge variant="outline" className="mt-1 text-xs">{course.categoryName}</Badge>
                )}
                {course?.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{course.description}</p>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Status + Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">Status</p>
                {(() => {
                  const s = STATUS_BADGE[course?.status ?? "DRAFT"];
                  return (
                    <Badge variant="outline" className={cn("border-0 gap-1.5 text-xs font-medium", s.cls)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />{s.label}
                    </Badge>
                  );
                })()}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">Level</p>
                <Badge variant="outline" className={cn("border-0 text-xs font-medium", LEVEL_BADGE[course?.level ?? "BEGINNER"])}>
                  {(course?.level ?? "BEGINNER").charAt(0) + (course?.level ?? "BEGINNER").slice(1).toLowerCase()}
                </Badge>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow icon={Globe} label="Language">{course?.language ?? "—"}</InfoRow>
              <InfoRow icon={DollarSign} label="Price">
                {course?.isFree ? <span className="text-emerald-600 font-semibold">Free</span> : `$${(course?.price ?? 0).toFixed(2)}`}
              </InfoRow>
              <InfoRow icon={BookOpen} label="Lessons">{course?.totalLessons ?? 0}</InfoRow>
              <InfoRow icon={Users} label="Enrolled">{(course?.enrolledCount ?? 0).toLocaleString()}</InfoRow>
              <InfoRow icon={Star} label="Avg. Rating">{(course?.avgRating ?? 0).toFixed(1)} / 5.0</InfoRow>
              <InfoRow icon={Tag} label="Category">{course?.categoryName ?? "—"}</InfoRow>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-2 flex-wrap">
              {(course?.featured || course?.isFeatured) && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 gap-1.5 text-xs">
                  <Sparkles className="h-3 w-3" /> Featured
                </Badge>
              )}
              {course?.comingSoon && (
                <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-0 gap-1.5 text-xs">
                  <Clock className="h-3 w-3" /> Coming Soon
                  {course.launchDate ? ` · ${new Date(course.launchDate).toLocaleDateString()}` : ""}
                </Badge>
              )}
            </div>

            {/* Requirements */}
            {course?.requirements && (
              <>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">Requirements</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{course.requirements}</p>
                </div>
              </>
            )}

            {/* Timestamps */}
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Created</p>
                <p className="text-muted-foreground mt-0.5">{course ? new Date(course.createdAt).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Updated</p>
                <p className="text-muted-foreground mt-0.5">{course ? new Date(course.updatedAt).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── ADD / EDIT MODE ── */
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-5">

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-40 rounded-lg border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted/30 flex-shrink-0">
                    {thumbnailPreview
                      ? <img src={thumbnailPreview} alt="preview" className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                      : (
                        <div className="text-center text-muted-foreground">
                          <ImageOff className="h-8 w-8 mx-auto mb-1 opacity-40" />
                          <p className="text-xs">No image</p>
                        </div>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                      <Upload className="h-4 w-4" />{thumbnailPreview ? "Change Image" : "Upload Image"}
                    </Button>
                    {thumbnailPreview && (
                      <Button type="button" variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }} disabled={isSubmitting}>
                        <X className="h-4 w-4" />Remove
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5 MB.</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="cd-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cd-title"
                  placeholder="e.g., Complete React Developer Course"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="cd-desc">Description</Label>
                <Textarea
                  id="cd-desc"
                  placeholder="What will students learn in this course?"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </div>

              {/* Level + Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(v) => setField("level", v as CourseLevel)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setField("status", v as CourseStatus)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="FEATURED">Featured</SelectItem>
                      <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category + Language */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form._categoryStr || "none"}
                    onValueChange={(v) => setForm((p) => ({
                      ...p,
                      _categoryStr: v === "none" ? "" : v,
                      categoryId  : v && v !== "none" ? Number(v) : undefined,
                    }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Language</Label>
                  <Select value={form.language || ""} onValueChange={(v) => setField("language", v)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Khmer">ភាសាខ្មែរ (Khmer)</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                  
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-1.5">
                <Label htmlFor="cd-req">Requirements</Label>
                <Textarea
                  id="cd-req"
                  placeholder="List prerequisites or requirements for this course…"
                  rows={2}
                  value={form.requirements}
                  onChange={(e) => setField("requirements", e.target.value)}
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </div>

              {/* Pricing */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Free Course</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Toggle off to set a price</p>
                  </div>
                  <Switch checked={form.isFree ?? true} onCheckedChange={(v) => setField("isFree", v)} disabled={isSubmitting} />
                </div>
                {!form.isFree && (
                  <div className="space-y-1.5">
                    <Label htmlFor="cd-price">Price (USD)</Label>
                    <Input
                      id="cd-price"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      value={form.price ?? 0}
                      onChange={(e) => setField("price", parseFloat(e.target.value) || 0)}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Show in featured section</p>
                  </div>
                  <Switch checked={form.featured ?? false} onCheckedChange={(v) => setField("featured", v)} disabled={isSubmitting} />
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.title.trim()} className="min-w-[140px]">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "add" ? "Create Course" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}

        {/* ── View Footer ── */}
        {isReadOnly && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={() => { onOpenChange(false); course && onSwitchToEdit?.(course); }}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Course
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
