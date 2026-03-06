package finalproject.backend.modal;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "course")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String description;

    private String thumbnail;

    @Column(columnDefinition = "TEXT")
    private String requirements;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseLevel level = CourseLevel.BEGINNER;


    @Column(nullable = false)
    @Builder.Default
    private String language = "Khmer";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_free")
    @Builder.Default
    private Boolean isFree = false;

    @Column(name = "launch_date")
    private LocalDateTime launchDate;   // expected release date for COMING_SOON courses

    @Column(name = "total_lessons", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer totalLessons = 0;

    // ─── Download full course as PDF ──────────────────────────────────────────
    @Column(name = "pdf_url")
    private String pdfUrl;              // ← full course PDF (all lessons merged)

    @Column(name = "pdf_name")
    private String pdfName;             // "HTML-Beginner-Full-Course.pdf"

    @Column(name = "pdf_size_kb")
    private Long pdfSizeKb;             // file size in KB

    @Column(name = "pdf_updated_at")
    private LocalDateTime pdfUpdatedAt; // when PDF was last regenerated

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO; // 0.00–5.00

    @Column(name = "view_count", columnDefinition = "bigint default 0")
    @Builder.Default
    private Long viewCount = 0L; // number of times the course page was viewed

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();


    @PrePersist
    protected void onCreate() {
        if (createdAt    == null) createdAt    = LocalDateTime.now();
        if (status       == null) status       = CourseStatus.DRAFT;
        if (level        == null) level        = CourseLevel.BEGINNER;
        if (isFeatured   == null) isFeatured   = false;
        if (isFree       == null) isFree       = false;
        if (totalLessons == null) totalLessons = 0;
        if (viewCount    == null) viewCount    = 0L;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (CourseStatus.PUBLISHED == status && publishedAt == null)
            publishedAt = LocalDateTime.now();
    }
}
