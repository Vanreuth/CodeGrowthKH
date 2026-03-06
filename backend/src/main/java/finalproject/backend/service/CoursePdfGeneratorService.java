package finalproject.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import finalproject.backend.modal.Chapter;
import finalproject.backend.modal.CodeSnippet;
import finalproject.backend.modal.Course;
import finalproject.backend.modal.Lesson;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * CoursePdfGeneratorService — improved edition.
 *
 * Design language inspired by the Code-Khmer book series
 * (see /assets/pdfs/c_programming.pdf):
 *   • Deep-indigo dark cover with glow accents
 *   • Clean white content pages with left-indigo rule
 *   • Section numbers (1 · 1.1 · 1.2) in blue badges
 *   • Dark VS-Code–style code blocks
 *   • Distinct "Output" strip + green "Note" callout
 *   • Header/footer on every body page
 *
 * Khmer text improvements:
 *   • Five classpath font probe paths
 *   • CDN fallback (Hanuman v24)
 *   • Leading multiplier set to 1.9× for Khmer stacking marks
 *   • Every Khmer Paragraph uses setLeading(0, KHMER_LEADING)
 */
@Slf4j
@Service
public class CoursePdfGeneratorService {

    // ═══════════════════════════════════════════════════════════════════
    //  KHMER LEADING — stacking vowels / diacritics need extra space
    // ═══════════════════════════════════════════════════════════════════
    private static final float KHMER_LEADING = 1.95f;   // line-height multiplier
    private static final float CODE_LEADING  = 14.5f;   // fixed leading for code

    // ═══════════════════════════════════════════════════════════════════
    //  COLOUR PALETTE
    // ═══════════════════════════════════════════════════════════════════

    // — Cover (dark) ——————————————————————————————————————————————————
    private static final Color COV_BG       = new Color(  7,  11,  26);
    private static final Color COV_ACCENT   = new Color( 79, 109, 255);
    private static final Color COV_ACCENT2  = new Color(139,  92, 246);
    private static final Color COV_CARD     = new Color( 18,  25,  50);
    private static final Color COV_SUB      = new Color(189, 200, 255);
    private static final Color COV_MUTED    = new Color(148, 163, 184);

    // — Body (light) ——————————————————————————————————————————————————
    private static final Color WHITE         = Color.WHITE;
    private static final Color PAGE_BG       = new Color(255, 255, 255);
    private static final Color PRIMARY       = new Color( 67,  97, 238);
    private static final Color PRIMARY_LIGHT = new Color(237, 242, 255);
    private static final Color PRIMARY_DARK  = new Color( 49,  46, 129);
    private static final Color ACCENT_GREEN  = new Color( 16, 185, 129);
    private static final Color ACCENT_G_LT   = new Color(209, 250, 229);
    private static final Color ACCENT_ORANGE = new Color(217, 119,   6);
    private static final Color HEADING       = new Color( 15,  23,  42);
    private static final Color BODY_TEXT     = new Color( 51,  65,  85);
    private static final Color MUTED_TEXT    = new Color(100, 116, 139);
    private static final Color BORDER        = new Color(226, 232, 240);
    private static final Color ROW_EVEN      = new Color(248, 250, 252);

    // — Chapter banner ————————————————————————————————————————————————
    private static final Color CH_LEFT_BG   = new Color( 49,  46, 129);
    private static final Color CH_RIGHT_BG  = new Color( 67,  97, 238);

    // — Code block (VS Code–dark) —————————————————————————————————————
    private static final Color CODE_HDR_BG  = new Color( 30,  37,  59);
    private static final Color CODE_BODY_BG = new Color( 13,  17,  40);
    private static final Color CODE_FG      = new Color(212, 220, 255);
    private static final Color CODE_LANG_FG = new Color(129, 161, 255);

    // — Output strip ——————————————————————————————————————————————————
    private static final Color OUT_BG       = new Color( 22,  27,  51);
    private static final Color OUT_FG       = new Color(163, 230, 180);  // green-ish
    private static final Color OUT_LBL_FG   = new Color( 94, 234, 212);  // teal
    private static final Color OUT_BORDER   = new Color( 20, 184, 166);  // teal-500

    // ═══════════════════════════════════════════════════════════════════
    //  KHMER FONT — classpath probes → CDN fallback
    // ═══════════════════════════════════════════════════════════════════
    private static final String[] CLASSPATH_FONTS = {
        "fonts/Battambang,Hanuman/Hanuman/Hanuman-VariableFont_wght.ttf",
        "fonts/Hanuman-Regular.ttf",
        "fonts/NotoSerifKhmer-Regular.ttf",
        "fonts/Battambang-Regular.ttf",
        "fonts/KhmerOS.ttf",
    };
    private static final String FONT_CDN_URL =
        "https://fonts.gstatic.com/s/hanuman/v24/VuJxdNvf35P4qJ1OeKbXOIFneRo.ttf";

    private volatile BaseFont khmerFont    = null;
    private volatile boolean  fontInitDone = false;

    BaseFont getKhmerFont() {
        if (fontInitDone) return khmerFont;
        synchronized (this) {
            if (fontInitDone) return khmerFont;
            fontInitDone = true;
            khmerFont = loadFromClasspath();
            if (khmerFont == null) khmerFont = loadFromCdn();
            if (khmerFont == null) {
                log.error("══════════════════════════════════════════════════════════════");
                log.error("  KHMER FONT NOT FOUND — Khmer text will NOT render in PDFs.");
                log.error("  FIX: Place Hanuman-Regular.ttf in:                        ");
                log.error("       src/main/resources/fonts/Hanuman-Regular.ttf         ");
                log.error("  Download: https://fonts.google.com/specimen/Hanuman       ");
                log.error("══════════════════════════════════════════════════════════════");
            }
            return khmerFont;
        }
    }

    private BaseFont loadFromClasspath() {
        for (String path : CLASSPATH_FONTS) {
            try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
                if (is == null) continue;
                byte[] bytes = is.readAllBytes();
                BaseFont bf = BaseFont.createFont("Hanuman-font.ttf", BaseFont.IDENTITY_H,
                        BaseFont.EMBEDDED, true, bytes, null);
                log.info("✅ Khmer font loaded from classpath: {}", path);
                return bf;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private BaseFont loadFromCdn() {
        log.info("🌐 Downloading Khmer font from CDN…");
        try {
            byte[] bytes = URI.create(FONT_CDN_URL).toURL().openStream().readAllBytes();
            BaseFont bf = BaseFont.createFont("Hanuman-Regular.ttf", BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED, true, bytes, null);
            log.info("✅ Khmer font downloaded from CDN ({} bytes)", bytes.length);
            return bf;
        } catch (Exception e) {
            log.warn("⚠️  CDN font download failed: {}", e.getMessage());
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  FONT FACTORIES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Unicode-aware font (Khmer + Latin).
     * Falls back to Helvetica (Latin-only) when Khmer font unavailable.
     */
    private Font fu(float size, int style, Color color) {
        BaseFont bf = getKhmerFont();
        return bf != null ? new Font(bf, size, style, color)
                          : new Font(Font.HELVETICA, size, style, color);
    }
    private Font fMono(float size, Color c) { return new Font(Font.COURIER, size, Font.NORMAL, c); }

    // Cover
    private Font fBrand()      { return fu( 8,   Font.BOLD,   COV_ACCENT);  }
    private Font fCovTitle()   { return fu(30,   Font.BOLD,   WHITE);       }
    private Font fCovDesc()    { return fu(10.5f,Font.NORMAL, COV_SUB);     }
    private Font fCovMeta()    { return fu( 9,   Font.NORMAL, COV_MUTED);   }
    private Font fCovMetaB()   { return fu( 9,   Font.BOLD,   COV_MUTED);   }
    private Font fCovLink()    { return fu( 9,   Font.NORMAL, COV_ACCENT);  }
    private Font fStatLbl()    { return fu( 7,   Font.BOLD,   COV_MUTED);   }
    private Font fStatVal()    { return fu(12,   Font.BOLD,   WHITE);       }

    // TOC
    private Font fTocLbl()     { return fu( 8,   Font.BOLD,   PRIMARY);     }
    private Font fTocCh()      { return fu(11,   Font.BOLD,   PRIMARY_DARK);}
    private Font fTocLess()    { return fu(10,   Font.NORMAL, BODY_TEXT);   }
    private Font fTocNum()     { return fu( 9,   Font.BOLD,   MUTED_TEXT);  }

    // Chapter / Lesson / Section
    private Font fChSup()      { return fu( 8,   Font.BOLD,   new Color(196, 181, 253)); }
    private Font fChNum()      { return fu(28,   Font.BOLD,   WHITE);       }
    private Font fChTitle()    { return fu(18,   Font.BOLD,   WHITE);       }
    private Font fSecNum()     { return fu( 9,   Font.BOLD,   WHITE);       }
    private Font fSecTitle()   { return fu(12,   Font.BOLD,   HEADING);     }
    private Font fBody()       { return fu(10.5f,Font.NORMAL, BODY_TEXT);   }
    private Font fBodyBullet() { return fu(10,   Font.NORMAL, BODY_TEXT);   }

    // Code
    private Font fCodeHdr()    { return fu( 9,   Font.BOLD,   WHITE);       }
    private Font fCodeLang()   { return fMono(8, CODE_LANG_FG);             }
    private Font fCode()       { return fMono(8.5f, CODE_FG);               }
    private Font fOutLbl()     { return fMono(7.5f, OUT_LBL_FG);            }
    private Font fOutCode()    { return fMono(8.5f, OUT_FG);                }
    private Font fNoteLbl()    { return fu( 9,   Font.BOLD,   ACCENT_GREEN);}
    private Font fNoteBody()   { return fu( 9,   Font.ITALIC, BODY_TEXT);   }

    // Header / Footer
    private Font fHFBold()     { return fu( 8,   Font.BOLD,   PRIMARY);     }
    private Font fHFNorm()     { return fu( 8,   Font.NORMAL, MUTED_TEXT);  }

    // ═══════════════════════════════════════════════════════════════════
    //  PUBLIC — generate()
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generate(Course course) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 56, 56, 76, 66);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new HFEvent(course, this));
            doc.open();

            buildCover(doc, writer, course);
            doc.newPage();

            buildToc(doc, course);
            doc.newPage();

            int ci = 0;
            for (Chapter ch : course.getChapters()) {
                buildChapter(doc, ch, ++ci);
                doc.newPage();
            }

            doc.close();
            log.info("✅ PDF generated — course='{}' pages={}", course.getSlug(), writer.getPageNumber());
            return out.toByteArray();
        } catch (Exception e) {
            log.error("❌ PDF generation failed for courseId={}: {}", course.getId(), e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  1 — COVER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private void buildCover(Document doc, PdfWriter writer, Course course) throws Exception {
        float W = PageSize.A4.getWidth();
        float H = PageSize.A4.getHeight();
        PdfContentByte cb = writer.getDirectContentUnder();

        // Background
        cb.setColorFill(COV_BG);
        cb.rectangle(0, 0, W, H);
        cb.fill();

        // Diagonal triangle (top-right)
        cb.setColorFill(new Color(17, 24, 55));
        cb.moveTo(W * 0.45f, H);
        cb.lineTo(W, H);
        cb.lineTo(W, H * 0.55f);
        cb.closePath();
        cb.fill();

        // Top dual-colour accent bar
        cb.setColorFill(COV_ACCENT);
        cb.rectangle(0, H - 12, W * 0.58f, 12);
        cb.fill();
        cb.setColorFill(COV_ACCENT2);
        cb.rectangle(W * 0.58f, H - 12, W * 0.42f, 12);
        cb.fill();

        // Bottom accent bar
        cb.setColorFill(COV_ACCENT);
        cb.rectangle(0, 0, W * 0.45f, 8);
        cb.fill();
        cb.setColorFill(COV_ACCENT2);
        cb.rectangle(W * 0.45f, 0, W * 0.55f, 8);
        cb.fill();

        // Glow circles
        cb.setColorFill(new Color(79, 109, 255, 18));
        cb.circle(W - 60, H - 110, 210);
        cb.fill();
        cb.setColorFill(new Color(139, 92, 246, 10));
        cb.circle(W - 60, H - 110, 300);
        cb.fill();
        cb.setColorFill(new Color(67, 97, 238, 12));
        cb.circle(50, 90, 120);
        cb.fill();

        // Left gradient bar
        drawGradientBar(cb, 0, 0, 5, H);

        // ── Text content ──────────────────────────────────────────────
        addLines(doc, 4);

        Paragraph brand = new Paragraph("CODE KHMER LEARNING  ·  codekhmerlearning.site", fBrand());
        brand.setSpacingAfter(18);
        doc.add(brand);

        Paragraph title = new Paragraph(course.getTitle(), fCovTitle());
        title.setLeading(0, KHMER_LEADING);
        title.setSpacingAfter(10);
        doc.add(title);

        hRule(doc, COV_ACCENT, 40, 3f, 0, 16);

        if (course.getDescription() != null && !course.getDescription().isBlank()) {
            Paragraph desc = new Paragraph(course.getDescription(), fCovDesc());
            desc.setLeading(0, KHMER_LEADING);
            desc.setSpacingAfter(28);
            doc.add(desc);
        } else {
            addLines(doc, 2);
        }

        // ── 4 stat cards ─────────────────────────────────────────────
        PdfPTable stats = new PdfPTable(4);
        stats.setWidthPercentage(88);
        stats.setHorizontalAlignment(Element.ALIGN_LEFT);
        stats.setSpacingAfter(24);
        stats.setWidths(new float[]{1f, 1f, 1f, 1f});

        String level = course.getLevel() != null ? course.getLevel().toString() : "—";
        String lang  = course.getLanguage() != null ? course.getLanguage() : "—";
        boolean free = Boolean.TRUE.equals(course.getIsFree());

        stats.addCell(statCell("LEVEL",    level,                               new Color(99, 70, 246)));
        stats.addCell(statCell("LANGUAGE", lang,                                new Color( 6,148,162)));
        stats.addCell(statCell("LESSONS",  course.getTotalLessons() + " Lessons", COV_ACCENT));
        stats.addCell(statCell("ACCESS",   free ? "FREE" : "PREMIUM",          free ? ACCENT_GREEN : ACCENT_ORANGE));
        doc.add(stats);

        // ── Meta card ─────────────────────────────────────────────────
        PdfPTable meta = new PdfPTable(1);
        meta.setWidthPercentage(88);
        meta.setHorizontalAlignment(Element.ALIGN_LEFT);

        PdfPCell mc = new PdfPCell();
        mc.setBackgroundColor(COV_CARD);
        mc.setBorderWidthLeft(3.5f);
        mc.setBorderColorLeft(COV_ACCENT);
        mc.setBorder(Rectangle.LEFT);
        mc.setPaddingTop(14);
        mc.setPaddingBottom(14);
        mc.setPaddingLeft(16);
        mc.setPaddingRight(10);

        String instructor = course.getInstructor() != null
                ? course.getInstructor().getUsername() : "Code Khmer";
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));

        Phrase mp = new Phrase();
        mp.setLeading(22);    // larger leading for Khmer stacking glyphs
        mp.add(new Chunk("Instructor  :  ", fCovMetaB()));
        mp.add(new Chunk(instructor + "\n", fCovDesc()));
        mp.add(new Chunk("Date        :  ", fCovMetaB()));
        mp.add(new Chunk(date + "\n",       fCovMeta()));
        mp.add(new Chunk("Website     :  ", fCovMetaB()));
        mp.add(new Chunk("codekhmerlearning.site", fCovLink()));
        mc.addElement(mp);
        meta.addCell(mc);
        doc.add(meta);
    }

    /** Simulates a vertical gradient bar using stacked thin rectangles. */
    private void drawGradientBar(PdfContentByte cb, float x, float y, float w, float h) {
        int steps = 40;
        float step = h / steps;
        for (int i = 0; i < steps; i++) {
            float t = (float) i / steps;
            int r = lerp(COV_ACCENT.getRed(),   COV_ACCENT2.getRed(),   t);
            int g = lerp(COV_ACCENT.getGreen(), COV_ACCENT2.getGreen(), t);
            int b = lerp(COV_ACCENT.getBlue(),  COV_ACCENT2.getBlue(),  t);
            cb.setColorFill(new Color(r, g, b));
            cb.rectangle(x, y + (steps - 1 - i) * step, w, step + 1);
            cb.fill();
        }
    }
    private int lerp(int a, int b, float t) { return (int)(a + t * (b - a)); }

    // ═══════════════════════════════════════════════════════════════════
    //  2 — TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════════════

    private void buildToc(Document doc, Course course) throws Exception {
        Paragraph lbl = new Paragraph("TABLE OF CONTENTS", fTocLbl());
        lbl.setSpacingAfter(5);
        doc.add(lbl);

        Phrase tocH = new Phrase();
        tocH.add(new Chunk("តារាងមាតិកា", fu(22, Font.BOLD, HEADING)));
        tocH.add(new Chunk("  /  Table of Contents", fu(13, Font.NORMAL, MUTED_TEXT)));
        Paragraph heading = new Paragraph(tocH);
        heading.setLeading(0, KHMER_LEADING);
        heading.setSpacingAfter(4);
        doc.add(heading);

        hRule(doc, PRIMARY, 50, 3f, 0, 16);

        int ci = 0;
        for (Chapter ch : course.getChapters()) {
            ci++;

            // Chapter row
            PdfPTable chRow = new PdfPTable(new float[]{0.28f, 3.8f, 0.72f});
            chRow.setWidthPercentage(100);
            chRow.setSpacingBefore(12);
            chRow.setSpacingAfter(0);

            chRow.addCell(numBadge(String.valueOf(ci), PRIMARY, 9));

            PdfPCell ct = styledCell(ch.getTitle(), fTocCh(), PRIMARY_LIGHT, PRIMARY, 12, 8);
            chRow.addCell(ct);

            PdfPCell cc = new PdfPCell(new Phrase(ch.getLessons().size() + " Lessons",
                    fu(8, Font.NORMAL, MUTED_TEXT)));
            cc.setBackgroundColor(PRIMARY_LIGHT);
            cc.setBorder(Rectangle.NO_BORDER);
            cc.setPaddingRight(10);
            cc.setPaddingTop(8);
            cc.setPaddingBottom(8);
            cc.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cc.setVerticalAlignment(Element.ALIGN_MIDDLE);
            chRow.addCell(cc);
            doc.add(chRow);

            // Lesson rows
            int li = 0;
            for (Lesson lesson : ch.getLessons()) {
                li++;
                Color bg = (li % 2 == 0) ? ROW_EVEN : PAGE_BG;

                PdfPTable lr = new PdfPTable(new float[]{0.28f, 0.45f, 4.27f});
                lr.setWidthPercentage(100);
                lr.setSpacingBefore(0);
                lr.setSpacingAfter(0);
                lr.addCell(blankCell(bg));

                PdfPCell ln = plainCell(ci + "." + li, fTocNum(), bg, 10, 5);
                lr.addCell(ln);

                PdfPCell lt = plainCell(lesson.getTitle(), fTocLess(), bg, 6, 5);
                lr.addCell(lt);
                doc.add(lr);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  3 — CHAPTER PAGE
    // ═══════════════════════════════════════════════════════════════════

    private void buildChapter(Document doc, Chapter chapter, int ci) throws Exception {
        // Banner: left block (number) | right block (title)
        PdfPTable banner = new PdfPTable(new float[]{0.22f, 1f});
        banner.setWidthPercentage(100);
        banner.setSpacingAfter(28);

        Phrase numP = new Phrase();
        numP.setLeading(20);
        numP.add(new Chunk("ជំពូក / Ch.\n", fChSup()));
        numP.add(new Chunk(String.valueOf(ci), fChNum()));
        PdfPCell numC = new PdfPCell(numP);
        numC.setBackgroundColor(CH_LEFT_BG);
        numC.setPadding(14);
        numC.setBorder(Rectangle.NO_BORDER);
        numC.setHorizontalAlignment(Element.ALIGN_CENTER);
        numC.setVerticalAlignment(Element.ALIGN_MIDDLE);
        numC.setLeading(0, KHMER_LEADING);
        banner.addCell(numC);

        Phrase titP = new Phrase();
        titP.setLeading(20);
        titP.add(new Chunk("CHAPTER " + ci + "\n", fChSup()));
        titP.add(new Chunk(chapter.getTitle(), fChTitle()));
        PdfPCell titC = new PdfPCell(titP);
        titC.setBackgroundColor(CH_RIGHT_BG);
        titC.setPaddingTop(16);
        titC.setPaddingBottom(16);
        titC.setPaddingLeft(20);
        titC.setPaddingRight(14);
        titC.setBorder(Rectangle.NO_BORDER);
        titC.setVerticalAlignment(Element.ALIGN_MIDDLE);
        titC.setLeading(0, KHMER_LEADING);
        banner.addCell(titC);
        doc.add(banner);

        if (chapter.getDescription() != null && !chapter.getDescription().isBlank()) {
            Paragraph cdesc = new Paragraph(chapter.getDescription(),
                    fu(10, Font.ITALIC, MUTED_TEXT));
            cdesc.setLeading(0, KHMER_LEADING);
            cdesc.setSpacingAfter(16);
            doc.add(cdesc);
        }

        int li = 0;
        for (Lesson lesson : chapter.getLessons()) {
            buildLesson(doc, lesson, ci, ++li);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  4 — LESSON SECTION
    // ═══════════════════════════════════════════════════════════════════

    private void buildLesson(Document doc, Lesson lesson, int ci, int li) throws Exception {
        // ── Section header: pill (ci.li) + title bar ─────────────────
        PdfPTable hdr = new PdfPTable(new float[]{0.20f, 1f});
        hdr.setWidthPercentage(100);
        hdr.setSpacingBefore(22);
        hdr.setSpacingAfter(10);

        PdfPCell pill = numBadge(ci + "." + li, PRIMARY, 8);
        pill.setPaddingTop(7);
        pill.setPaddingBottom(7);
        pill.setPaddingLeft(8);
        pill.setPaddingRight(8);
        hdr.addCell(pill);

        PdfPCell ltc = new PdfPCell(new Phrase(lesson.getTitle(),
                fu(12, Font.BOLD, HEADING)));
        ltc.setBackgroundColor(PRIMARY_LIGHT);
        ltc.setBorderWidthLeft(3.5f);
        ltc.setBorderColorLeft(PRIMARY);
        ltc.setBorder(Rectangle.LEFT);
        ltc.setPaddingLeft(14);
        ltc.setPaddingTop(8);
        ltc.setPaddingBottom(8);
        ltc.setVerticalAlignment(Element.ALIGN_MIDDLE);
        ltc.setLeading(0, KHMER_LEADING);
        hdr.addCell(ltc);
        doc.add(hdr);

        // ── Body paragraphs ──────────────────────────────────────────
        if (lesson.getContent() != null && !lesson.getContent().isBlank()) {
            for (String para : lesson.getContent().split("\n\n")) {
                if (para.isBlank()) continue;
                String clean = stripHtml(para);
                if (clean.isEmpty()) continue;

                // Detect bullet lines (start with •, ✅, ▸, -, *)
                if (clean.startsWith("•") || clean.startsWith("✅")
                        || clean.startsWith("▸") || clean.startsWith("- ")
                        || clean.startsWith("* ")) {
                    for (String line : clean.split("\n")) {
                        String l = line.trim();
                        if (l.isEmpty()) continue;
                        // Normalise bullet character
                        if (l.startsWith("- ") || l.startsWith("* ")) l = "• " + l.substring(2);
                        Paragraph bp = new Paragraph(l, fBodyBullet());
                        bp.setLeading(0, KHMER_LEADING);
                        bp.setIndentationLeft(14);
                        bp.setSpacingAfter(3);
                        doc.add(bp);
                    }
                } else {
                    Paragraph p = new Paragraph(clean, fBody());
                    p.setLeading(0, KHMER_LEADING);
                    p.setSpacingAfter(6);
                    doc.add(p);
                }
            }
        }

        // ── Code snippets ─────────────────────────────────────────────
        for (CodeSnippet cs : lesson.getCodeSnippets()) {
            buildSnippet(doc, cs);
        }

        // Lesson separator
        hRule(doc, BORDER, 100, 0.75f, 14, 4);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  5 — CODE SNIPPET
    // ═══════════════════════════════════════════════════════════════════

    private void buildSnippet(Document doc, CodeSnippet cs) throws Exception {
        addLines(doc, 1);

        String lang   = cs.getLanguage() != null ? cs.getLanguage().toUpperCase() : "CODE";
        String stitle = (cs.getTitle() != null && !cs.getTitle().isBlank())
                        ? cs.getTitle() : "ឧទាហរណ៍ / Example";

        // ── Header bar: title | language badge ───────────────────────
        PdfPTable hdr = new PdfPTable(new float[]{1f, 0.22f});
        hdr.setWidthPercentage(100);
        hdr.setSpacingBefore(2);
        hdr.setSpacingAfter(0);

        PdfPCell ht = new PdfPCell(new Phrase(stitle, fCodeHdr()));
        ht.setBackgroundColor(CODE_HDR_BG);
        ht.setPaddingTop(9);
        ht.setPaddingBottom(9);
        ht.setPaddingLeft(14);
        ht.setBorder(Rectangle.NO_BORDER);
        ht.setVerticalAlignment(Element.ALIGN_MIDDLE);
        hdr.addCell(ht);

        PdfPCell hl = new PdfPCell(new Phrase(lang, fCodeLang()));
        hl.setBackgroundColor(CODE_BODY_BG);
        hl.setPaddingTop(9);
        hl.setPaddingBottom(9);
        hl.setPaddingRight(12);
        hl.setBorder(Rectangle.NO_BORDER);
        hl.setHorizontalAlignment(Element.ALIGN_RIGHT);
        hl.setVerticalAlignment(Element.ALIGN_MIDDLE);
        hdr.addCell(hl);
        doc.add(hdr);

        // ── Code body ─────────────────────────────────────────────────
        PdfPCell bc = new PdfPCell();
        bc.setBackgroundColor(CODE_BODY_BG);
        bc.setBorder(Rectangle.NO_BORDER);
        bc.setPaddingTop(12);
        bc.setPaddingBottom(14);
        bc.setPaddingLeft(16);
        bc.setPaddingRight(12);

        Phrase cp = new Phrase();
        cp.setLeading(CODE_LEADING);
        String[] clines = cs.getCode().split("\n");
        for (int i = 0; i < clines.length; i++) {
            cp.add(new Chunk(clines[i], fCode()));
            if (i < clines.length - 1) cp.add(Chunk.NEWLINE);
        }
        bc.addElement(cp);

        PdfPTable body = new PdfPTable(1);
        body.setWidthPercentage(100);
        body.setSpacingAfter(0);
        body.addCell(bc);
        doc.add(body);

        // ── Output section (if snippet has output field) ──────────────
        // Convention: if explanation starts with "Output:" we render it
        // as a dedicated output block; otherwise it becomes a Note.
        if (cs.getExplanation() != null && !cs.getExplanation().isBlank()) {
            String expl = cs.getExplanation().trim();
            if (expl.toLowerCase().startsWith("output:") ||
                expl.toLowerCase().startsWith("output :")) {
                buildOutputBlock(doc, expl.replaceFirst("(?i)output\\s*:\\s*", ""));
            } else {
                buildNoteBlock(doc, expl);
            }
        } else {
            addLines(doc, 1);
        }
    }

    /**
     * Dark "Output" strip — mimics the Code-Khmer PDF book output blocks.
     */
    private void buildOutputBlock(Document doc, String text) throws Exception {
        PdfPTable tbl = new PdfPTable(1);
        tbl.setWidthPercentage(100);
        tbl.setSpacingAfter(14);

        PdfPCell lbl = new PdfPCell();
        lbl.setBackgroundColor(OUT_BORDER);
        lbl.setBorder(Rectangle.NO_BORDER);
        lbl.setPaddingTop(4);
        lbl.setPaddingBottom(4);
        lbl.setPaddingLeft(14);
        Phrase lp = new Phrase();
        lp.add(new Chunk("▶  Output", fOutLbl()));
        lbl.addElement(lp);
        tbl.addCell(lbl);

        PdfPCell bc = new PdfPCell();
        bc.setBackgroundColor(OUT_BG);
        bc.setBorderWidthLeft(3f);
        bc.setBorderColorLeft(OUT_BORDER);
        bc.setBorder(Rectangle.LEFT);
        bc.setPaddingTop(9);
        bc.setPaddingBottom(11);
        bc.setPaddingLeft(14);
        bc.setPaddingRight(12);

        Phrase op = new Phrase();
        op.setLeading(CODE_LEADING);
        String[] lines = text.split("\n");
        for (int i = 0; i < lines.length; i++) {
            op.add(new Chunk(lines[i], fOutCode()));
            if (i < lines.length - 1) op.add(Chunk.NEWLINE);
        }
        bc.addElement(op);
        tbl.addCell(bc);
        doc.add(tbl);
    }

    /**
     * Green left-border "Note" callout — explanations / tips.
     */
    private void buildNoteBlock(Document doc, String text) throws Exception {
        PdfPTable note = new PdfPTable(1);
        note.setWidthPercentage(100);
        note.setSpacingAfter(14);

        PdfPCell nc = new PdfPCell();
        nc.setBackgroundColor(ACCENT_G_LT);
        nc.setBorderWidthLeft(3.5f);
        nc.setBorderColorLeft(ACCENT_GREEN);
        nc.setBorder(Rectangle.LEFT);
        nc.setPaddingTop(9);
        nc.setPaddingBottom(9);
        nc.setPaddingLeft(13);
        nc.setPaddingRight(10);
        nc.setLeading(0, KHMER_LEADING);

        Phrase np = new Phrase();
        np.setLeading(20);   // generous leading for Khmer inside cells
        np.add(new Chunk("Note:  ", fNoteLbl()));
        np.add(new Chunk(text, fNoteBody()));
        nc.addElement(np);
        note.addCell(nc);
        doc.add(note);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /** Strip basic HTML tags and entities from lesson content. */
    private String stripHtml(String s) {
        return s.replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;",  "&")
                .replaceAll("&lt;",   "<")
                .replaceAll("&gt;",   ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    private PdfPCell statCell(String label, String value, Color accent) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(COV_CARD);
        c.setBorderWidthTop(2.5f);
        c.setBorderColorTop(accent);
        c.setBorder(Rectangle.TOP);
        c.setPadding(11);
        c.setPaddingRight(7);
        c.setBorderWidthRight(3f);
        c.setBorderColorRight(COV_BG);
        Phrase p = new Phrase();
        p.setLeading(20);
        p.add(new Chunk(label + "\n", fStatLbl()));
        p.add(new Chunk(value,        fStatVal()));
        c.addElement(p);
        return c;
    }

    private PdfPCell numBadge(String text, Color bg, float fontSize) {
        PdfPCell c = new PdfPCell(new Phrase(text, fu(fontSize, Font.BOLD, WHITE)));
        c.setBackgroundColor(bg);
        c.setPadding(7);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setBorder(Rectangle.NO_BORDER);
        return c;
    }

    /** Cell with left-colour rule, coloured background, Khmer-friendly leading. */
    private PdfPCell styledCell(String text, Font font, Color bg, Color borderColor,
                                 float paddingLeft, float paddingV) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBackgroundColor(bg);
        c.setBorderWidthLeft(3.5f);
        c.setBorderColorLeft(borderColor);
        c.setBorder(Rectangle.LEFT);
        c.setPaddingLeft(paddingLeft);
        c.setPaddingTop(paddingV);
        c.setPaddingBottom(paddingV);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setLeading(0, KHMER_LEADING);
        return c;
    }

    private PdfPCell plainCell(String text, Font font, Color bg,
                                float paddingLeft, float paddingV) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBackgroundColor(bg);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPaddingLeft(paddingLeft);
        c.setPaddingTop(paddingV);
        c.setPaddingBottom(paddingV);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setLeading(0, KHMER_LEADING);
        return c;
    }

    private PdfPCell blankCell(Color bg) {
        PdfPCell c = new PdfPCell(new Phrase(" "));
        c.setBackgroundColor(bg);
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(4);
        return c;
    }

    private void hRule(Document doc, Color color, float pct,
                       float thickness, float before, float after) throws Exception {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(pct);
        t.setHorizontalAlignment(Element.ALIGN_LEFT);
        t.setSpacingBefore(before);
        t.setSpacingAfter(after);
        PdfPCell c = new PdfPCell(new Phrase(" "));
        c.setBorder(Rectangle.BOTTOM);
        c.setBorderColor(color);
        c.setBorderWidthBottom(thickness);
        c.setPaddingBottom(2);
        t.addCell(c);
        doc.add(t);
    }

    private void addLines(Document doc, int n) throws Exception {
        for (int i = 0; i < n; i++) doc.add(Chunk.NEWLINE);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  HEADER / FOOTER EVENT
    // ═══════════════════════════════════════════════════════════════════

    private static class HFEvent extends PdfPageEventHelper {
        private final Course course;
        private final CoursePdfGeneratorService svc;

        HFEvent(Course course, CoursePdfGeneratorService svc) {
            this.course = course;
            this.svc    = svc;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            if (writer.getPageNumber() == 1) return; // skip cover

            PdfContentByte cb = writer.getDirectContent();
            float L  = document.left();
            float R  = document.right();
            float MX = (L + R) / 2f;

            Font fn = svc.fHFNorm();
            Font fb = svc.fHFBold();

            // Top header line
            float hy = document.top() + 18;
            cb.setColorStroke(PRIMARY);
            cb.setLineWidth(0.9f);
            cb.moveTo(L, hy - 5);
            cb.lineTo(R, hy - 5);
            cb.stroke();

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("codekhmerlearning.site", fb), L, hy, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase(course.getTitle(), fn), R, hy, 0);

            // Bottom footer line
            float fy = document.bottom() - 24;
            cb.setColorStroke(new Color(226, 232, 240));
            cb.setLineWidth(0.5f);
            cb.moveTo(L, fy + 14);
            cb.lineTo(R, fy + 14);
            cb.stroke();

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("Code Khmer Learning", fn), L, fy, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("—  " + writer.getPageNumber() + "  —", fb), MX, fy, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("\u00a9 codekhmerlearning.site", fn), R, fy, 0);
        }
    }
}