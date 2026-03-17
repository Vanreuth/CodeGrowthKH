package finalproject.backend.service;

import jakarta.annotation.PostConstruct;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.Margin;
import com.microsoft.playwright.options.WaitUntilState;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

/**
 * Generates course PDFs via Playwright (headless Chromium).
 *
 * ── Speed optimisations ────────────────────────────────────────────────
 *  1. SINGLETON BROWSER  — injected from PlaywrightConfig and created lazily
 *     on first PDF request, not during web-service startup.
 *
 *  2. INLINED PRISM BUNDLE — Prism assets loaded from classpath resources
 *     and embedded as a single <script> block. No runtime CDN dependency.
 *
 *  3. INLINED PRISM CSS — theme + line-numbers CSS embedded in <style>.
 *     Saves extra asset round-trips per request.
 *
 *  4. RESOURCE BLOCKING — images / media aborted at browser level.
 *
 *  5. SINGLE COMBINED WAIT — fonts + Prism checked in one JS poll.
 *     The hardcoded 500 ms sleep is removed.
 * ──────────────────────────────────────────────────────────────────────
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CoursePdfGeneratorService {

    // ── Injected singleton browser provider (from PlaywrightConfig) ───────
    private final ObjectProvider<Browser> browserProvider;

    private static final List<String> PRISM_RESOURCE_PATHS = List.of(
            "/pdf/prism.min.js",
            "/pdf/prism-markup-templating.min.js",
            "/pdf/prism-typescript.min.js",
            "/pdf/prism-jsx.min.js",
            "/pdf/prism-tsx.min.js",
            "/pdf/prism-java.min.js",
            "/pdf/prism-python.min.js",
            "/pdf/prism-sql.min.js",
            "/pdf/prism-bash.min.js",
            "/pdf/prism-json.min.js",
            "/pdf/prism-kotlin.min.js",
            "/pdf/prism-dart.min.js",
            "/pdf/prism-php.min.js",
            "/pdf/prism-c.min.js",
            "/pdf/prism-cpp.min.js",
            "/pdf/prism-swift.min.js",
            "/pdf/prism-go.min.js",
            "/pdf/prism-rust.min.js",
            "/pdf/prism-csharp.min.js",
            "/pdf/prism-yaml.min.js",
            "/pdf/prism-docker.min.js",
            "/pdf/prism-graphql.min.js",
            "/pdf/prism-line-numbers.min.js"
    );

    // ── Timeouts ──────────────────────────────────────────────────────────
    private static final double CONTENT_TIMEOUT_MS = 60_000;
    private static final double ASSET_TIMEOUT_MS   = 15_000;

    // ── Code-block split threshold ────────────────────────────────────────
    private static final int CODE_SPLIT_THRESHOLD = 38;

    // ── Pre-fetched assets (populated once on first use) ──────────────────
    private String prismBundle         = "";
    private String prismThemeCss       = "";
    private String prismLineNumbersCss = "";
    private String localFontsCss       = "";
    private String logoDataUri         = "";
    private final Object prismLock = new Object();
    private volatile boolean prismAssetsLoaded;

    // ── GFG Green palette ─────────────────────────────────────────────────
    private static final String G_PRIMARY = "#2f8d46";

    // ═══════════════════════════════════════════════════════════════════
    //  PDF ASSETS — load once from classpath, inline them forever after
    // ═══════════════════════════════════════════════════════════════════

    private void ensurePrismAssetsLoaded() {
        if (prismAssetsLoaded) {
            return;
        }

        synchronized (prismLock) {
            if (prismAssetsLoaded) {
                return;
            }

            log.info("⚡ Loading PDF assets from classpath …");
            long t0 = System.currentTimeMillis();

            prismThemeCss = readRequiredResource("/pdf/prism-tomorrow.min.css");
            prismLineNumbersCss = readRequiredResource("/pdf/prism-line-numbers.min.css");
            localFontsCss = readOptionalResource("/pdf/fonts.css");
            logoDataUri = readOptionalBinaryResource("/pdf/growth.png", "image/png");

            StringBuilder sb = new StringBuilder();
            for (String path : PRISM_RESOURCE_PATHS) {
                sb.append(readRequiredResource(path)).append('\n');
            }
            prismBundle = sb.toString();
            prismAssetsLoaded = true;

            log.info("✅ PDF assets ready — {} KB in {} ms",
                    prismBundle.length() / 1024, System.currentTimeMillis() - t0);
        }
    }

    @PostConstruct
    void warmup() {
        ensurePrismAssetsLoaded();
        warmBrowser();
    }

    private void warmBrowser() {
        try {
            Browser browser = browserProvider.getObject();
            try (BrowserContext ctx = browser.newContext(
                    new Browser.NewContextOptions().setLocale("km-KH"))) {
                Page page = ctx.newPage();
                page.setContent("<html><body>Warmup</body></html>");
                page.pdf(new Page.PdfOptions().setFormat("A4"));
            }
            log.info("✅ Playwright PDF warmup complete");
        } catch (Exception e) {
            log.warn("Playwright warmup failed: {}", e.getMessage());
        }
    }

    private String readRequiredResource(String path) {
        String text = readResource(path);
        if (text.isEmpty()) {
            throw new IllegalStateException("Missing required PDF asset: " + path);
        }
        return text;
    }

    private String readOptionalResource(String path) {
        return readResource(path);
    }

    private String readOptionalBinaryResource(String path, String contentType) {
        ClassPathResource resource = new ClassPathResource(path.startsWith("/") ? path.substring(1) : path);
        if (!resource.exists()) {
            return "";
        }

        try (InputStream in = resource.getInputStream()) {
            return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(in.readAllBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read binary resource: " + path, e);
        }
    }

    private String readResource(String path) {
        ClassPathResource resource = new ClassPathResource(path.startsWith("/") ? path.substring(1) : path);
        if (!resource.exists()) {
            return "";
        }

        try (InputStream in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read resource: " + path, e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PUBLIC generate()
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generate(Course course) {
        long t0 = System.currentTimeMillis();
        log.info("🖨️  Generating PDF — course='{}'", course.getSlug());
        ensurePrismAssetsLoaded();
        Browser browser = browserProvider.getObject();

        try (BrowserContext ctx = browser.newContext(
                new Browser.NewContextOptions().setLocale("km-KH"))) {

            // Block images / media — they are never needed for PDF
            ctx.route("**/*", route -> {
                String type = route.request().resourceType();
                if (type.equals("image") || type.equals("media")
                        || type.equals("websocket") || type.equals("other"))
                    route.abort();
                else
                    route.resume();
            });

            Page page = ctx.newPage();
            page.setDefaultTimeout(CONTENT_TIMEOUT_MS);

            page.setContent(buildHtml(course),
                    new Page.SetContentOptions()
                            .setTimeout(CONTENT_TIMEOUT_MS)
                            .setWaitUntil(WaitUntilState.DOMCONTENTLOADED));

            waitForReady(page);

            byte[] pdf = page.pdf(new Page.PdfOptions()
                    .setFormat("A4")
                    .setPrintBackground(true)
                    .setMargin(new Margin()
                            .setTop("0mm").setBottom("0mm")
                            .setLeft("0mm").setRight("0mm")));

            log.info("✅ PDF done — '{}' in {} ms",
                    course.getSlug(), System.currentTimeMillis() - t0);
            return pdf;

        } catch (Exception e) {
            log.error("❌ PDF failed — {}: {}", course.getId(), e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    // Single combined wait — replaces 3 sequential waitForFunction calls + 500 ms sleep
    private void waitForReady(Page page) {
        try {
            page.waitForLoadState(LoadState.NETWORKIDLE,
                    new Page.WaitForLoadStateOptions().setTimeout(ASSET_TIMEOUT_MS));
        } catch (PlaywrightException e) {
            log.warn("Network idle not reached: {}", e.getMessage());
        }

        try {
            page.waitForFunction(
                    """
                    () => {
                      const fontsOk = !document.fonts || document.fonts.status === 'loaded';
                      const prismOk = window.__prismDone === true;
                      return fontsOk && prismOk;
                    }
                    """,
                    null,
                    new Page.WaitForFunctionOptions()
                            .setTimeout(ASSET_TIMEOUT_MS)
                            .setPollingInterval(50));
        } catch (PlaywrightException e) {
            log.warn("Assets not fully ready: {}", e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  HTML BUILDER
    // ═══════════════════════════════════════════════════════════════════

    private String buildHtml(Course course) {
        String level      = course.getLevel()      != null ? course.getLevel().toString() : "—";
        String lang       = course.getLanguage()   != null ? course.getLanguage()         : "Khmer";
        boolean isFree    = Boolean.TRUE.equals(course.getIsFree());
        String instructor = course.getInstructor() != null
                ? course.getInstructor().getUsername() : "CodeGrowthKH";
        String date       = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        int lessons       = course.getTotalLessons() != null ? course.getTotalLessons() : 0;

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"km\">\n<head>\n")
                .append("<meta charset=\"UTF-8\">\n")
                .append("<style>\n")
                .append(localFontsCss).append('\n')
                .append(prismThemeCss).append('\n')
                .append(prismLineNumbersCss).append('\n')
                .append(css())
                .append("</style>\n</head>\n<body>\n");

        html.append(coverPage(course, level, lang, isFree, instructor, date, lessons));
        html.append(tocPage(course));

        int ci = 0;
        for (Chapter ch : course.getChapters())
            html.append(chapterPage(ch, ++ci));

        html.append(footerInfoPage());

        // Prism JS inlined — 1 script block instead of 22 CDN requests
        html.append("<script>\n")
                .append(prismBundle)
                .append("\nwindow.__prismDone=false;")
                .append("""
                        setTimeout(() => {
                          try {
                            if (typeof Prism !== 'undefined') {
                              Prism.highlightAll();
                            }
                          } finally {
                            window.__prismDone = true;
                          }
                        }, 0);
                        """)
                .append("\n</script>\n")
                .append("</body>\n</html>");

        return html.toString();
    }

    // ═══════════════════════════════════════════════════════════════════
    //  LANGUAGE HELPERS
    // ═══════════════════════════════════════════════════════════════════

    private static String langAccent(String lang) {
        if (lang == null) return G_PRIMARY;
        return switch (lang.toUpperCase()) {
            case "HTML"                              -> "#e44d26";
            case "CSS"                               -> "#268fe4";
            case "JS", "JAVASCRIPT"                  -> "#f0a500";
            case "JSX", "TSX", "REACT", "NEXT",
                 "NEXTJS"                            -> "#61dafb";
            case "TS", "TYPESCRIPT"                  -> "#3178c6";
            case "JAVA", "SPRING", "SPRINGBOOT"      -> "#5382a1";
            case "PYTHON"                            -> "#3572a5";
            case "SQL"                               -> "#e38c00";
            case "BASH", "SH", "SHELL"               -> "#4caf50";
            case "JSON"                              -> "#cbcb41";
            case "XML"                               -> "#f1672d";
            case "KOTLIN"                            -> "#a97bff";
            case "DART"                              -> "#00b4ab";
            case "PHP"                               -> "#8993be";
            case "C", "CPP", "C++"                  -> "#607d8b";
            case "SWIFT"                             -> "#f05138";
            case "GO"                                -> "#00acd7";
            case "RUST"                              -> "#dea584";
            case "CS", "C#", "CSHARP"               -> "#7b4fc9";
            default                                  -> G_PRIMARY;
        };
    }

    private static String prismLang(String lang) {
        if (lang == null) return "markup";
        return switch (lang.toUpperCase()) {
            case "HTML", "XML"                       -> "markup";
            case "CSS"                               -> "css";
            case "JS", "JAVASCRIPT"                  -> "javascript";
            case "JSX", "REACT", "NEXT", "NEXTJS"   -> "jsx";
            case "TS", "TYPESCRIPT"                  -> "typescript";
            case "TSX"                               -> "tsx";
            case "JAVA", "SPRING", "SPRINGBOOT"      -> "java";
            case "PYTHON"                            -> "python";
            case "SQL"                               -> "sql";
            case "BASH", "SH", "SHELL"               -> "bash";
            case "JSON"                              -> "json";
            case "KOTLIN"                            -> "kotlin";
            case "DART"                              -> "dart";
            case "PHP"                               -> "php";
            case "C"                                 -> "c";
            case "CPP", "C++"                        -> "cpp";
            case "SWIFT"                             -> "swift";
            case "GO"                                -> "go";
            case "RUST"                              -> "rust";
            case "CS", "C#", "CSHARP"               -> "csharp";
            case "YAML", "YML"                       -> "yaml";
            case "DOCKERFILE"                        -> "docker";
            default                                  -> "clike";
        };
    }

    private static String normalizeLanguage(String lang, String code) {
        String raw = lang == null ? "" : lang.trim();
        if (raw.isEmpty()) return detectLanguageFromCode(code);
        String key = raw.toUpperCase()
                .replace("-", "").replace("_", "").replace(" ", "");
        return switch (key) {
            case "JS", "JAVASCRIPT", "NODE", "NODEJS" -> "JAVASCRIPT";
            case "TS", "TYPESCRIPT"                    -> "TYPESCRIPT";
            case "JSX", "REACT", "REACTJS",
                 "NEXT", "NEXTJS"                      -> "JSX";
            case "TSX"                                 -> "TSX";
            case "HTML", "HTML5", "XHTML", "XML"       -> "HTML";
            case "PY", "PYTHON"                        -> "PYTHON";
            case "SHELL", "BASH", "SH", "ZSH"         -> "BASH";
            case "C#", "CS", "CSHARP"                 -> "CSHARP";
            case "TXT", "TEXT", "PLAINTEXT", "CODE",
                 "NONE", "NA", "N/A"                   -> detectLanguageFromCode(code);
            default                                    -> raw.toUpperCase();
        };
    }

    private static String detectLanguageFromCode(String code) {
        if (code == null || code.isBlank()) return "JAVASCRIPT";
        String s = code.strip();
        if (s.startsWith("{") || s.startsWith("["))                                      return "JSON";
        if (s.contains("import React") || s.contains(" from 'react'")
                || s.contains("</") || s.contains("<>") || s.contains("className="))    return "JSX";
        if (s.startsWith("<!DOCTYPE") || s.contains("<html") || s.contains("<div"))     return "HTML";
        if (s.contains("public class") || s.contains("System.out.println")
                || s.contains("@SpringBootApplication"))                                 return "JAVA";
        if (s.contains("def ") || s.contains("import pandas") || s.contains("print(")) return "PYTHON";
        if (s.contains("SELECT ") || s.contains("INSERT INTO")
                || s.contains("CREATE TABLE"))                                           return "SQL";
        if (s.startsWith("#!/bin/bash") || s.startsWith("#!/usr/bin/env bash")
                || s.contains("echo "))                                                  return "BASH";
        if (s.contains("{") && s.contains("}")
                && (s.contains("=>") || s.contains("const ")
                || s.contains("let ") || s.contains("function ")))                   return "JAVASCRIPT";
        return "JAVASCRIPT";
    }

    // ═══════════════════════════════════════════════════════════════════
    //  COVER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String coverPage(Course course, String level, String lang,
                             boolean isFree, String instructor, String date, int lessons) {
        String accessColor = isFree ? "#10b981" : "#f59e0b";
        String accessBg    = isFree ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)";
        String access      = isFree ? "FREE" : "PREMIUM";
        String desc        = course.getDescription() != null ? course.getDescription() : "";
        String requirements = course.getRequirements() != null ? course.getRequirements().trim() : "";
        int    chCount     = course.getChapters()    != null ? course.getChapters().size() : 0;
        String logoHtml    = logoDataUri.isBlank()
                ? "<div class=\"cv-logo-fallback\"></div>"
                : "<img src=\"" + logoDataUri + "\" alt=\"CodeGrowthKH\" class=\"cv-logo-img\" />";
        String requirementsHtml = requirements.isBlank()
                ? "<p class=\"cv-req-empty\">No prerequisites listed</p>"
                : "<p class=\"cv-req-text\">" + esc(requirements) + "</p>";

        return """
            <div class="page cover">
              <div class="cv-glow-tr"></div><div class="cv-glow-bl"></div>
              <div class="cv-topbar">
                <div class="cv-brand">
                  <div class="cv-logo-wrap">%s</div>
                  <div class="cv-brand-copy">
                    <div class="cv-brand-name">CodeGrowthKH</div>
                    <div class="cv-brand-tagline">រៀនកូដជាភាសាខ្មែរ</div>
                  </div>
                </div>
                <div class="cv-tag">COURSE DOCUMENTATION</div>
              </div>
              <div class="cv-hero">
                <h1 class="cv-title">%s</h1>
                <div class="cv-rule"></div>
                <p class="cv-desc">%s</p>
                <div class="cv-req-card">
                  <div class="cv-req-label">Requirements</div>
                  %s
                </div>
              </div>
              <div class="cv-stats">
                <div class="cv-stat"><div class="cv-stat-icon">📊</div><div class="cv-stat-info"><div class="cv-stat-lbl">Level</div><div class="cv-stat-val">%s</div></div></div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat"><div class="cv-stat-icon">🌐</div><div class="cv-stat-info"><div class="cv-stat-lbl">Language</div><div class="cv-stat-val">%s</div></div></div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat"><div class="cv-stat-icon">📚</div><div class="cv-stat-info"><div class="cv-stat-lbl">Lessons</div><div class="cv-stat-val">%d</div></div></div>
                <div class="cv-stat-div"></div>
                <div class="cv-stat"><div class="cv-stat-icon">📂</div><div class="cv-stat-info"><div class="cv-stat-lbl">Chapters</div><div class="cv-stat-val">%d</div></div></div>
              </div>
              <div class="cv-meta">
                <div class="cv-meta-row"><span class="cv-meta-icon">📅</span><span class="cv-meta-key">Generated</span><span class="cv-meta-sep">·</span><span class="cv-meta-val">%s</span></div>
                <div class="cv-meta-row"><span class="cv-meta-icon">🌍</span><span class="cv-meta-key">Platform</span><span class="cv-meta-sep">·</span><span class="cv-meta-val" style="color:#2f8d46;">codegrowthkh.site</span></div>
              </div>
              <div class="cv-footer">
                <span class="cv-footer-brand">CodeGrowthKH</span>
                <span class="cv-footer-copy">© %d CodeGrowthKH — All rights reserved</span>
                <span class="cv-footer-site">codegrowthkh.site</span>
              </div>
            </div>
            """.formatted(logoHtml, esc(course.getTitle()), esc(desc),
                requirementsHtml,
                esc(level), esc(lang), lessons, chCount,
                esc(date), LocalDate.now().getYear());
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════════════

    private String tocPage(Course course) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header"><span class="pg-site">codegrowthkh.site</span><span class="pg-title">%s</span></div>
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
                        .append("<span class=\"toc-ls-title\">").append(esc(ls.getTitle())).append("</span>")
                        .append("<span class=\"toc-ls-dots\"></span></div>\n");
            }
        }
        sb.append("""
              <div class="pg-footer">
                <span class="pf-brand">CodeGrowthKH</span>
                <span class="pg-num">— 2 —</span>
                <span class="pf-site">រៀនកូដជាភាសាខ្មែរ · codegrowthkh.site</span>
              </div>
            </div>
            """);
        return sb.toString();
    }

    private String footerInfoPage() {
        return """
            <div class="page footer-page">
              <div class="fp-section">
                <h2 class="fp-heading">អំពីយើង</h2>
                <p class="fp-copy">
                  CodeGrowthKH គឺជាវេទិកាសិក្សា IT ជាភាសាខ្មែរ ដែលផ្តោតលើមេរៀនងាយយល់
                  roadmap ជាក់ស្តែង និងការអនុវត្តដែលជួយអ្នករៀនក្លាយជា developer បានពិតប្រាកដ។
                </p>
                <p class="fp-copyright">© %d CodeGrowthKH. All Rights Reserved.</p>
              </div>

              <div class="fp-section">
                <h2 class="fp-heading">តំណភ្ជាប់រហ័ស</h2>
                <div class="fp-links">
                  <span>ទំព័រដើម</span>
                  <span>វគ្គសិក្សា</span>
                  <span>អំពីយើង</span>
                  <span>ទំនាក់ទំនង</span>
                </div>
              </div>

              <div class="fp-section">
                <h2 class="fp-heading">ទំនាក់ទំនង</h2>
                <p class="fp-subcopy">សូមទាក់ទងមកកាន់យើងតាមរយៈ:</p>
                <p class="fp-contact">Email: codegrowthkh@gmail.com</p>
                <p class="fp-contact">Telegram: https://t.me/Vanreuth</p>
                <p class="fp-contact">Facebook: facebook.com/codegrowthkh</p>
              </div>

              <div class="fp-socials">
                <span class="fp-social fp-facebook">f</span>
                <span class="fp-social fp-telegram">✈</span>
                <span class="fp-social fp-youtube">▶</span>
              </div>

              <div class="fp-bottom">© %d CodeGrowthKH. All rights reserved.</div>
            </div>
            """.formatted(LocalDate.now().getYear(), LocalDate.now().getYear());
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CHAPTER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private String chapterPage(Chapter chapter, int ci) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <div class="page inner-page">
              <div class="pg-header"><span class="pg-site">codegrowthkh.site</span><span class="pg-title">Chapter %d · %s</span></div>
              <div class="ch-banner">
                <div class="ch-badge"><div class="ch-badge-label">ជំពូក</div><div class="ch-badge-num">%02d</div></div>
                <div class="ch-banner-body"><div class="ch-banner-eyebrow">CHAPTER %d</div><div class="ch-banner-title">%s</div></div>
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
                <span class="pf-brand">CodeGrowthKH</span>
                <span class="pg-num">— %d —</span>
                <span class="pf-site">រៀនកូដជាភាសាខ្មែរ · codegrowthkh.site</span>
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
            sb.append(i % 2 == 1 ? "<strong>" + esc(parts[i]) + "</strong>" : esc(parts[i]));
        }
        return sb.toString();
    }

    private boolean isBulletLine(String line) {
        String t = line.trim();
        return t.startsWith("•") || t.startsWith("✅") || t.startsWith("▸")
                || t.startsWith("- ") || t.startsWith("* ") || t.startsWith("→")
                || t.matches("^\\d+[.)].+") || t.matches("^[①-⑩].+");
    }

    private String normaliseBullet(String line) {
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• "))
            return line.substring(2);
        return line;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CODE SNIPPET
    // ═══════════════════════════════════════════════════════════════════

    private String snippetHtml(CodeSnippet cs) {
        String rawCode  = cs.getCode() != null ? cs.getCode() : "";
        String normLang = normalizeLanguage(cs.getLanguage(), rawCode);
        String pLang    = prismLang(normLang);
        String accent   = langAccent(normLang);
        String title    = (cs.getTitle() != null && !cs.getTitle().isBlank())
                ? cs.getTitle() : "ឧទាហរណ៍ / Example";

        String[] allLines = rawCode.split("\n", -1);
        int total = allLines.length;
        StringBuilder sb = new StringBuilder();

        if (total <= CODE_SPLIT_THRESHOLD) {
            sb.append(renderChunk(normLang, pLang, accent, title,
                    esc(rawCode), 1, 1, 1, total, total, false));
        } else {
            int chunks = (int) Math.ceil((double) total / CODE_SPLIT_THRESHOLD);
            for (int c = 0; c < chunks; c++) {
                int from = c * CODE_SPLIT_THRESHOLD;
                int to   = Math.min(from + CODE_SPLIT_THRESHOLD, total);
                sb.append(renderChunk(normLang, pLang, accent, title,
                        esc(String.join("\n", Arrays.copyOfRange(allLines, from, to))),
                        c + 1, chunks, from + 1, to, total, c > 0));
            }
        }

        if (cs.getExplanation() != null && !cs.getExplanation().isBlank()) {
            String expl = cs.getExplanation().trim();
            if (expl.toLowerCase().startsWith("output:")
                    || expl.toLowerCase().startsWith("output :")) {
                sb.append("""
                    <div class="out-block" style="page-break-inside:avoid;">
                      <div class="out-lbl">▶&nbsp; Output</div>
                      <div class="out-body">%s</div>
                    </div>
                    """.formatted(esc(expl.replaceFirst("(?i)output\\s*:\\s*", ""))));
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

    private String renderChunk(String rawLang, String pLang, String accent,
                               String title, String escapedCode,
                               int chunkNum, int chunkTotal,
                               int fromLine, int toLine, int totalLines,
                               boolean showContinued) {
        boolean isFirst = chunkNum == 1;
        boolean isLast  = chunkNum == chunkTotal;
        boolean isMulti = chunkTotal > 1;

        String br = !isMulti ? "8px" : isFirst ? "8px 8px 0 0" : isLast ? "0 0 8px 8px" : "0";

        String continued = showContinued ? """
            <div class="sn-continued">
              <span class="sn-cont-icon">↳</span>
              <span class="sn-cont-label">%s&nbsp;<span class="sn-cont-sub">continued (lines %d – %d of %d)</span></span>
            </div>""".formatted(esc(title), fromLine, toLine, totalLines) : "";

        String topBar = isFirst ? """
            <div class="sn-topbar">
              <span class="sn-mac-dots"><span class="sn-dot-r"></span><span class="sn-dot-y"></span><span class="sn-dot-g"></span></span>
              <span class="sn-lang-pill" style="color:%s;border-color:%s55;background:%s18;">%s</span>
              <span class="sn-topbar-title">%s</span>
              %s
            </div>""".formatted(accent, accent, accent, rawLang, esc(title),
                isMulti ? "<span class=\"sn-line-count\">%d lines total</span>".formatted(totalLines) : "")
                : "";

        String lineRange = !isFirst
                ? "<div class=\"sn-linerange\">Lines %d – %d</div>".formatted(fromLine, toLine) : "";
        String connector = !isLast ? "<div class=\"sn-connector\"></div>" : "";

        return """
            <div class="snippet" style="margin-top:%s;border-radius:%s;border-left:3px solid %s;background:#0d1117;page-break-inside:avoid;%s">
              %s%s
              <div class="sn-body">%s<pre class="line-numbers" data-start="%d"><code class="language-%s">%s</code></pre></div>
            </div>%s
            """.formatted(
                isFirst ? "12px" : "0", br, accent,
                (!isLast && isMulti) ? "border-bottom:none;" : "",
                continued, topBar, lineRange,
                fromLine, pLang, escapedCode, connector);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CSS
    // ═══════════════════════════════════════════════════════════════════

    private String css() {
        return """
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            :root {
              --font-kh: 'PdfKhmer', 'Noto Sans Khmer', 'Khmer OS Battambang', 'Khmer OS Siemreap', sans-serif;
              --font-en: 'PdfSans', 'Inter', 'Segoe UI', Arial, sans-serif;
              --font-code: 'PdfMono', 'JetBrains Mono', 'Cascadia Code', Consolas, 'Courier New', monospace;
            }
            body { font-family: var(--font-kh), var(--font-en); font-size: 11pt; color: #1e293b; background: #f8f9fa; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            .page { width: 210mm; min-height: 297mm; page-break-after: always; overflow: hidden; display: flex; flex-direction: column; }
            .page:last-child { page-break-after: avoid; }
            .lesson { page-break-inside: auto; }
            .ls-header { page-break-after: avoid; page-break-inside: avoid; }
            .ls-body p { orphans: 3; widows: 3; }
            .ls-body ul, .ch-banner, .toc-chapter, .toc-lesson, .note-block, .out-block { page-break-inside: avoid; }
            .ch-banner { page-break-after: avoid; }

            /* Cover */
            .cover { background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); color: #0f172a; padding: 48px 56px; position: relative; }
            .cv-glow-tr { position: absolute; top: -100px; right: -60px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, rgba(47,141,70,.12) 0%, transparent 70%); pointer-events: none; }
            .cv-glow-bl { position: absolute; bottom: 20px; left: 40px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(37,99,235,.08) 0%, transparent 70%); pointer-events: none; }
            .cv-topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-bottom: 52px; position:relative; z-index:1; }
            .cv-brand { display:flex; align-items:center; gap:14px; }
            .cv-logo-wrap { width:56px; height:56px; border-radius:16px; background:#ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 24px rgba(15,23,42,.08); border:1px solid rgba(148,163,184,.18); }
            .cv-logo-img { width:42px; height:42px; object-fit:contain; }
            .cv-logo-fallback { width:26px; height:26px; border-radius:999px; background:linear-gradient(135deg, #16a34a, #2563eb); }
            .cv-brand-copy { display:flex; flex-direction:column; justify-content:center; gap:2px; }
            .cv-brand-name { font-family: var(--font-en); font-size: 18pt; font-weight: 800; letter-spacing: -.02em; background: linear-gradient(90deg, #16a34a, #10b981 45%, #2563eb); -webkit-background-clip: text; background-clip:text; color: transparent; }
            .cv-brand-tagline { font-family: var(--font-kh); font-size: 9pt; color: #64748b; }
            .cv-hero { margin-bottom: 36px; position:relative; z-index:1; }
            .cv-tag { display: inline-flex; align-items:center; font-family: var(--font-en); font-size: 7.5pt; font-weight: 800; color: #0f172a; letter-spacing: .12em; border: 1px solid rgba(15,23,42,.10); background:#ffffff; padding: 6px 14px; border-radius: 999px; box-shadow:0 8px 20px rgba(15,23,42,.05); }
            .cv-title { font-size: 28pt; font-weight: 800; line-height: 1.4; color: #0f172a; margin-bottom: 16px; max-width: 88%; }
            .cv-rule { width: 56px; height: 4px; background: linear-gradient(90deg, #2f8d46, #10b981); border-radius: 2px; margin-bottom: 18px; }
            .cv-desc { font-size: 10.5pt; color: #475569; line-height: 2.05; max-width: 88%; }
            .cv-req-card { margin-top: 18px; max-width: 88%; border: 1px solid rgba(148,163,184,.18); background: rgba(255,255,255,.88); border-radius: 16px; padding: 14px 16px; box-shadow:0 10px 28px rgba(15,23,42,.05); }
            .cv-req-label { font-family: var(--font-en); font-size: 7pt; font-weight: 800; color: #2f8d46; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 8px; }
            .cv-req-text { font-size: 9.5pt; color: #334155; line-height: 1.9; }
            .cv-req-empty { font-size: 9.5pt; color: #64748b; line-height: 1.7; }
            .cv-stats { display: flex; align-items: stretch; background: rgba(255,255,255,.92); border: 1px solid rgba(148,163,184,.18); border-radius: 16px; overflow: hidden; margin-bottom: 24px; box-shadow:0 16px 40px rgba(15,23,42,.06); }
            .cv-stat { flex: 1; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
            .cv-stat-div { width: 1px; background: rgba(148,163,184,.18); flex-shrink: 0; }
            .cv-stat-icon { font-size: 15pt; line-height: 1; }
            .cv-stat-info { display: flex; flex-direction: column; gap: 2px; }
            .cv-stat-lbl { font-family: 'Inter', sans-serif; font-size: 7pt; font-weight: 700; color: #6b7280; letter-spacing: .08em; text-transform: uppercase; }
            .cv-stat-val { font-family: 'Inter', sans-serif; font-size: 10.5pt; font-weight: 700; color: #0f172a; }
            .cv-meta { background: #ffffff; border: 1px solid rgba(148,163,184,.18); border-left: 4px solid #2f8d46; border-radius: 16px; padding: 16px 20px; display: flex; flex-direction: column; margin-bottom: auto; box-shadow:0 16px 40px rgba(15,23,42,.05); }
            .cv-meta-row { display: flex; align-items: center; gap: 8px; font-size: 9.5pt; color: #334155; line-height: 2.4; font-family: 'Inter', sans-serif; }
            .cv-meta-icon { font-size: 10pt; }
            .cv-meta-key { font-weight: 600; color: #2f8d46; min-width: 90px; }
            .cv-meta-sep { color: #2f8d46; font-weight: 700; }
            .cv-meta-val { color: #0f172a; }
            .cv-footer { margin-top: 28px; display: flex; justify-content: space-between; align-items: center; gap:14px; font-family: 'Inter', sans-serif; font-size: 8pt; color: #475569; border-top: 1px solid rgba(148,163,184,.24); padding-top: 16px; }
            .cv-footer-brand { font-weight: 800; color: #0f172a; }
            .cv-footer-copy { color: #64748b; flex:1; text-align:center; }
            .cv-footer-site { color: #2f8d46; font-weight: 700; }

            /* Inner page */
            .inner-page { padding: 40px 52px; flex: 1; background: #ffffff; }
            .pg-header { font-family: 'Inter', sans-serif; font-size: 8pt; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2f8d46; padding-bottom: 8px; margin-bottom: 24px; }
            .pg-site { font-weight: 800; color: #2f8d46; letter-spacing: .05em; }
            .pg-title { color: #64748b; font-size: 7.5pt; max-width: 65%; text-align: right; }
            .pg-footer { font-family: 'Inter', sans-serif; font-size: 8pt; color: #64748b; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 24px; gap: 12px; }
            .pg-num { font-weight: 800; color: #2f8d46; font-size: 9pt; }
            .pf-brand { font-weight: 700; color: #0f172a; }
            .pf-site { color: #2f8d46; font-weight: 600; text-align: right; }

            /* Final footer / info page */
            .footer-page { background: #ffffff; color: #0f172a; align-items: center; justify-content: center; padding: 44px 56px; text-align: center; }
            .fp-section { width: 100%; max-width: 620px; margin-bottom: 34px; }
            .fp-heading { font-size: 22pt; font-weight: 800; line-height: 1.4; margin-bottom: 14px; color: #0f172a; }
            .fp-copy { font-size: 11pt; line-height: 2; color: #334155; }
            .fp-copyright { margin-top: 18px; font-family: var(--font-en); font-size: 10pt; color: #0f172a; }
            .fp-links { display: flex; flex-direction: column; gap: 8px; font-size: 11pt; line-height: 1.9; color: #0f172a; }
            .fp-subcopy { font-size: 10.5pt; color: #475569; margin-bottom: 14px; }
            .fp-contact { font-family: var(--font-en); font-size: 10.5pt; color: #0f172a; margin-bottom: 10px; }
            .fp-socials { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 8px 0 24px; }
            .fp-social { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 999px; font-family: var(--font-en); font-size: 18px; font-weight: 800; }
            .fp-facebook { color: #2563eb; background: rgba(37,99,235,.08); }
            .fp-telegram { color: #0284c7; background: rgba(2,132,199,.08); }
            .fp-youtube { color: #dc2626; background: rgba(220,38,38,.08); }
            .fp-bottom { font-family: var(--font-en); font-size: 10pt; color: #0f172a; }

            /* TOC */
            .toc-eyebrow { display: inline-block; font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 800; color: #fff; background: #2f8d46; padding: 3px 12px; letter-spacing: .10em; border-radius: 3px; margin-bottom: 8px; }
            .toc-heading { font-size: 22pt; font-weight: 700; color: #0f172a; line-height: 1.5; }
            .toc-heading-sub { font-family: 'Inter', sans-serif; font-size: 13pt; font-weight: 400; color: #64748b; }
            .toc-rule { width: 52%; height: 3px; border-radius: 2px; background: linear-gradient(90deg, #2f8d46, #10b981); margin: 14px 0 22px; }
            .toc-chapter { display: flex; align-items: stretch; margin-top: 14px; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(47,141,70,.12); }
            .toc-ch-num { background: #2f8d46; color: #fff; font-family: 'Inter', sans-serif; font-size: 11pt; font-weight: 800; padding: 10px 14px; display: flex; align-items: center; justify-content: center; min-width: 42px; }
            .toc-ch-body { background: #f0fdf4; border-left: 3px solid #2f8d46; padding: 10px 16px; flex: 1; display: flex; align-items: center; gap: 12px; }
            .toc-ch-title { font-size: 11pt; font-weight: 700; color: #14532d; flex: 1; line-height: 1.7; }
            .toc-ch-count { font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 600; color: #2f8d46; background: rgba(47,141,70,.12); padding: 2px 8px; border-radius: 10px; }
            .toc-lesson { display: flex; align-items: center; font-size: 10pt; color: #334155; padding: 1px 0; }
            .toc-ls-num { font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 700; color: #2f8d46; padding: 5px 10px 5px 56px; min-width: 90px; }
            .toc-ls-title { padding: 5px 0; line-height: 1.85; flex: 1; }
            .toc-ls-dots { width: 40px; border-bottom: 1px dashed #cbd5e1; align-self: center; flex-shrink: 0; margin-right: 8px; }

            /* Chapter banner */
            .ch-banner { display: flex; align-items: stretch; border-radius: 8px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(47,141,70,.18); }
            .ch-badge { background: #1a5c2e; padding: 18px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 78px; gap: 2px; }
            .ch-badge-label { font-family: 'Inter', sans-serif; font-size: 7pt; font-weight: 700; color: #86efac; }
            .ch-badge-num { font-family: 'Inter', sans-serif; font-size: 28pt; font-weight: 900; color: #fff; line-height: 1; }
            .ch-banner-body { background: linear-gradient(135deg, #2f8d46 0%, #059669 100%); padding: 18px 24px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .ch-banner-eyebrow { font-family: 'Inter', sans-serif; font-size: 7.5pt; font-weight: 700; color: #a7f3d0; letter-spacing: .10em; margin-bottom: 5px; }
            .ch-banner-title { font-size: 16pt; font-weight: 700; color: #fff; line-height: 1.6; }
            .ch-banner-deco { width: 5px; background: rgba(255,255,255,.15); }
            .ch-desc { color: #475569; font-size: 10pt; line-height: 2.15; margin-bottom: 16px; padding: 10px 14px; background: #f0fdf4; border-left: 3px solid rgba(47,141,70,.30); border-radius: 0 4px 4px 0; }

            /* Lesson */
            .lesson { margin-bottom: 10px; }
            .ls-header { display: flex; align-items: stretch; margin: 18px 0 10px; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(47,141,70,.10); }
            .ls-num { background: #2f8d46; color: #fff; font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 800; padding: 8px 10px; display: flex; align-items: center; justify-content: center; min-width: 44px; }
            .ls-title { background: #f0fdf4; border-left: 3px solid #2f8d46; padding: 8px 16px; font-size: 12pt; font-weight: 700; color: #14532d; flex: 1; line-height: 1.7; }
            .ls-body { font-size: 10.5pt; line-height: 2.1; color: #334155; margin-bottom: 10px; font-family: var(--font-kh), var(--font-en); }
            .ls-body p { margin-bottom: 10px; }
            .ls-body ul { padding-left: 22px; margin-bottom: 10px; }
            .ls-body li { margin-bottom: 4px; line-height: 2; list-style: none; padding-left: 4px; position: relative; }
            .ls-body li::before { content: "▸"; color: #2f8d46; font-size: 9pt; position: absolute; left: -16px; }
            .h-rule { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0 6px; }

            /* Code — Tokyo Night */
            .snippet { overflow: hidden; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 18px rgba(0,0,0,.45); }
            .sn-continued { display: flex; align-items: center; gap: 8px; background: #1a1f35; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 5px 14px; font-family: 'Inter', sans-serif; font-size: 7.5pt; }
            .sn-cont-icon { color: #7dcfff; font-weight: 800; font-size: 9pt; }
            .sn-cont-label { color: #9aa5ce; font-weight: 600; }
            .sn-cont-sub { color: #565f89; font-style: italic; }
            .sn-linerange { font-family: var(--font-code); font-size: 7pt; color: #3d4255; background: #0d1117; padding: 2px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
            .sn-line-count { margin-left: auto; font-family: var(--font-code); font-size: 7pt; color: #565f89; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.10); padding: 1px 8px; border-radius: 10px; }
            .sn-connector { height: 3px; background: repeating-linear-gradient(90deg, rgba(122,162,247,0.25) 0px, rgba(122,162,247,0.25) 5px, transparent 5px, transparent 11px); }
            .sn-topbar { display: flex; align-items: center; gap: 10px; background: #161b22; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 8px 16px; min-height: 38px; }
            .sn-mac-dots { display: flex; gap: 5px; align-items: center; flex-shrink: 0; margin-right: 4px; }
            .sn-dot-r { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
            .sn-dot-y { width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; }
            .sn-dot-g { width: 10px; height: 10px; border-radius: 50%; background: #28c840; }
            .sn-lang-pill { font-family: 'Inter', sans-serif; font-size: 6.5pt; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; border: 1px solid; white-space: nowrap; }
            .sn-topbar-title { font-family: var(--font-code); font-size: 7.5pt; color: #565f89; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .sn-body { background: #0d1117; }
            .sn-body pre[class*="language-"] { margin:0!important; border-radius:0!important; font-family:var(--font-code)!important; font-size:8.5pt!important; line-height:1.9!important; padding:14px 20px!important; background:#0d1117!important; border:none!important; color:#c0caf5!important; white-space:pre-wrap!important; word-break:break-all!important; overflow-x:hidden!important; }
            .sn-body pre[class*="language-"], .sn-body pre[class*="language-"] code, .sn-body code[class*="language-"] { color:#c0caf5!important; background:#0d1117!important; text-shadow:none!important; }
            .sn-body pre.line-numbers { padding-left:3.5em!important; position:relative; }
            .sn-body .line-numbers .line-numbers-rows { border-right:1px solid rgba(255,255,255,0.06)!important; top:0!important; }
            .sn-body .line-numbers-rows > span:before { color:#3d4255!important; font-size:8pt!important; }
            .sn-body .token.punctuation{color:#9aa5ce!important}
            .sn-body .token.keyword,.sn-body .token.important,.sn-body .token.atrule{color:#bb9af7!important;font-weight:600!important}
            .sn-body .token.rule{color:#73daca!important}
            .sn-body .token.class-name,.sn-body .token.builtin,.sn-body .token.maybe-class-name,.sn-body .token.type{color:#7dcfff!important;font-weight:600!important}
            .sn-body .token.function,.sn-body .token.function-variable,.sn-body .token.method{color:#9ece6a!important}
            .sn-body .token.string,.sn-body .token.char,.sn-body .token.template-string{color:#e0af68!important}
            .sn-body .token.template-punctuation{color:#9aa5ce!important}
            .sn-body .token.number{color:#2ac3de!important}
            .sn-body .token.boolean,.sn-body .token.constant,.sn-body .token.null,.sn-body .token.undefined,.sn-body .token.symbol{color:#f7768e!important}
            .sn-body .token.comment,.sn-body .token.prolog,.sn-body .token.doctype,.sn-body .token.cdata{color:#565f89!important;font-style:italic!important}
            .sn-body .token.operator,.sn-body .token.arrow{color:#89b4fa!important}
            .sn-body .token.property,.sn-body .token.property-access{color:#73daca!important}
            .sn-body .token.annotation,.sn-body .token.decorator{color:#e0af68!important}
            .sn-body .token.variable,.sn-body .token.parameter{color:#c0caf5!important}
            .sn-body .token.tag{color:#f7768e!important}
            .sn-body .token.tag .token.punctuation{color:#9aa5ce!important}
            .sn-body .token.attr-name{color:#7aa2f7!important}
            .sn-body .token.attr-value{color:#9ece6a!important}
            .sn-body .token.attr-value .token.punctuation{color:#9aa5ce!important}
            .sn-body .token.regex,.sn-body .token.url{color:#ff9e64!important}
            .sn-body .token.selector{color:#bb9af7!important}
            .sn-body .token.inserted{color:#9ece6a!important}
            .sn-body .token.deleted{color:#f7768e!important}
            .sn-body .token.namespace{opacity:0.75}
            .sn-body .token,.sn-body code,.sn-body pre{font-family:var(--font-code)!important}

            /* Note / Output */
            .note-block { display:flex; align-items:flex-start; gap:8px; background:#f0fdf4; border-left:4px solid #2f8d46; padding:10px 14px; margin:6px 0 18px; font-size:9.5pt; line-height:1.9; border-radius:0 6px 6px 0; font-family:var(--font-kh),var(--font-en); }
            .note-icon { font-size:11pt; flex-shrink:0; margin-top:1px; }
            .note-text { color:#15803d; }
            .out-block { margin:4px 0 18px; border-radius:0 0 8px 8px; overflow:hidden; }
            .out-lbl { background:#2f8d46; padding:5px 14px; font-family:var(--font-code); font-size:8pt; color:#fff; font-weight:700; letter-spacing:.05em; }
            .out-body { background:#f0f7f0; border:1px solid #c8e0c8; border-top:none; padding:12px 18px; font-family:var(--font-code); font-size:8.5pt; color:#1a3a1a; line-height:1.8; white-space:pre-wrap; word-break:break-word; }
            """;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String stripHtml(String s) {
        return s.replaceAll("<[^>]+>", " ").replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&").replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">").replaceAll("&quot;", "\"")
                .replaceAll("[ \\t]{2,}", " ").trim();
    }
}
