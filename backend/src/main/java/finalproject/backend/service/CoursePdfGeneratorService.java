package finalproject.backend.service;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.WaitUntilState;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

@Slf4j
@Service
public class CoursePdfGeneratorService {

    // ── CDN base ─────────────────────────────────────────────────────────
    private static final String PRISM_CDN =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0";

    // ── GFG Green palette ────────────────────────────────────────────────
    private static final String G_PRIMARY = "#2f8d46";
    private static final String G_DEEP    = "#1e6b33";
    private static final String G_LIGHT   = "#f0fdf4";
    private static final String G_MUTED   = "rgba(47,141,70,0.12)";
    private static final String G_BORDER  = "rgba(47,141,70,0.25)";

    // ── Lines-per-page threshold for splitting large code blocks ─────────
    // A4 at ~8.8pt font, ~1.85 line-height ≈ 45 lines fit in one page body.
    // We use a conservative 38 to leave room for the topbar + margins.
    private static final int CODE_SPLIT_THRESHOLD = 38;

    // ── Language accent colours ──────────────────────────────────────────
    private static String langAccent(String lang) {
        if (lang == null) return G_PRIMARY;
        return switch (lang.toUpperCase()) {
            case "HTML"                         -> "#e44d26";
            case "CSS"                          -> "#268fe4";
            case "JS", "JAVASCRIPT"             -> "#f0a500";
            case "JSX", "TSX", "REACT", "NEXT", "NEXTJS" -> "#61dafb";
            case "TS", "TYPESCRIPT"             -> "#3178c6";
            case "JAVA", "SPRING", "SPRINGBOOT" -> "#5382a1";
            case "PYTHON"                       -> "#3572a5";
            case "SQL"                          -> "#e38c00";
            case "BASH", "SH", "SHELL"          -> "#4caf50";
            case "JSON"                         -> "#cbcb41";
            case "XML"                          -> "#f1672d";
            case "KOTLIN"                       -> "#a97bff";
            case "DART"                         -> "#00b4ab";
            case "PHP"                          -> "#8993be";
            case "C", "CPP", "C++"             -> "#607d8b";
            case "SWIFT"                        -> "#f05138";
            case "GO"                           -> "#00acd7";
            case "RUST"                         -> "#dea584";
            case "CS", "C#", "CSHARP"          -> "#7b4fc9";
            default                             -> G_PRIMARY;
        };
    }

    private static String prismLang(String lang) {
        if (lang == null) return "markup";
        return switch (lang.toUpperCase()) {
            case "HTML", "XML"                  -> "markup";
            case "CSS"                          -> "css";
            case "JS", "JAVASCRIPT"             -> "javascript";
        case "JSX", "REACT", "NEXT", "NEXTJS" -> "jsx";
            case "TS", "TYPESCRIPT"             -> "typescript";
        case "TSX"                          -> "tsx";
            case "JAVA", "SPRING", "SPRINGBOOT" -> "java";
            case "PYTHON"                       -> "python";
            case "SQL"                          -> "sql";
            case "BASH", "SH", "SHELL"          -> "bash";
            case "JSON"                         -> "json";
            case "KOTLIN"                       -> "kotlin";
            case "DART"                         -> "dart";
            case "PHP"                          -> "php";
            case "C"                            -> "c";
            case "CPP", "C++"                  -> "cpp";
            case "SWIFT"                        -> "swift";
            case "GO"                           -> "go";
            case "RUST"                         -> "rust";
            case "CS", "C#", "CSHARP"          -> "csharp";
            case "YAML", "YML"                  -> "yaml";
            case "DOCKERFILE"                   -> "docker";
            default                             -> "clike";
        };
    }

        private static String normalizeLanguage(String lang, String code) {
          String raw = lang == null ? "" : lang.trim();
          if (raw.isEmpty()) return detectLanguageFromCode(code);

          String key = raw.toUpperCase()
              .replace("-", "")
              .replace("_", "")
              .replace(" ", "");

          return switch (key) {
            case "JS", "JAVASCRIPT", "NODE", "NODEJS" -> "JAVASCRIPT";
            case "TS", "TYPESCRIPT" -> "TYPESCRIPT";
            case "JSX", "REACT", "REACTJS", "NEXT", "NEXTJS" -> "JSX";
            case "TSX" -> "TSX";
            case "HTML", "HTML5", "XHTML", "XML" -> "HTML";
            case "PY", "PYTHON" -> "PYTHON";
            case "SHELL", "BASH", "SH", "ZSH" -> "BASH";
            case "C#", "CS", "CSHARP" -> "CSHARP";
            case "TXT", "TEXT", "PLAINTEXT", "CODE", "NONE", "NA", "N/A" -> detectLanguageFromCode(code);
            default -> raw.toUpperCase();
          };
        }

        private static String detectLanguageFromCode(String code) {
          if (code == null || code.isBlank()) return "JAVASCRIPT";
          String s = code.strip();

          if (s.startsWith("{") || s.startsWith("[")) return "JSON";
          if (s.contains("import React") || s.contains(" from 'react'") || s.contains("</") || s.contains("<>") || s.contains("className=")) return "JSX";
          if (s.startsWith("<!DOCTYPE") || s.contains("<html") || s.contains("<div")) return "HTML";
          if (s.contains("public class") || s.contains("System.out.println") || s.contains("@SpringBootApplication")) return "JAVA";
          if (s.contains("def ") || s.contains("import pandas") || s.contains("print(")) return "PYTHON";
          if (s.contains("SELECT ") || s.contains("INSERT INTO") || s.contains("CREATE TABLE")) return "SQL";
          if (s.startsWith("#!/bin/bash") || s.startsWith("#!/usr/bin/env bash") || s.contains("echo ")) return "BASH";
          if (s.contains("{") && s.contains("}") && (s.contains("=>") || s.contains("const ") || s.contains("let ") || s.contains("function "))) return "JAVASCRIPT";

          return "JAVASCRIPT";
        }

    // ═══════════════════════════════════════════════════════════════════
    //  PUBLIC generate()
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generate(Course course) {
        log.info("🖨️  Generating PDF — course='{}'", course.getSlug());
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions().setHeadless(true));
            Page page = browser.newContext().newPage();

            page.setContent(buildHtml(course),
                    new Page.SetContentOptions()
                            .setWaitUntil(WaitUntilState.NETWORKIDLE));

            page.waitForFunction(
                  "() => window.__prismDone === true"
            );
            page.waitForTimeout(1000);

            byte[] pdf = page.pdf(new Page.PdfOptions()
                    .setFormat("A4")
                    .setPrintBackground(true)
                    .setMargin(new Margin()
                            .setTop("0mm").setBottom("0mm")
                            .setLeft("0mm").setRight("0mm")));

            log.info("✅ PDF generated — course='{}'", course.getSlug());
            return pdf;
        } catch (Exception e) {
            log.error("❌ PDF failed — courseId={}: {}", course.getId(), e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  HTML BUILDER
    // ═══════════════════════════════════════════════════════════════════

    private String buildHtml(Course course) {
        String level      = course.getLevel()      != null ? course.getLevel().toString() : "—";
        String lang       = course.getLanguage()   != null ? course.getLanguage()          : "Khmer";
        boolean isFree    = Boolean.TRUE.equals(course.getIsFree());
        String instructor = course.getInstructor() != null
                ? course.getInstructor().getUsername() : "GrowCodeKH";
        String date       = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        int lessons       = course.getTotalLessons() != null ? course.getTotalLessons() : 0;

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"km\">\n<head>\n")
                .append("<meta charset=\"UTF-8\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n")
                .append("<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n")
                .append("<link href=\"https://fonts.googleapis.com/css2?")
                .append("family=Noto+Sans+Khmer:wght@300;400;500;600;700")
                .append("family=Noto+Serif+Khmer:wght@300;400;600;700")
                .append("&family=Inter:wght@300;400;500;600;700;800;900")
                .append("&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400")
                .append("&display=swap\" rel=\"stylesheet\">\n")
                // Prism base: tomorrow (neutral dark) — our token !important rules win cleanly
                .append("<link rel=\"stylesheet\" href=\"")
                .append(PRISM_CDN).append("/themes/prism-tomorrow.min.css\">\n")
                // Line-numbers plugin CSS
                .append("<link rel=\"stylesheet\" href=\"")
                .append(PRISM_CDN).append("/plugins/line-numbers/prism-line-numbers.min.css\">\n")
                .append("<style>\n").append(css()).append("</style>\n</head>\n<body>\n");

        html.append(coverPage(course, level, lang, isFree, instructor, date, lessons));
        html.append(tocPage(course));

        int ci = 0;
        for (Chapter ch : course.getChapters())
            html.append(chapterPage(ch, ++ci));

        // ── Prism.js scripts ──────────────────────────────────────────
        html.append("\n<script src=\"").append(PRISM_CDN).append("/prism.min.js\"></script>\n")
          .append("<script src=\"").append(PRISM_CDN).append("/components/prism-markup-templating.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-typescript.min.js\"></script>\n")
          .append("<script src=\"").append(PRISM_CDN).append("/components/prism-jsx.min.js\"></script>\n")
          .append("<script src=\"").append(PRISM_CDN).append("/components/prism-tsx.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-java.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-python.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-sql.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-bash.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-json.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-kotlin.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-dart.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-php.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-c.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-cpp.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-swift.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-go.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-rust.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-csharp.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-yaml.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-docker.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-graphql.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/components/prism-regex.min.js\"></script>\n")
                .append("<script src=\"").append(PRISM_CDN).append("/plugins/line-numbers/prism-line-numbers.min.js\"></script>\n")
                .append("<script>window.__prismDone=false;if(typeof Prism !== 'undefined'){Prism.highlightAll();}window.__prismDone=true;</script>\n")
                .append("</body>\n</html>");

        return html.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  COVER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String coverPage(Course course, String level, String lang,
                             boolean isFree, String instructor, String date, int lessons) {
        String accessColor = isFree ? "#10b981" : "#f59e0b";
        String accessBg    = isFree ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)";
        String access      = isFree ? "FREE"    : "PREMIUM";
        String desc        = course.getDescription() != null ? course.getDescription() : "";
        int    chCount     = course.getChapters() != null ? course.getChapters().size() : 0;

        return """
            <div class="page cover">
              <div class="cv-stripe-top"></div>
              <div class="cv-stripe-left"></div>
              <div class="cv-glow-tr"></div>
              <div class="cv-glow-bl"></div>

              <div class="cv-brand">
                <span class="cv-brand-dot"></span>
                GrowCodeKH &nbsp;·&nbsp; growcodekh.site
              </div>

              <div class="cv-hero">
                <div class="cv-tag">COURSE DOCUMENTATION</div>
                <h1 class="cv-title">%s</h1>
                <div class="cv-rule"></div>
                <p class="cv-desc">%s</p>
              </div>

              <div class="cv-stats">
                <div class="cv-stat">
                  <div class="cv-stat-icon">📊</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Level</div>
                    <div class="cv-stat-val">%s</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">🌐</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Language</div>
                    <div class="cv-stat-val">%s</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">📚</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Lessons</div>
                    <div class="cv-stat-val">%d</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">📂</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Chapters</div>
                    <div class="cv-stat-val">%d</div>
                  </div>
                </div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat">
                  <div class="cv-stat-icon">🔑</div>
                  <div class="cv-stat-info">
                    <div class="cv-stat-lbl">Access</div>
                    <div class="cv-stat-val" style="color:%s;background:%s;padding:2px 8px;border-radius:4px;font-size:9pt;">%s</div>
                  </div>
                </div>
              </div>

              <div class="cv-meta">
                <div class="cv-meta-row">
                  <span class="cv-meta-icon">👨‍🏫</span>
                  <span class="cv-meta-key">Instructor</span>
                  <span class="cv-meta-sep">·</span>
                  <span class="cv-meta-val">%s</span>
                </div>
                <div class="cv-meta-row">
                  <span class="cv-meta-icon">📅</span>
                  <span class="cv-meta-key">Generated</span>
                  <span class="cv-meta-sep">·</span>
                  <span class="cv-meta-val">%s</span>
                </div>
                <div class="cv-meta-row">
                  <span class="cv-meta-icon">🌍</span>
                  <span class="cv-meta-key">Platform</span>
                  <span class="cv-meta-sep">·</span>
                  <span class="cv-meta-val" style="color:#2f8d46;">growcodekh.site</span>
                </div>
              </div>

              <div class="cv-footer">
                <span>© %d GrowCodeKH — All rights reserved</span>
                <span style="color:#2f8d46;font-weight:700;">growcodekh.site</span>
              </div>
            </div>
            """.formatted(
                esc(course.getTitle()), esc(desc),
                esc(level), esc(lang), lessons, chCount,
                accessColor, accessBg, access,
                esc(instructor), esc(date),
                LocalDate.now().getYear());
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════════════

    private String tocPage(Course course) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header">
                <span class="pg-site">growcodekh.site</span>
                <span class="pg-title">%s</span>
              </div>
              <div class="toc-eyebrow">TABLE OF CONTENTS</div>
              <div class="toc-heading">តារាងមាតិកា <span class="toc-heading-sub">/ Table of Contents</span></div>
              <div class="toc-rule"></div>
            """.formatted(esc(course.getTitle())));

        int ci = 0;
        for (Chapter ch : course.getChapters()) {
            ci++;
            sb.append("""
                <div class="toc-chapter">
                  <div class="toc-ch-num">%d</div>
                  <div class="toc-ch-body">
                    <div class="toc-ch-title">%s</div>
                    <div class="toc-ch-count">%d lessons</div>
                  </div>
                </div>
                """.formatted(ci, esc(ch.getTitle()), ch.getLessons().size()));

            int li = 0;
            for (Lesson ls : ch.getLessons()) {
                li++;
                String altBg = (li % 2 == 0) ? " style=\"background:rgba(47,141,70,0.035);\"" : "";
                sb.append("<div class=\"toc-lesson\"%s>".formatted(altBg))
                        .append("<span class=\"toc-ls-num\">%d.%d</span>".formatted(ci, li))
                        .append("<span class=\"toc-ls-title\">%s</span>".formatted(esc(ls.getTitle())))
                        .append("<span class=\"toc-ls-dots\"></span>")
                        .append("</div>\n");
            }
        }

        sb.append("""
              <div class="pg-footer">
                <span class="pf-brand">© GrowCodeKH</span>
                <span class="pg-num">— 2 —</span>
                <span class="pf-site">growcodekh.site</span>
              </div>
            </div>
            """);
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CHAPTER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String chapterPage(Chapter chapter, int ci) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header">
                <span class="pg-site">growcodekh.site</span>
                <span class="pg-title">Chapter %d · %s</span>
              </div>
              <div class="ch-banner">
                <div class="ch-badge">
                  <div class="ch-badge-label">ជំពូក</div>
                  <div class="ch-badge-num">%02d</div>
                </div>
                <div class="ch-banner-body">
                  <div class="ch-banner-eyebrow">CHAPTER %d</div>
                  <div class="ch-banner-title">%s</div>
                </div>
                <div class="ch-banner-deco"></div>
              </div>
            """.formatted(ci, esc(chapter.getTitle()), ci, ci, esc(chapter.getTitle())));

        if (chapter.getDescription() != null && !chapter.getDescription().isBlank())
            sb.append("<p class=\"ch-desc\">").append(esc(chapter.getDescription())).append("</p>\n");

        int li = 0;
        for (Lesson lesson : chapter.getLessons())
            sb.append(lessonSection(lesson, ci, ++li));

        sb.append("""
              <div class="pg-footer">
                <span class="pf-brand">© GrowCodeKH</span>
                <span class="pg-num">— %d —</span>
                <span class="pf-site">growcodekh.site</span>
              </div>
            </div>
            """.formatted(ci + 2));
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  LESSON SECTION
    // ═══════════════════════════════════════════════════════════════════

    private String lessonSection(Lesson lesson, int ci, int li) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="lesson">
              <div class="ls-header">
                <div class="ls-num">%d.%d</div>
                <div class="ls-title">%s</div>
              </div>
            """.formatted(ci, li, esc(lesson.getTitle())));

        if (lesson.getContent() != null && !lesson.getContent().isBlank())
            sb.append("<div class=\"ls-body\">")
                    .append(renderContent(lesson.getContent()))
                    .append("</div>\n");

        for (CodeSnippet cs : lesson.getCodeSnippets())
            sb.append(snippetHtml(cs));

        sb.append("<hr class=\"h-rule\">\n</div>\n");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CONTENT RENDERER
    // ═══════════════════════════════════════════════════════════════════

    private String renderContent(String raw) {
        StringBuilder sb = new StringBuilder();
        for (String block : raw.split("\n\n")) {
            if (block.isBlank()) continue;
            String b = stripHtml(block).trim();
            if (b.isEmpty()) continue;

            String[] lines = b.split("\n");
            boolean isList = Arrays.stream(lines).anyMatch(this::isBulletLine);

            if (isList) {
                sb.append("<ul>\n");
                for (String line : lines)
                    if (!line.isBlank())
                        sb.append("<li>").append(inlineHtml(normaliseBullet(line.trim()))).append("</li>\n");
                sb.append("</ul>\n");
            } else {
                StringBuilder para = new StringBuilder();
                for (String line : lines) {
                    String t = line.trim();
                    if (t.isEmpty()) continue;
                    if (para.length() > 0) para.append(" ");
                    para.append(t);
                }
                if (para.length() > 0)
                    sb.append("<p>").append(inlineHtml(para.toString())).append("</p>\n");
            }
        }
        return sb.toString();
    }

    private String inlineHtml(String line) {
        if (!line.contains("**")) return esc(line);
        String[] parts = line.split("\\*\\*");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            sb.append(i % 2 == 1
                    ? "<strong>" + esc(parts[i]) + "</strong>"
                    : esc(parts[i]));
        }
        return sb.toString();
    }

    private boolean isBulletLine(String line) {
        String t = line.trim();
        return t.startsWith("•")  || t.startsWith("✅") || t.startsWith("▸")
                || t.startsWith("- ") || t.startsWith("* ") || t.startsWith("→")
                || t.matches("^\\d+[.)].+")
                || t.matches("^[①-⑩].+");
    }

    private String normaliseBullet(String line) {
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• "))
            return line.substring(2);
        return line;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CODE SNIPPET  ── Smart page-break aware rendering
    //
    //  Strategy:
    //  • Short blocks (≤ CODE_SPLIT_THRESHOLD lines): wrapped in
    //    page-break-inside:avoid so they always print whole.
    //  • Long blocks (> CODE_SPLIT_THRESHOLD lines): split into N chunks,
    //    each prefixed with a "continued" banner so readers know it flows.
    //    Each chunk still gets page-break-inside:avoid within itself.
    // ═══════════════════════════════════════════════════════════════════

    private String snippetHtml(CodeSnippet cs) {
      String rawCode = cs.getCode() != null ? cs.getCode() : "";
      String normalizedLang = normalizeLanguage(cs.getLanguage(), rawCode);
      String rawLang = normalizedLang;
      String pLang   = prismLang(normalizedLang);
      String accent  = langAccent(normalizedLang);
        String title   = (cs.getTitle() != null && !cs.getTitle().isBlank())
                ? cs.getTitle() : "ឧទាហរណ៍ / Example";

        String[] allLines = rawCode.split("\n", -1);
        int total = allLines.length;

        StringBuilder sb = new StringBuilder();

        if (total <= CODE_SPLIT_THRESHOLD) {
            // ── Short block: render in one go, avoid page break inside ──
            sb.append(renderSnippetChunk(
                    rawLang, pLang, accent, title, esc(rawCode),
                    1, 1, 1, total, total, false));
        } else {
            // ── Long block: split into pages of CODE_SPLIT_THRESHOLD lines ──
            int chunkCount = (int) Math.ceil((double) total / CODE_SPLIT_THRESHOLD);
            for (int c = 0; c < chunkCount; c++) {
                int fromLine = c * CODE_SPLIT_THRESHOLD;          // 0-based
                int toLine   = Math.min(fromLine + CODE_SPLIT_THRESHOLD, total);

                String[] slice = Arrays.copyOfRange(allLines, fromLine, toLine);
                String chunkCode = esc(String.join("\n", slice));

                sb.append(renderSnippetChunk(
                        rawLang, pLang, accent, title, chunkCode,
                        c + 1, chunkCount,
                        fromLine + 1, toLine, total,
                        c > 0));           // showContinued banner on 2nd+ chunks
            }
        }

        // ── Explanation / output block (attached to last snippet chunk) ──
        if (cs.getExplanation() != null && !cs.getExplanation().isBlank()) {
            String expl = cs.getExplanation().trim();
            if (expl.toLowerCase().startsWith("output:")
                    || expl.toLowerCase().startsWith("output :")) {
                String out = expl.replaceFirst("(?i)output\\s*:\\s*", "");
                sb.append("""
                    <div class="out-block" style="page-break-inside:avoid;">
                      <div class="out-lbl">▶&nbsp; Output</div>
                      <div class="out-body">%s</div>
                    </div>
                    """.formatted(esc(out)));
            } else {
                sb.append("""
                    <div class="note-block" style="page-break-inside:avoid;">
                      <span class="note-icon">💡</span>
                      <span class="note-text">%s</span>
                    </div>
                    """.formatted(esc(expl)));
            }
        }

        return sb.toString();
    }

    /**
     * Renders one visual chunk of a code snippet.
     *
     * @param rawLang      display language name (e.g. "JAVA")
     * @param pLang        Prism language slug
     * @param accent       hex accent colour
     * @param title        snippet title
     * @param escapedCode  HTML-escaped code text for this chunk
     * @param chunkNum     1-based chunk index
     * @param chunkTotal   total number of chunks
     * @param fromLine     1-based first line number of this chunk
     * @param toLine       1-based last line number of this chunk
     * @param totalLines   total lines across all chunks
     * @param showContinued whether to render a "continued" banner at the top
     */
    private String renderSnippetChunk(String rawLang, String pLang, String accent,
                                      String title, String escapedCode,
                                      int chunkNum, int chunkTotal,
                                      int fromLine, int toLine, int totalLines,
                                      boolean showContinued) {

        boolean isFirst = chunkNum == 1;
        boolean isLast  = chunkNum == chunkTotal;
        boolean isMulti = chunkTotal > 1;

        // Border-radius: round top corners only on first chunk, bottom only on last
        String borderRadius;
        if (!isMulti) {
            borderRadius = "8px";
        } else if (isFirst) {
            borderRadius = "8px 8px 0 0";
        } else if (isLast) {
            borderRadius = "0 0 8px 8px";
        } else {
            borderRadius = "0";
        }

        // Margin between chunks
        String marginTop = isFirst ? "12px" : "0";

        // "continued" header shown on 2nd+ chunks
        String continuedBanner = showContinued
                ? """
                  <div class="sn-continued">
                    <span class="sn-cont-icon">↳</span>
                    <span class="sn-cont-label">%s&nbsp;<span class="sn-cont-sub">continued (lines %d – %d of %d)</span></span>
                  </div>
                  """.formatted(esc(title), fromLine, toLine, totalLines)
                : "";

        // Top bar: only on first chunk (includes mac dots + lang pill)
        String topBar = isFirst
                ? """
                  <div class="sn-topbar">
                    <span class="sn-mac-dots">
                      <span class="sn-dot-r"></span>
                      <span class="sn-dot-y"></span>
                      <span class="sn-dot-g"></span>
                    </span>
                    <span class="sn-lang-pill" style="color:%s;border-color:%s55;background:%s18;">%s</span>
                    <span class="sn-topbar-title">%s</span>
                    %s
                  </div>
                  """.formatted(
                accent, accent, accent, rawLang, esc(title),
                isMulti ? "<span class=\"sn-line-count\">%d lines total</span>".formatted(totalLines) : "")
                : "";

        // Line-range indicator on non-first chunks (subtle, in the code body header)
        String lineRangeBar = (!isFirst)
                ? """
                  <div class="sn-linerange">Lines %d – %d</div>
                  """.formatted(fromLine, toLine)
                : "";

        // Bottom connector bar shown between chunks (not on last)
        String connectorBar = (!isLast)
                ? "<div class=\"sn-connector\"></div>"
                : "";

        return """
            <div class="snippet" style="
              margin-top:%s;
              border-radius:%s;
              border-left:3px solid %s;
              background:#0d1117;
              page-break-inside:avoid;
              %s
            ">
              %s
              %s
              <div class="sn-body">
                %s
                <pre class="line-numbers" data-start="%d"><code class="language-%s">%s</code></pre>
              </div>
            </div>%s
            """.formatted(
                marginTop,
                borderRadius,
                accent,
                (!isLast && isMulti) ? "border-bottom:none;" : "",
                continuedBanner,
                topBar,
                lineRangeBar,
                fromLine,   // data-start so line numbers are correct on continued chunks
                pLang,
                escapedCode,
                connectorBar);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CSS  ── Light page + Darcula code blocks + page-break rules
    // ═══════════════════════════════════════════════════════════════════

    private String css() {
        return """
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            :root {
              --font-kh: 'Noto Sans Khmer', 'Noto Serif Khmer', serif;
              --font-en: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
              --font-code: 'JetBrains Mono', 'Noto Sans Khmer', 'Noto Serif Khmer', 'Fira Code', Consolas, 'Courier New', monospace;
            }

            body {
              font-family: var(--font-kh), var(--font-en);
              font-size: 11pt; color: #1e293b;
              background: #f8f9fa;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            @page { size: A4; margin: 0; }

            /* ─────── Layout ─────── */
            .page { width: 210mm; min-height: 297mm; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; }
            .page:last-child { page-break-after: avoid; }

            /* ── Global print page-break rules ── */
            /* Lessons try to keep their header + first content together */
            .lesson        { page-break-inside: auto; }
            .ls-header     { page-break-after: avoid; page-break-inside: avoid; }
            /* Content paragraphs and lists flow normally but avoid orphan breaks */
            .ls-body p     { orphans: 3; widows: 3; }
            .ls-body ul    { page-break-inside: avoid; }
            /* Chapter banner always starts on a new line but never breaks mid-banner */
            .ch-banner     { page-break-inside: avoid; page-break-after: avoid; }
            /* TOC rows should not break mid-entry */
            .toc-chapter   { page-break-inside: avoid; }
            .toc-lesson    { page-break-inside: avoid; }
            /* Note and output blocks stay together */
            .note-block    { page-break-inside: avoid; }
            .out-block     { page-break-inside: avoid; }

            /* ════════════════════════════════════════════
               COVER PAGE
            ════════════════════════════════════════════ */
            .cover {
              background: #07100f;
              color: #f0fdf4;
              padding: 48px 56px;
              position: relative;
            }
            .cv-stripe-top {
              position: absolute; top: 0; left: 0; right: 0; height: 6px;
              background: linear-gradient(90deg, #2f8d46 0%, #059669 50%, #10b981 100%);
            }
            .cv-stripe-left {
              position: absolute; top: 0; left: 0; bottom: 0; width: 4px;
              background: linear-gradient(180deg, #2f8d46, #059669 60%, transparent);
            }
            .cv-glow-tr {
              position: absolute; top: -100px; right: -60px;
              width: 380px; height: 380px; border-radius: 50%;
              background: radial-gradient(circle, rgba(47,141,70,.18) 0%, transparent 68%);
              pointer-events: none;
            }
            .cv-glow-bl {
              position: absolute; bottom: 20px; left: 40px;
              width: 220px; height: 220px; border-radius: 50%;
              background: radial-gradient(circle, rgba(5,150,105,.10) 0%, transparent 68%);
              pointer-events: none;
            }
            .cv-brand {
              font-family: 'Inter', sans-serif; font-size: 8pt; font-weight: 700;
              color: #2f8d46; letter-spacing: .12em; text-transform: uppercase;
              display: flex; align-items: center; gap: 8px; margin-bottom: 52px;
            }
            .cv-brand-dot { display: inline-block; width: 8px; height: 8px; background: #2f8d46; border-radius: 50%; }
            .cv-hero    { margin-bottom: 40px; }
            .cv-tag {
              display: inline-block;
              font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 700;
              color: #2f8d46; letter-spacing: .12em;
              border: 1px solid rgba(47,141,70,.40);
              padding: 3px 12px; border-radius: 3px; margin-bottom: 14px;
            }
            .cv-title { font-size: 28pt; font-weight: 800; line-height: 1.5; color: #f0fdf4; margin-bottom: 16px; }
            .cv-rule { width: 56px; height: 4px; background: linear-gradient(90deg, #2f8d46, #10b981); border-radius: 2px; margin-bottom: 18px; }
            .cv-desc { font-size: 10.5pt; color: #6ee7b7; line-height: 2.15; max-width: 88%; }
            .cv-stats {
              display: flex; align-items: stretch; gap: 0;
              background: rgba(255,255,255,.04); border: 1px solid rgba(47,141,70,.22);
              border-radius: 8px; overflow: hidden; margin-bottom: 24px;
            }
            .cv-stat { flex: 1; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
            .cv-stat-div { width: 1px; background: rgba(47,141,70,.20); flex-shrink: 0; }
            .cv-stat-icon { font-size: 15pt; line-height: 1; }
            .cv-stat-info { display: flex; flex-direction: column; gap: 2px; }
            .cv-stat-lbl { font-family: 'Inter', sans-serif; font-size: 7pt; font-weight: 700; color: #6b7280; letter-spacing: .08em; text-transform: uppercase; }
            .cv-stat-val { font-family: 'Inter', sans-serif; font-size: 10.5pt; font-weight: 700; color: #ecfdf5; }
            .cv-meta {
              background: rgba(47,141,70,.08); border-left: 4px solid #2f8d46;
              border-radius: 0 6px 6px 0; padding: 14px 18px;
              display: flex; flex-direction: column; gap: 0; margin-bottom: auto;
            }
            .cv-meta-row { display: flex; align-items: center; gap: 8px; font-size: 9.5pt; color: #a7f3d0; line-height: 2.4; font-family: 'Inter', sans-serif; }
            .cv-meta-icon { font-size: 10pt; }
            .cv-meta-key { font-weight: 600; color: #6ee7b7; min-width: 90px; }
            .cv-meta-sep { color: #2f8d46; font-weight: 700; }
            .cv-meta-val { color: #ecfdf5; }
            .cv-footer {
              margin-top: 32px; display: flex; justify-content: space-between; align-items: center;
              font-family: 'Inter', sans-serif; font-size: 8pt; color: #374151;
              border-top: 1px solid rgba(47,141,70,.18); padding-top: 16px;
            }

            /* ════════════════════════════════════════════
               INNER PAGE  ── light background
            ════════════════════════════════════════════ */
            .inner-page { padding: 40px 52px; flex: 1; background: #ffffff; }

            .pg-header {
              font-family: 'Inter', sans-serif; font-size: 8pt;
              display: flex; justify-content: space-between; align-items: center;
              border-bottom: 2px solid #2f8d46;
              padding-bottom: 8px; margin-bottom: 24px;
            }
            .pg-site  { font-weight: 800; color: #2f8d46; letter-spacing: .05em; }
            .pg-title { color: #64748b; font-size: 7.5pt; max-width: 65%; text-align: right; }

            .pg-footer {
              font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b;
              display: flex; justify-content: space-between; align-items: center;
              border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 24px;
            }
            .pg-num  { font-weight: 800; color: #2f8d46; font-size: 9pt; }
            .pf-brand { font-weight: 600; color: #475569; }
            .pf-site  { color: #2f8d46; font-weight: 600; }

            /* ════════════════════════════════════════════
               TABLE OF CONTENTS
            ════════════════════════════════════════════ */
            .toc-eyebrow {
              display: inline-block; font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 800;
              color: #fff; background: #2f8d46; padding: 3px 12px; letter-spacing: .10em; border-radius: 3px; margin-bottom: 8px;
            }
            .toc-heading { font-size: 22pt; font-weight: 700; color: #0f172a; line-height: 1.5; }
            .toc-heading-sub { font-family: 'Inter', sans-serif; font-size: 13pt; font-weight: 400; color: #64748b; }
            .toc-rule { width: 52%; height: 3px; border-radius: 2px; background: linear-gradient(90deg, #2f8d46, #10b981); margin: 14px 0 22px; }
            .toc-chapter {
              display: flex; align-items: stretch; margin-top: 14px; border-radius: 6px; overflow: hidden;
              box-shadow: 0 1px 4px rgba(47,141,70,.12);
            }
            .toc-ch-num {
              background: #2f8d46; color: #fff; font-family: 'Inter', sans-serif; font-size: 11pt; font-weight: 800;
              padding: 10px 14px; display: flex; align-items: center; justify-content: center; min-width: 42px;
            }
            .toc-ch-body {
              background: #f0fdf4; border-left: 3px solid #2f8d46; padding: 10px 16px; flex: 1;
              display: flex; align-items: center; gap: 12px;
            }
            .toc-ch-title { font-size: 11pt; font-weight: 700; color: #14532d; flex: 1; line-height: 1.7; }
            .toc-ch-count {
              font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 600; color: #2f8d46; white-space: nowrap;
              background: rgba(47,141,70,.12); padding: 2px 8px; border-radius: 10px;
            }
            .toc-lesson { display: flex; align-items: center; font-size: 10pt; color: #334155; padding: 1px 0; }
            .toc-ls-num { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #2f8d46; padding: 5px 10px 5px 56px; min-width: 90px; }
            .toc-ls-title { padding: 5px 0; line-height: 1.85; flex: 1; }
            .toc-ls-dots { width: 40px; border-bottom: 1px dashed #cbd5e1; align-self: center; flex-shrink: 0; margin-right: 8px; }

            /* ════════════════════════════════════════════
               CHAPTER BANNER
            ════════════════════════════════════════════ */
            .ch-banner {
              display: flex; align-items: stretch; border-radius: 8px; overflow: hidden;
              margin-bottom: 24px; box-shadow: 0 2px 12px rgba(47,141,70,.18);
            }
            .ch-badge {
              background: #1a5c2e; padding: 18px 16px;
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              min-width: 78px; gap: 2px;
            }
            .ch-badge-label { font-family: 'Inter', sans-serif; font-size: 7pt; font-weight: 700; color: #86efac; letter-spacing: .05em; }
            .ch-badge-num { font-family: 'Inter', sans-serif; font-size: 28pt; font-weight: 900; color: #fff; line-height: 1; }
            .ch-banner-body {
              background: linear-gradient(135deg, #2f8d46 0%, #059669 100%);
              padding: 18px 24px; flex: 1; display: flex; flex-direction: column; justify-content: center;
            }
            .ch-banner-eyebrow { font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 700; color: #a7f3d0; letter-spacing: .10em; margin-bottom: 5px; }
            .ch-banner-title { font-size: 16pt; font-weight: 700; color: #fff; line-height: 1.6; }
            .ch-banner-deco { width: 5px; background: rgba(255,255,255,.15); }
            .ch-desc {
              color: #475569; font-size: 10pt; line-height: 2.15; margin-bottom: 16px;
              padding: 10px 14px; background: #f0fdf4;
              border-left: 3px solid rgba(47,141,70,.30); border-radius: 0 4px 4px 0;
            }

            /* ════════════════════════════════════════════
               LESSON
            ════════════════════════════════════════════ */
            .lesson    { margin-bottom: 10px; }
            .ls-header {
              display: flex; align-items: stretch; margin: 18px 0 10px;
              border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(47,141,70,.10);
            }
            .ls-num {
              background: #2f8d46; color: #fff; font-family: 'Inter', sans-serif;
              font-size: 8.5pt; font-weight: 800; padding: 8px 10px;
              display: flex; align-items: center; justify-content: center; min-width: 44px; letter-spacing: .03em;
            }
            .ls-title {
              background: #f0fdf4; border-left: 3px solid #2f8d46;
              padding: 8px 16px; font-size: 12pt; font-weight: 700; color: #14532d; flex: 1; line-height: 1.7;
            }
            .ls-body { font-size: 10.5pt; line-height: 2.1; color: #334155; margin-bottom: 10px; }
            .ls-body,
            .ls-body p,
            .ls-body li,
            .ch-desc,
            .toc-ls-title,
            .cv-desc,
            .note-text {
              font-family: var(--font-kh), var(--font-en);
            }
            .ls-body p  { margin-bottom: 10px; }
            .ls-body ul { padding-left: 22px; margin-bottom: 10px; }
            .ls-body li { margin-bottom: 4px; line-height: 2; list-style: none; padding-left: 4px; position: relative; }
            .ls-body li::before { content: "▸"; color: #2f8d46; font-size: 9pt; position: absolute; left: -16px; }
            .h-rule { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 6px; }

            /* ════════════════════════════════════════════
               CODE SNIPPET  ── GFG light-blue style
            ════════════════════════════════════════════ */

            .snippet {
              margin: 12px 0 6px;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #c8d8e8;
              box-shadow: 0 2px 8px rgba(0,0,0,.08);
              /* Each .snippet chunk has page-break-inside:avoid set inline */
            }

            /* ════════════════════════════════════════════
               CODE SNIPPET  ── Tokyo Night dark theme
               Deep navy bg · vibrant semantic token colours
               Mirrors the web CodeBlock theme exactly.
            ════════════════════════════════════════════ */

            /* ── Outer wrapper ── */
            .snippet {
              /* border, radius, margin come from inline style (chunk-aware) */
              overflow: hidden;
              border: 1px solid rgba(255,255,255,0.08);
              box-shadow: 0 4px 18px rgba(0,0,0,.45);
            }

            /* ── "Continued" banner: shown on 2nd+ chunks ── */
            .sn-continued {
              display: flex; align-items: center; gap: 8px;
              background: #1a1f35; border-bottom: 1px solid rgba(255,255,255,0.07);
              padding: 5px 14px;
              font-family: 'Inter', sans-serif; font-size: 7.5pt;
            }
            .sn-cont-icon  { color: #7dcfff; font-weight: 800; font-size: 9pt; }
            .sn-cont-label { color: #9aa5ce; font-weight: 600; }
            .sn-cont-sub   { color: #565f89; font-weight: 400; font-style: italic; }

            /* ── Line range indicator ── */
            .sn-linerange {
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 7pt; font-weight: 600;
              color: #3d4255; background: #0d1117;
              padding: 2px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
              letter-spacing: .04em;
            }

            /* ── Line count badge in topbar ── */
            .sn-line-count {
              margin-left: auto;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 7pt; color: #565f89;
              background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.10);
              padding: 1px 8px; border-radius: 10px;
            }

            /* ── Connector dashes between chunks ── */
            .sn-connector {
              height: 3px;
              background: repeating-linear-gradient(
                90deg, rgba(122,162,247,0.25) 0px, rgba(122,162,247,0.25) 5px,
                transparent 5px, transparent 11px
              );
            }

            /* ── Top bar (first chunk only) ── */
            .sn-topbar {
              display: flex;
              align-items: center;
              gap: 10px;
              /* Three-stop dark header — just slightly lighter than code body */
              background: #161b22;
              border-bottom: 1px solid rgba(255,255,255,0.06);
              padding: 8px 16px;
              min-height: 38px;
            }

            /* ── Traffic-light dots ── */
            .sn-mac-dots {
              display: flex; gap: 5px; align-items: center; flex-shrink: 0; margin-right: 4px;
            }
            .sn-dot-r { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
            .sn-dot-y { width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; }
            .sn-dot-g { width: 10px; height: 10px; border-radius: 50%; background: #28c840; }

            /* ── Language pill ── */
            .sn-lang-pill {
              font-family: 'Inter', sans-serif;
              font-size: 6.5pt;
              font-weight: 800;
              letter-spacing: .09em;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 20px;
              border: 1px solid;
              white-space: nowrap;
              /* colour / border set by inline style from langAccent() */
            }

            /* ── Snippet title ── */
            .sn-topbar-title {
              font-family: var(--font-code);
              font-size: 7.5pt;
              font-weight: 400;
              color: #565f89;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            /* ── Code body — deep GitHub-dark navy ── */
            .sn-body {
              background: #0d1117;
              padding: 0;
            }

            .sn-body pre[class*="language-"] {
              margin: 0 !important;
              border-radius: 0 !important;
              font-family: var(--font-code) !important;
              font-size: 8.5pt !important;
              line-height: 1.9 !important;
              padding: 14px 20px !important;
              background: #0d1117 !important;
              border: none !important;
              color: #c0caf5 !important;
              white-space: pre-wrap !important;
              word-break: break-all !important;
              overflow-x: hidden !important;
            }

            /*
             * ══════════════════════════════════════════════════════════
             *  TOKEN COLOURS — Tokyo Night palette
             *  Rules use maximum specificity so they beat prism-tomorrow.
             *  Semantic map:
             *    keyword    #bb9af7  violet-pink   control flow
             *    class-name #7dcfff  sky blue      types / classes
             *    function   #9ece6a  chartreuse    callables
             *    string     #e0af68  apricot       string literals
             *    number     #2ac3de  cyan-mint     numeric literals
             *    boolean    #f7768e  rose-pink     bool / null / const
             *    comment    #565f89  steel-muted   recedes
             *    operator   #89b4fa  lavender      structural glue
             *    property   #73daca  sea-foam      object members
             *    annotation #e0af68  amber         decorators / meta
             *    tag        #f7768e  coral-pink    HTML/JSX tags
             *    attr-name  #7aa2f7  powder blue   HTML attribute keys
             *    attr-value #9ece6a  warm green    HTML attribute values
             *    regex      #ff9e64  orange        patterns / URLs
             *    selector   #bb9af7  violet        CSS selectors
             * ══════════════════════════════════════════════════════════
             */

            /* ── Base code text ── */
            .sn-body pre[class*="language-"],
            .sn-body pre[class*="language-"] code,
            .sn-body code[class*="language-"] {
              color: #c0caf5 !important;
              background: #0d1117 !important;
              text-shadow: none !important;
            }

            /* Ensure plain, un-tokenized snippets still read with high contrast */
            .sn-body code[class*="language-"]:not([class*="language-none"]) {
              color: #c0caf5 !important;
            }

            /* ── Line-numbers gutter ── */
            .sn-body pre.line-numbers {
              padding-left: 3.5em !important;
              position: relative;
            }
            .sn-body .line-numbers .line-numbers-rows {
              border-right: 1px solid rgba(255,255,255,0.06) !important;
              top: 0 !important;
            }
            .sn-body .line-numbers-rows > span:before {
              color: #3d4255 !important;
              font-size: 8pt !important;
            }

            /* ── Punctuation ── */
            .sn-body .token.punctuation           { color: #9aa5ce !important; }

            /* ── Keywords ── */
            .sn-body .token.keyword               { color: #bb9af7 !important; font-weight: 600 !important; }
            .sn-body .token.important             { color: #bb9af7 !important; font-weight: 700 !important; }
            .sn-body .token.atrule                { color: #bb9af7 !important; }
            .sn-body .token.rule                  { color: #73daca !important; }

            /* ── Types / class names ── */
            .sn-body .token.class-name            { color: #7dcfff !important; font-weight: 600 !important; }
            .sn-body .token.builtin               { color: #7dcfff !important; }
            .sn-body .token.maybe-class-name      { color: #7dcfff !important; }
            .sn-body .token.type                  { color: #7dcfff !important; }

            /* ── Functions ── */
            .sn-body .token.function              { color: #9ece6a !important; }
            .sn-body .token.function-variable     { color: #9ece6a !important; }
            .sn-body .token.method                { color: #9ece6a !important; }

            /* ── Strings ── */
            .sn-body .token.string                { color: #e0af68 !important; }
            .sn-body .token.char                  { color: #e0af68 !important; }
            .sn-body .token.template-string       { color: #e0af68 !important; }
            .sn-body .token.template-punctuation  { color: #9aa5ce !important; }

            /* ── Numbers ── */
            .sn-body .token.number                { color: #2ac3de !important; }

            /* ── Booleans / null / constants ── */
            .sn-body .token.boolean               { color: #f7768e !important; }
            .sn-body .token.constant              { color: #f7768e !important; }
            .sn-body .token.null                  { color: #f7768e !important; }
            .sn-body .token.undefined             { color: #f7768e !important; }
            .sn-body .token.symbol                { color: #f7768e !important; }

            /* ── Comments ── */
            .sn-body .token.comment               { color: #565f89 !important; font-style: italic !important; }
            .sn-body .token.prolog                { color: #565f89 !important; }
            .sn-body .token.doctype               { color: #565f89 !important; }
            .sn-body .token.cdata                 { color: #565f89 !important; }

            /* ── Operators ── */
            .sn-body .token.operator              { color: #89b4fa !important; }
            .sn-body .token.arrow                 { color: #89b4fa !important; }

            /* ── Properties / keys ── */
            .sn-body .token.property              { color: #73daca !important; }
            .sn-body .token.property-access       { color: #73daca !important; }

            /* ── Annotations / decorators ── */
            .sn-body .token.annotation            { color: #e0af68 !important; }
            .sn-body .token.decorator             { color: #e0af68 !important; }

            /* ── Variables ── */
            .sn-body .token.variable              { color: #c0caf5 !important; }
            .sn-body .token.parameter             { color: #c0caf5 !important; }

            /* ── HTML/JSX tags ── */
            .sn-body .token.tag                   { color: #f7768e !important; }
            .sn-body .token.tag .token.punctuation { color: #9aa5ce !important; }

            /* ── HTML attribute names ── */
            .sn-body .token.attr-name             { color: #7aa2f7 !important; }

            /* ── HTML attribute values ── */
            .sn-body .token.attr-value            { color: #9ece6a !important; }
            .sn-body .token.attr-value .token.punctuation { color: #9aa5ce !important; }

            /* ── Regex / URL ── */
            .sn-body .token.regex                 { color: #ff9e64 !important; }
            .sn-body .token.url                   { color: #ff9e64 !important; }

            /* ── CSS selectors ── */
            .sn-body .token.selector              { color: #bb9af7 !important; }

            /* ── Diff colors ── */
            .sn-body .token.inserted              { color: #9ece6a !important; }
            .sn-body .token.deleted               { color: #f7768e !important; }

            /* ── Namespace (fade slightly) ── */
            .sn-body .token.namespace             { opacity: 0.75; }

            /* Khmer + English friendly rendering inside highlighted code */
            .sn-body .token,
            .sn-body code,
            .sn-body pre {
              font-family: var(--font-code) !important;
              font-variant-ligatures: common-ligatures;
            }

            /* ════════════════════════════════════════════
               NOTE / OUTPUT
            ════════════════════════════════════════════ */
            .note-block {
              display: flex; align-items: flex-start; gap: 8px;
              background: #f0fdf4; border-left: 4px solid #2f8d46;
              padding: 10px 14px; margin: 6px 0 18px;
              font-size: 9.5pt; line-height: 1.9; border-radius: 0 6px 6px 0;
            }
            .note-icon { font-size: 11pt; flex-shrink: 0; margin-top: 1px; }
            .note-text { color: #15803d; }

            .out-block  { margin: 4px 0 18px; border-radius: 0 0 8px 8px; overflow: hidden; }
            .out-lbl {
              background: #2f8d46; padding: 5px 14px;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 8pt; color: #fff; font-weight: 700; letter-spacing: .05em;
            }
            .out-body {
              background: #f0f7f0; border: 1px solid #c8e0c8; border-top: none;
              padding: 12px 18px;
              font-family: var(--font-code);
              font-size: 8.5pt; color: #1a3a1a; line-height: 1.8;
              white-space: pre-wrap; word-break: break-word;
            }
            """;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private String stripHtml(String s) {
        return s.replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;",  " ")
                .replaceAll("&amp;",   "&")
                .replaceAll("&lt;",    "<")
                .replaceAll("&gt;",    ">")
                .replaceAll("&quot;",  "\"")
                .replaceAll("[ \\t]{2,}", " ")
                .trim();
    }
}