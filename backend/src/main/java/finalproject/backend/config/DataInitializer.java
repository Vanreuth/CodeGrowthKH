package finalproject.backend.config;

import finalproject.backend.modal.*;
import finalproject.backend.repository.*;
import finalproject.backend.util.RoleUtil;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final CodeSnippetRepository codeSnippetRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    // ══════════════════════════════════════════════════════════════════════════
    @Override
    @Transactional
    public void run(String... args) {
        fixSchema();
        seedRoles();
        seedAdmin();
        seedInstructor();
        try {
            seedAll();
        } catch (Exception e) {
            log.error("⚠️ seedAll failed (non-fatal): {}", e.getMessage());
        }
    }

    /**
     * Drop NOT NULL on description so courses can be created without it.
     */
    private void fixSchema() {
        try {
            entityManager.createNativeQuery(
                    "ALTER TABLE course ALTER COLUMN description DROP NOT NULL"
            ).executeUpdate();
            entityManager.createNativeQuery(
                    "ALTER TABLE course ALTER COLUMN description SET DEFAULT ''"
            ).executeUpdate();
            log.info("✅ Schema fix: course.description is now nullable");
        } catch (Exception e) {
            log.debug("Schema fix skipped (already applied or not needed): {}", e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ROLES & ADMIN
    // ══════════════════════════════════════════════════════════════════════════

    private void seedRoles() {
        for (String role : List.of(
                RoleUtil.ROLE_USER,
                RoleUtil.ROLE_INSTRUCTOR,
                RoleUtil.ROLE_MODERATOR,
                RoleUtil.ROLE_ADMIN
        ))
            if (roleRepository.findByName(role).isEmpty())
                roleRepository.save(Role.builder().name(role).build());
    }

    private void seedAdmin() {
        String encodedPassword = passwordEncoder.encode("260403");

        // ✅ Mutable HashSet — Hibernate can modify it
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(roleRepository.findByName(RoleUtil.ROLE_ADMIN).orElseThrow());

        userRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    admin.setPassword(encodedPassword);
                    admin.setStatus("ACTIVE");
                    admin.setRoles(adminRoles);  // ✅ mutable set
                    userRepository.save(admin);
                    log.info("✅ Admin password updated → admin / 260403");
                },
                () -> {
                    userRepository.save(User.builder()
                            .username("admin")
                            .email("admin@codegrowthkh.site")
                            .password(encodedPassword)
                            .status("ACTIVE")
                            .roles(adminRoles)       // ✅ mutable set
                            .build());
                    log.info("✅ Admin seeded → admin / 260403");
                }
        );
    }


    private void seedInstructor() {
        String encodedPassword = passwordEncoder.encode("Instructor@1234");

        Set<Role> instructorRoles = new HashSet<>();
        instructorRoles.add(roleRepository.findByName(RoleUtil.ROLE_INSTRUCTOR).orElseThrow());

        userRepository.findByUsername("instructor").ifPresentOrElse(
                instructor -> {
                    instructor.setEmail("instructor@codegrowthkh.site");
                    instructor.setPassword(encodedPassword);
                    instructor.setStatus("ACTIVE");
                    instructor.setRoles(instructorRoles);
                    userRepository.save(instructor);
                    log.info("✅ Instructor password updated → instructor / Instructor@1234");
                },
                () -> {
                    userRepository.save(User.builder()
                            .username("instructor")
                            .email("instructor@codegrowthkh.site")
                            .password(encodedPassword)
                            .status("ACTIVE")
                            .roles(instructorRoles)
                            .build());
                    log.info("✅ Instructor seeded → instructor / Instructor@1234");
                }
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MAIN SEED
    // ══════════════════════════════════════════════════════════════════════════

    private void seedAll() {
        User ins = userRepository.findByUsername("instructor")
                .or(() -> userRepository.findByUsername("admin"))
                .orElseThrow();

        // ── Categories ────────────────────────────────────────────────────────
        Category webDev = cat(
                "ការអភិវឌ្ឍន៍គេហទំព័រ(Web Development)",
                "web-development",
                "សិក្សា HTML, CSS និង JavaScript ពីមូលដ្ឋានរហូតដល់ Framework ទំនើប",
                1
        );

        Category fe = cat(
                "ការអភិវឌ្ឍន៍ផ្នែកខាងមុខ (Frontend)",
                "frontend-engineering",
                "សិក្សា React.js, Next.js, TypeScript និង Tailwind CSS សម្រាប់បង្កើត UI ទំនើប",
                2
        );

        Category be = cat(
                "ការអភិវឌ្ឍន៍ផ្នែកខាងក្រោយ (Backend)",
                "backend-engineering",
                "សិក្សា Java, Spring Boot, REST API, JPA និង Security សម្រាប់ Server",
                3
        );

        Category devops = cat(
                "DevOps និងឧបករណ៍អភិវឌ្ឍន៍",
                "devops-tools",
                "សិក្សា Git, Docker, CI/CD, GitHub Actions និងឧបករណ៍សម្រាប់ Automation",
                4
        );

        // ── Courses ───────────────────────────────────────────────────────────
        seedHTML(ins, webDev);
        seedCSS(ins, webDev);
        seedJavaScript(ins, webDev);
        seedReact(ins, fe);
        seedNextJS(ins, fe);
        seedJava(ins, be);
        seedSpringBoot(ins, be);
        seedGit(ins, devops);

        log.info("✅ All {} courses seeded.", courseRepository.count());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. HTML
    // ══════════════════════════════════════════════════════════════════════════
    private void seedHTML(User ins, Category cat) {
        Course c = course("HTML សម្រាប់អ្នកចាប់ផ្តើម", "html-for-beginners-km",
                "រៀន HTML ពីដំបូងរហូតដល់ HTML5 Advanced ជាភាសាខ្មែរ។ " +
                        "Tags, Elements, Attributes, Lists, Links, Images, Media, " +
                        "Tables, Forms, Semantic HTML, Embedded Content, Accessibility, " +
                        "CSS Introduction និង Responsive Design។",
                "BEGINNER", true, ins, cat);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 1 — ការណែនាំអំពី HTML
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch1 = ch(c, "ការណែនាំអំពី HTML", 1);

        Lesson l1_1 = ls(ch1, c, "HTML គឺជាអ្វី?", 1,
                "HTML (HyperText Markup Language) ជាភាសាសម្គាល់ (markup language) " +
                        "ដែលត្រូវបានប្រើដើម្បីបង្កើតទំព័របណ្តាញ។\n\n" +
                        "HTML មិនមែនជាភាសាសរសេរកម្មវិធីទេ ប៉ុន្តែជាវិធីប្រាប់ browser " +
                        "ពីរបៀបបង្ហាញខ្លឹមសារ (អត្ថបទ, រូបភាព, តំណភ្ជាប់) ។\n\n" +
                        "HTML ប្រើជាមួយ CSS (រចនាប័ទ្ម) និង JavaScript (ឥរិយាបថ) " +
                        "ដើម្បីបង្កើតគេហទំព័រពេញលេញ ។");
        sn(l1_1, "HTML Paragraph មូលដ្ឋាន", """
                        <p>This is a paragraph in HTML.</p>""", "html",
                "ស្លាក <p> បង្ហាញកថាខណ្ឌ។ Browser នឹងបង្ហាញអត្ថបទជាកថាខណ្ឌធម្មតា។", 1);

        Lesson l1_2 = ls(ch1, c, "រចនាសម្ព័ន្ធ HTML Document", 2,
                "ឯកសារ HTML មានរចនាសម្ព័ន្ធជាមូលដ្ឋានដែលរួមបញ្ចូល:\n\n" +
                        "• <!DOCTYPE html> — ប្រកាសថានេះ HTML5\n" +
                        "• <html> — ធាតុឫស ផ្ទុកទំព័រទាំងមូល\n" +
                        "• <head> — ផ្ទុក metadata (charset, title, viewport)\n" +
                        "• <body> — ផ្ទុកខ្លឹមសារដែលបង្ហាញជូនអ្នកប្រើ");
        sn(l1_2, "HTML Document Structure", """
                        <!DOCTYPE html>
                        <html lang="km">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>My Page</title>
                        </head>
                        <body>
                            <h1>សួស្តី</h1>
                            <p>Welcome to my page!</p>
                        </body>
                        </html>""", "html",
                "<!DOCTYPE html> ប្រើតែ ១ ដងនៅ ចុះក្រោមបង្អស់ document ។ <html lang='km'> កំណត់ភាសា Khmer ។", 1);

        Lesson l1_3 = ls(ch1, c, "HTML Elements និង Attributes", 3,
                "Elements គឺជាស្លាកដែលបង្កើតខ្លឹមសារ ។ " +
                        "Attributes ផ្ដល់ព័ត៌មានបន្ថែមដល់ elements ។\n\n" +
                        "Opening tag: <tag>  |  Closing tag: </tag>  |  Void: <img />\n\n" +
                        "Attributes ត្រូវវាងក្នុង opening tag ជាទម្រង់ name=\"value\" ។");
        sn(l1_3, "Elements និង Attributes", """
                        <!-- Element with attributes -->
                        <a href="https://example.com" target="_blank">Visit Example</a>
                        
                        <!-- Void element (self-closing) -->
                        <img src="image.jpg" alt="A sample image">
                        
                        <!-- Heading + paragraph -->
                        <h1>This is a Heading</h1>
                        <p>This is a paragraph.</p>""", "html",
                "<a> — href (URL), target='_blank' (tab ថ្មី) ។ <img> — src (រូបភាព), alt (ពណ៌នា) ។", 1);

        Lesson l1_4 = ls(ch1, c, "រចនាសម្ព័ន្ធ HTML Page ពេញលេញ", 4,
                "ទំព័រ HTML ល្អមាន header, main, footer ដើម្បីរៀបចំខ្លឹមសារ ។\n\n" +
                        "នេះជាគំរូ semantic layout ដែលប្រើ HTML5 structural tags ។");
        sn(l1_4, "Full HTML Page Layout", """
                        <!DOCTYPE html>
                        <html lang="km">
                        <head>
                            <meta charset="UTF-8">
                            <title>Simple HTML Page</title>
                        </head>
                        <body>
                            <header>
                                <h1>My Website</h1>
                            </header>
                            <main>
                                <p>Welcome to my page!</p>
                            </main>
                            <footer>
                                <p>© 2025</p>
                            </footer>
                        </body>
                        </html>""", "html",
                "<header> ផ្នែកខាងលើ | <main> ខ្លឹមសារសំខាន់ | <footer> ផ្នែកខាងក្រោម ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 2 — Basic HTML Tags
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch2 = ch(c, "Basic HTML Tags", 2);

        Lesson l2_1 = ls(ch2, c, "Text Formatting Tags", 1,
                "ស្លាកដើម្បីរៀបចំអត្ថបទឱ្យមានរូបរាងល្អ និងអានយល់ងាយ ។\n\n" +
                        "h1–h6: ចំណងជើង (h1 ធំ, h6 តូច)\n" +
                        "<p>: កថាខណ្ឌ | <br>: line break | <hr>: បន្ទាត់ផ្តេក\n" +
                        "<strong>/<em>: semantic emphasis (SEO + a11y)\n" +
                        "<b>/<i>/<small>: visual styling only\n" +
                        "<u>/<mark>/<del>: text decoration");
        sn(l2_1, "Headings h1 to h6", """
                        <h1>Heading 1</h1>
                        <h2>Heading 2</h2>
                        <h3>Heading 3</h3>
                        <h4>Heading 4</h4>
                        <h5>Heading 5</h5>
                        <h6>Heading 6</h6>""", "html",
                "ប្រើ h1 តែ ១ ក្នុង ១ page ដើម្បី SEO ។ h2–h6 ប្រើជា sub-headings ។", 1);
        sn(l2_1, "Paragraph, Break, Horizontal Rule", """
                        <p>នេះជាកថាខណ្ឌមួយ។</p>
                        <p>នេះជាកថាខណ្ឌមួយទៀត។</p>
                        
                        <!-- Line break (void element) -->
                        <p>បន្ទាត់ទីមួយ<br>បន្ទាត់ទីពីរ</p>
                        
                        <!-- Horizontal rule -->
                        <p>ផ្នែកខាងលើ</p>
                        <hr>
                        <p>ផ្នែកខាងក្រោម</p>""", "html",
                "<br> មិនមាន closing tag ។ <hr> ប្រើបំបែកផ្នែក ។", 2);
        sn(l2_1, "Text Emphasis និង Decoration", """
                        <!-- Semantic (important for accessibility and SEO) -->
                        <strong>អត្ថបទសំខាន់ (bold + semantic meaning)</strong>
                        <em>អត្ថបទ emphasis (italic + semantic meaning)</em>
                        
                        <!-- Visual only (no semantic meaning) -->
                        <b>អក្សរដិត</b>
                        <i>អក្សរទ្រេត</i>
                        <small>អក្សរតូច</small>
                        
                        <!-- Decoration -->
                        <u>អត្ថបទមានបន្ទាត់ក្រោម</u>
                        <mark>អត្ថបទដែលបានគូសពណ៌</mark>
                        <del>អត្ថបទដែលត្រូវបានលុប</del>""", "html",
                "<strong>/<em> = semantic meaning ។ <b>/<i> = visual only ។ ប្រើ <strong>/<em> ជាអទិភាព ។", 3);

        Lesson l2_2 = ls(ch2, c, "Text Container Tags", 2,
                "ស្លាក container ប្រើផ្ទុក ឬរៀបចំ content ក្នុង page ។\n\n" +
                        "<span> — inline container (ក្នុងបន្ទាត់)\n" +
                        "<div> — block container (ស្ទង់មួយ)\n" +
                        "<pre> — preformatted text (រក្សា spaces & line breaks)");
        sn(l2_2, "span, div, pre", """
                        <!-- span - inline -->
                        <p>នេះជាអត្ថបទ <span style="color: red;">ដែលមានពណ៌ក្រហម</span></p>
                        
                        <!-- div - block -->
                        <div style="background-color: #f0f0f0; padding: 10px;">
                            <p>នេះជាផ្នែកមួយដែលប្រើ div</p>
                        </div>
                        
                        <!-- pre - preserves whitespace -->
                        <pre>
                        នេះជាអត្ថបទ
                            ដែលមានការរៀបចំ
                            ដូចដែលវាមាននៅក្នុងកូដ។
                        </pre>""", "html",
                "<span> ប្រើ style CSS ក្នុងបន្ទាត់ ។ <div> ប្រើ layout ។ <pre> ល្អសម្រាប់បង្ហាញ code ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 3 — Lists in HTML
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch3 = ch(c, "Lists in HTML", 3);

        Lesson l3_1 = ls(ch3, c, "Unordered, Ordered និង Definition Lists", 1,
                "HTML មាន ៣ ប្រភេទ List:\n\n" +
                        "• <ul> — Unordered list (bullet points)\n" +
                        "• <ol> — Ordered list (numbers/letters)\n" +
                        "• <dl> — Definition list (ពាក្យ + និយមន័យ)\n\n" +
                        "<li> ជា list item ។ <dt> ជាពាក្យ, <dd> ជានិយមន័យ ។");
        sn(l3_1, "Unordered List", """
                        <ul>
                            <li>ផ្លែប៉ោម</li>
                            <li>ផ្លែលីម</li>
                            <li>ផ្លែក្រូច</li>
                        </ul>""", "html",
                "<ul> ប្រើ bullet points ។ ល្អសម្រាប់ list ដែលគ្មានលំដាប់ ។", 1);
        sn(l3_1, "Ordered List", """
                        <ol>
                            <li>រៀន HTML</li>
                            <li>រៀន CSS</li>
                            <li>រៀន JavaScript</li>
                        </ol>""", "html",
                "<ol> ប្រើ numbers ។ ល្អសម្រាប់ step-by-step instructions ។", 2);
        sn(l3_1, "Definition List", """
                        <dl>
                            <dt>HTML</dt>
                            <dd>ភាសាសម្រាប់បង្កើតទំព័របណ្តាញ។</dd>
                        
                            <dt>CSS</dt>
                            <dd>ភាសាសម្រាប់រចនាបថនៃទំព័របណ្តាញ។</dd>
                        </dl>""", "html",
                "<dl> ល្អសម្រាប់ glossary ឬ FAQ ។ <dt> = term, <dd> = description ។", 3);
        sn(l3_1, "Nested List", """
                        <ul>
                            <li>Frontend
                                <ul>
                                    <li>HTML</li>
                                    <li>CSS</li>
                                    <li>JavaScript</li>
                                </ul>
                            </li>
                            <li>Backend
                                <ul>
                                    <li>Java</li>
                                    <li>Spring Boot</li>
                                </ul>
                            </li>
                        </ul>""", "html",
                "List អាច nest ជាច្រើនកម្រិត ។ <li> ត្រូវវាងក្នុង <ul> ឬ <ol> ។", 4);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 4 — Links and Navigation
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch4 = ch(c, "Links and Navigation", 4);

        Lesson l4_1 = ls(ch4, c, "Anchor Tag — Hyperlinks", 1,
                "ស្លាក <a> (anchor) ប្រើបង្កើត hyperlinks ទៅ pages ផ្សេង ។\n\n" +
                        "href — URL ឬ path\n" +
                        "target='_blank' — បើក tab ថ្មី\n" +
                        "rel='noopener' — security attribute\n" +
                        "title — tooltip ពេល hover\n\n" +
                        "Link types: absolute URL, relative path, anchor (#id), mailto, tel");
        sn(l4_1, "Link Types", """
                        <!-- Absolute URL -->
                        <a href="https://www.codekhmerlearning.site">Code Khmer Learning</a>
                        
                        <!-- Relative path -->
                        <a href="about.html">អំពីយើង</a>
                        <a href="../index.html">ទៅ folder ខ្ពស់ជាង</a>
                        
                        <!-- Tab ថ្មី + security -->
                        <a href="https://google.com" target="_blank"
                           rel="noopener" title="ចូល Google">Google</a>
                        
                        <!-- Anchor ក្នុង page -->
                        <a href="#section1">ទៅ Section 1</a>
                        <section id="section1"><h2>Section 1</h2></section>
                        
                        <!-- Email link -->
                        <a href="mailto:info@codekhmer.site">ផ្ញើ Email</a>
                        
                        <!-- Phone link -->
                        <a href="tel:+85512345678">ទូរស័ព្ទ</a>""", "html",
                "rel='noopener' ជួយ security ពេល target='_blank' ។ title= ជា tooltip ។", 1);

        Lesson l4_2 = ls(ch4, c, "Navigation Menu", 2,
                "<nav> ជា semantic tag សម្រាប់ navigation links ។\n\n" +
                        "ប្រើ <nav> + <ul> + <li> + <a> ជា pattern ស្តង់ដារ ។\n\n" +
                        "Screen readers និង search engines ចូលចិត្ត <nav> ។");
        sn(l4_2, "Navigation Menu", """
                        <nav>
                            <ul>
                                <li><a href="#home">ទំព័រដើម</a></li>
                                <li><a href="#about">អំពីយើង</a></li>
                                <li><a href="#contact">ទំនាក់ទំនង</a></li>
                            </ul>
                        </nav>""", "html",
                "ប្រើ <nav> សម្រាប់ navigation សំខាន់ ។ <ul> ក្នុង <nav> = best practice ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 5 — Images and Media
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch5 = ch(c, "Images and Media", 5);

        Lesson l5_1 = ls(ch5, c, "Images", 1,
                "<img> ជា void element (self-closing) ។\n\n" +
                        "Attributes សំខាន់:\n" +
                        "• src — path ឬ URL ប្រភពរូបភាព\n" +
                        "• alt — ពណ៌នាសម្រាប់ screen readers + SEO\n" +
                        "• width / height — ទំហំ (px)\n" +
                        "• loading='lazy' — defer loading ធ្វើ performance ល្អ");
        sn(l5_1, "Image Examples", """
                        <!-- Image ដើម -->
                        <img src="logo.png" alt="Logo Code Khmer" width="200" height="100">
                        
                        <!-- Image ពី URL -->
                        <img src="https://example.com/photo.jpg"
                             alt="ពណ៌នា image"
                             loading="lazy">
                        
                        <!-- Responsive image -->
                        <img src="hero.jpg" alt="Hero image"
                             style="max-width: 100%; height: auto;">""", "html",
                "alt text ត្រូវតែពណ៌នារូបភាព ។ loading='lazy' ធ្វើ page load លឿន ។", 1);

        Lesson l5_2 = ls(ch5, c, "Audio និង Video", 2,
                "<audio> ប្រើបញ្ចូលសំឡេង ។ <video> ប្រើបញ្ចូលវីដេអូ ។\n\n" +
                        "controls — បង្ហាញ play/pause controls\n" +
                        "autoplay — លេងស្វ័យប្រវត្តិ (ត្រូវ muted ក្នុង Chrome)\n" +
                        "loop — លេងសារឡើងវិញ\n\n" +
                        "<source> ផ្ដល់ fallback formats ។ <track> ផ្ដល់ subtitles ។");
        sn(l5_2, "Audio", """
                        <audio controls>
                            <source src="sound.mp3" type="audio/mpeg">
                            Browser មិនគាំទ្រ audio tag។
                        </audio>
                        
                        <!-- Autoplay background music -->
                        <audio src="bg-music.mp3" autoplay loop muted controls></audio>""", "html",
                "ប្រើ <source> ជំនួស src= ដើម្បីផ្ដល់ formats ច្រើន (mp3, ogg) ។", 1);
        sn(l5_2, "Video with Subtitles", """
                        <video width="640" height="360" controls>
                            <source src="movie.mp4" type="video/mp4">
                            <source src="movie.ogg" type="video/ogg">
                            <track src="subtitles_km.vtt" kind="subtitles"
                                   srclang="km" label="ខ្មែរ">
                            Browser មិនគាំទ្រ video tag។
                        </video>""", "html",
                "<track> ផ្ដល់ subtitles (WebVTT format) ។ Browser ជ្រើស <source> ដំបូងដែលវាគាំទ្រ ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 6 — Tables
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch6 = ch(c, "Tables", 6);

        Lesson l6_1 = ls(ch6, c, "Table Structure", 1,
                "Table ប្រើបង្ហាញទិន្នន័យជាជួរ (rows) និងជួរឈរ (columns) ។\n\n" +
                        "<table> — container\n" +
                        "<thead> /<tbody> / <tfoot> — sections\n" +
                        "<tr> — row | <th> — header cell | <td> — data cell\n" +
                        "<caption> — ចំណងជើង table\n" +
                        "colspan / rowspan — merge cells");
        sn(l6_1, "Table with Sections", """
                        <table border="1">
                            <caption>បញ្ជីសិស្ស</caption>
                            <thead>
                                <tr>
                                    <th>ឈ្មោះ</th>
                                    <th>អាយុ</th>
                                    <th>ថ្នាក់</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>សុភា</td>
                                    <td>២០</td>
                                    <td>១២A</td>
                                </tr>
                                <tr>
                                    <td>ចាន់ថន</td>
                                    <td>២២</td>
                                    <td>១២B</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3">ចំនួនសិស្សសរុប: ២ នាក់</td>
                                </tr>
                            </tfoot>
                        </table>""", "html",
                "ប្រើ thead/tbody/tfoot ជានិច្ច ។ <th> bold ស្វ័យប្រវត្តិ ។ colspan='3' merge ៣ cells ។", 1);
        sn(l6_1, "Table Pricing", """
                        <table border="1">
                            <caption>តារាងតម្លៃ</caption>
                            <thead>
                                <tr>
                                    <th>ផលិតផល</th>
                                    <th>ចំនួន</th>
                                    <th>តម្លៃ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>កាហ្វេ</td>
                                    <td>2</td>
                                    <td>$4</td>
                                </tr>
                                <tr>
                                    <td>ស៊ុប</td>
                                    <td>1</td>
                                    <td>$3</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2"><strong>សរុប</strong></td>
                                    <td><strong>$7</strong></td>
                                </tr>
                            </tfoot>
                        </table>""", "html",
                "Table ល្អសម្រាប់ comparison, pricing, schedules ។ កុំប្រើ table ជា layout ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 7 — Forms and Input
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch7 = ch(c, "Forms and Input", 7);

        Lesson l7_1 = ls(ch7, c, "HTML Form មូលដ្ឋាន", 1,
                "<form> ប្រមូលទិន្នន័យពីអ្នកប្រើ ។\n\n" +
                        "action — URL ដែលទិន្នន័យត្រូវបញ្ជូន\n" +
                        "method — GET (URL query) ឬ POST (request body)\n\n" +
                        "<fieldset> + <legend> ដាក់ inputs ជាក្រុម ។\n" +
                        "<label for='id'> ភ្ជាប់ label ជាមួយ input (accessibility) ។");
        sn(l7_1, "Form Structure", """
                        <form action="/submit" method="post">
                            <fieldset>
                                <legend>ព័ត៌មានផ្ទាល់ខ្លួន</legend>
                        
                                <label for="name">ឈ្មោះ:</label>
                                <input type="text" id="name" name="name" placeholder="ឈ្មោះ">
                                <br><br>
                        
                                <label for="message">សារ:</label><br>
                                <textarea id="message" name="message"
                                          placeholder="សាររបស់អ្នក" rows="4" cols="40"></textarea>
                                <br><br>
                        
                                <label for="level">ជ្រើសរើស:</label>
                                <select id="level" name="level">
                                    <option value="">-- ជ្រើសរើស --</option>
                                    <option value="beginner">អ្នកចាប់ផ្ដើម</option>
                                    <option value="intermediate">មធ្យម</option>
                                    <option value="advanced">កម្រិតខ្ពស់</option>
                                </select>
                            </fieldset>
                            <br>
                            <button type="submit">បញ្ជូន</button>
                            <button type="reset">លុប</button>
                        </form>""", "html",
                "label for= ត្រូវ match id= ។ POST ល្អជាង GET សម្រាប់ sensitive data ។", 1);

        Lesson l7_2 = ls(ch7, c, "Input Types ផ្សេងៗ", 2,
                "HTML5 ផ្ដល់ input types ច្រើន:\n\n" +
                        "text, email, password, number, date, color, range,\n" +
                        "checkbox, radio, file, submit, reset, hidden\n\n" +
                        "Input type ត្រឹមត្រូវវ browser keyboard ផ្លាស់ប្ដូរ (mobile) ។");
        sn(l7_2, "Input Types", """
                        <input type="text"     placeholder="ឈ្មោះ">
                        <input type="email"    placeholder="Email">
                        <input type="password" placeholder="លេខសម្ងាត់">
                        <input type="number"   placeholder="អាយុ" min="1" max="120">
                        <input type="date">
                        <input type="color">
                        <input type="range"    min="0" max="100" step="5">
                        
                        <!-- Checkbox (ជ្រើសបាន many) -->
                        <label>
                            <input type="checkbox"> ចូលរួមសកម្មភាព
                        </label>
                        
                        <!-- Radio (ជ្រើស ១ ក្នុង group) -->
                        <label><input type="radio" name="gender" value="male">   ប្រុស</label>
                        <label><input type="radio" name="gender" value="female"> ស្រី</label>
                        
                        <input type="submit" value="បញ្ជូន">
                        <input type="reset"  value="លុប">""", "html",
                "Radio name= ត្រូវដូចគ្នា ដើម្បីជ្រើស ១ ។ checkbox ជ្រើសបាន many ។", 1);

        Lesson l7_3 = ls(ch7, c, "Form ចុះឈ្មោះ — Registration", 3,
                "Form ចុះឈ្មោះពេញលេញ:\n\n" +
                        "ឈ្មោះ, email, password (required)\n" +
                        "select dropdown, checkbox terms\n" +
                        "HTML5 validation: required, minlength, pattern ។");
        sn(l7_3, "Registration Form", """
                        <form action="/api/v1/auth/register" method="POST">
                        
                            <label for="fullname">ឈ្មោះពេញ:</label>
                            <input type="text" id="fullname" name="fullname"
                                   placeholder="បញ្ចូលឈ្មោះ" required minlength="2">
                            <br><br>
                        
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email"
                                   placeholder="example@email.com" required>
                            <br><br>
                        
                            <label for="password">ពាក្យសម្ងាត់:</label>
                            <input type="password" id="password" name="password"
                                   placeholder="Min 8 characters" required minlength="8">
                            <br><br>
                        
                            <label for="level">កម្រិត:</label>
                            <select id="level" name="level">
                                <option value="">-- ជ្រើសរើស --</option>
                                <option value="beginner">អ្នកចាប់ផ្ដើម</option>
                                <option value="intermediate">មធ្យម</option>
                                <option value="advanced">កម្រិតខ្ពស់</option>
                            </select>
                            <br><br>
                        
                            <input type="checkbox" id="terms" name="terms" required>
                            <label for="terms">យល់ព្រមលក្ខខណ្ឌ</label>
                            <br><br>
                        
                            <button type="submit">ចុះឈ្មោះ</button>
                            <button type="reset">លុបទម្រង់</button>
                        </form>""", "html",
                "required ធ្វើ browser validation ។ minlength= ត្រូវការអក្សរយ៉ាងតិច ។", 1);

        Lesson l7_4 = ls(ch7, c, "HTML5 Form Validation", 4,
                "HTML5 validation attributes:\n\n" +
                        "required — ត្រូវតែបំពេញ\n" +
                        "pattern — regex pattern\n" +
                        "min / max — range number/date\n" +
                        "minlength / maxlength — ចំនួនអក្សរ\n\n" +
                        "Browser ធ្វើ validation ស្វ័យប្រវត្តិ ។ Server-side validation ក៏ចំបាច់ ។");
        sn(l7_4, "Validation Attributes", """
                        <form>
                            <input type="text" name="username" required placeholder="Username">
                        
                            <input type="email" name="email" required placeholder="Email">
                        
                            <!-- Custom pattern: phone KH (9-10 digits) -->
                            <input type="text" name="phone"
                                   pattern="[0-9]{9,10}"
                                   placeholder="ទូរស័ព្ទ (9-10 ខ្ទង់)"
                                   title="សូមបញ្ចូលលេខ 9-10 ខ្ទង់">
                        
                            <!-- Number with range -->
                            <input type="number" name="age"
                                   min="18" max="100" placeholder="អាយុ (18-100)">
                        
                            <!-- Text length -->
                            <input type="text" name="bio"
                                   minlength="10" maxlength="200"
                                   placeholder="ជីវប្រវត្តិ (10-200 អក្សរ)">
                        
                            <button type="submit">Submit</button>
                        </form>""", "html",
                "pattern= ប្រើ regular expression ។ title= ជា error message ។", 1);

        Lesson l7_5 = ls(ch7, c, "Select Advanced — Optgroup និង Datalist", 5,
                "<optgroup> ដាក់ options ជាក្រុម ។\n" +
                        "<datalist> ផ្ដល់ autocomplete suggestions ។");
        sn(l7_5, "Select with Optgroup", """
                        <select name="education">
                            <optgroup label="ការអប់រំ">
                                <option value="primary">បឋមសិក្សា</option>
                                <option value="secondary">មធ្យមសិក្សា</option>
                                <option value="university">ឧត្តមសិក្សា</option>
                            </optgroup>
                            <optgroup label="វិជ្ជាជីវៈ">
                                <option value="it">IT</option>
                                <option value="business">ធុរកិច្ច</option>
                            </optgroup>
                        </select>""", "html",
                "<optgroup label=> ជួយចាត់ categories ។ ប្រើ selected attribute ដើម្បីដាក់ default ។", 1);
        sn(l7_5, "Datalist Autocomplete", """
                        <label for="course">វគ្គ:</label>
                        <input type="text" id="course" name="course"
                               list="course-options" placeholder="វាយ ឬជ្រើសរើស...">
                        
                        <datalist id="course-options">
                            <option value="HTML">
                            <option value="CSS">
                            <option value="JavaScript">
                            <option value="React">
                            <option value="Java">
                            <option value="Spring Boot">
                        </datalist>""", "html",
                "<datalist> + list= ភ្ជាប់ autocomplete ។ អ្នកប្រើអាចវាយ ឬជ្រើស ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 8 — Semantic HTML5
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch8 = ch(c, "Semantic HTML5", 8);

        Lesson l8_1 = ls(ch8, c, "Semantic Elements", 1,
                "Semantic HTML ប្រើ tags ដែលពណ៌នាខ្លឹមសារ ជំនួស <div> ទូទៅ ។\n\n" +
                        "✅ SEO: search engines យល់ content structure\n" +
                        "✅ Accessibility: screen readers navigate ល្អ\n" +
                        "✅ Maintainability: code អានយល់ងាយ\n\n" +
                        "Tags: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>");
        sn(l8_1, "Semantic Page Layout", """
                        <!DOCTYPE html>
                        <html lang="km">
                        <head>
                            <meta charset="UTF-8">
                            <title>Code Khmer Learning</title>
                        </head>
                        <body>
                        
                            <!-- Header: logo + navigation -->
                            <header>
                                <a href="/" class="logo">Code Khmer</a>
                                <nav>
                                    <a href="/">ដើម</a>
                                    <a href="/courses">វគ្គសិក្សា</a>
                                    <a href="/about">អំពីយើង</a>
                                </nav>
                            </header>
                        
                            <!-- Main content area -->
                            <main>
                                <section id="featured-courses">
                                    <h2>វគ្គសិក្សាពេញនិយម</h2>
                        
                                    <article class="course-card">
                                        <h3>HTML សម្រាប់អ្នកចាប់ផ្ដើម</h3>
                                        <p>រៀន HTML ពីដំបូង...</p>
                                        <a href="/courses/html">ចូលរៀន</a>
                                    </article>
                        
                                    <article class="course-card">
                                        <h3>CSS Styling</h3>
                                        <p>រចនាទំព័រ...</p>
                                    </article>
                                </section>
                            </main>
                        
                            <!-- Secondary content -->
                            <aside>
                                <h3>ការប្រកាស</h3>
                                <p>វគ្គ React ថ្មីបានចេញ!</p>
                            </aside>
                        
                            <footer>
                                <p>&copy; 2026 Code Khmer Learning. រក្សាសិទ្ធគ្រប់យ៉ាង។</p>
                            </footer>
                        
                        </body>
                        </html>""", "html",
                "<section> = group of related content ។ <article> = standalone unit ។ ១ <main> ក្នុង ១ page ។", 1);
        sn(l8_1, "New HTML5 Elements", """
                        <!-- figure + figcaption -->
                        <figure>
                            <img src="course-banner.jpg" alt="HTML Course Banner">
                            <figcaption>រូបភាព: ទំព័រដើម Code Khmer Learning</figcaption>
                        </figure>
                        
                        <!-- details + summary (accordion ដោយគ្មាន JS) -->
                        <details>
                            <summary>HTML គឺជាអ្វី?</summary>
                            <p>HTML ជាភាសា markup សម្រាប់បង្កើតទំព័រ web ។</p>
                        </details>
                        
                        <!-- time element (ជួយ SEO) -->
                        <p>ផ្សាយ:
                            <time datetime="2025-01-15">ថ្ងៃទី ១៥ ខែ មករា ឆ្នាំ ២០២៥</time>
                        </p>
                        
                        <!-- mark -->
                        <p>HTML ប្រើ <mark>markup tags</mark> ដើម្បីរចនាសម្ព័ន្ធ page ។</p>""", "html",
                "<details>/<summary> ធ្វើ accordion ។ <time datetime=> ជួយ SEO ស្គាល់ dates ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 9 — Embedded Content
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch9 = ch(c, "Embedded Content", 9);

        Lesson l9_1 = ls(ch9, c, "iframe — Embedding External Content", 1,
                "<iframe> (Inline Frame) បញ្ចូល content ខាងក្រៅ ។\n\n" +
                        "ប្រើបញ្ចូល Google Maps, YouTube video, Google Forms ។\n\n" +
                        "Attributes: src, width, height, allowfullscreen, title, loading ។");
        sn(l9_1, "iframe Examples", """
                        <!-- Embed external page -->
                        <iframe src="https://example.com"
                                width="600" height="400"
                                title="External Content"></iframe>
                        
                        <!-- Embed YouTube -->
                        <iframe width="560" height="315"
                                src="https://www.youtube.com/embed/VIDEO_ID"
                                title="YouTube Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                                allowfullscreen></iframe>
                        
                        <!-- Embed Google Map -->
                        <iframe
                            src="https://maps.google.com/maps?q=Phnom+Penh&output=embed"
                            width="600" height="450"
                            loading="lazy"
                            title="Phnom Penh Map"></iframe>""", "html",
                "ដាក់ title= ដើម្បី accessibility ។ loading='lazy' ជួយ performance ។", 1);

        Lesson l9_2 = ls(ch9, c, "SVG និង Canvas", 2,
                "<svg> — Scalable Vector Graphics ។ ពង្រីកដោយគ្មានបាត់គុណភាព ។\n\n" +
                        "<canvas> — Drawing API ។ ប្រើ JavaScript គូររូបភាព dynamic ។\n\n" +
                        "SVG: icons, logos, charts ។ Canvas: games, animations ។");
        sn(l9_2, "SVG Shapes", """
                        <!-- SVG Circle -->
                        <svg width="100" height="100">
                            <circle cx="50" cy="50" r="40"
                                    stroke="green" stroke-width="4" fill="yellow"/>
                        </svg>
                        
                        <!-- SVG Rectangle with text -->
                        <svg width="200" height="100">
                            <rect x="10" y="10" width="180" height="80"
                                  fill="#4CAF50" rx="10" ry="10"/>
                            <text x="100" y="55" text-anchor="middle"
                                  fill="white" font-size="16">Code Khmer</text>
                        </svg>""", "html",
                "SVG ល្អសម្រាប់ icons ។ rx/ry = border radius ។ text-anchor='middle' = center text ។", 1);
        sn(l9_2, "Canvas with JavaScript", """
                        <canvas id="myCanvas" width="400" height="200"
                                style="border:1px solid #ccc;"></canvas>
                        
                        <script>
                            const canvas = document.getElementById("myCanvas");
                            const ctx = canvas.getContext("2d");
                        
                            // Rectangle
                            ctx.fillStyle = "#4CAF50";
                            ctx.fillRect(10, 10, 150, 80);
                        
                            // Text
                            ctx.fillStyle = "white";
                            ctx.font = "20px Arial";
                            ctx.fillText("Code Khmer", 20, 55);
                        
                            // Circle
                            ctx.beginPath();
                            ctx.arc(300, 100, 60, 0, Math.PI * 2);
                            ctx.fillStyle = "#FF5722";
                            ctx.fill();
                        </script>""", "html",
                "Canvas ប្រើ JavaScript ។ getContext('2d') ចាប់ 2D drawing API ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 10 — HTML Attributes
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch10 = ch(c, "HTML Attributes", 10);

        Lesson l10_1 = ls(ch10, c, "Global Attributes", 1,
                "Global Attributes អាចប្រើជាមួយ HTML elements ណាមួយ:\n\n" +
                        "id — unique identifier (CSS #id, JS getElementById)\n" +
                        "class — CSS class (ច្រើន elements ប្រើ .class)\n" +
                        "style — inline CSS\n" +
                        "title — tooltip ពេល hover\n" +
                        "hidden — លាក់ element\n" +
                        "tabindex — keyboard navigation order");
        sn(l10_1, "Global Attributes", """
                        <!-- id, class, style -->
                        <div id="header" class="main-header hero" style="color: blue;">
                            ស្វាគមន៍!
                        </div>
                        
                        <!-- title (tooltip) -->
                        <img src="logo.png" alt="Logo" title="Code Khmer Learning">
                        
                        <!-- href, target -->
                        <a href="https://example.com" target="_blank">Visit Site</a>
                        
                        <!-- hidden element -->
                        <p hidden>ដើម្បីភ្ញៀវ admin ប៉ុណ្ណោះ</p>""", "html",
                "id ត្រូវ unique ក្នុង ១ page ។ class អាចប្រើ ច្រើន elements ។ id ប្រើ # | class ប្រើ . ក្នុង CSS ។", 1);

        Lesson l10_2 = ls(ch10, c, "data-* Custom Attributes", 2,
                "data-* attributes ប្រើរក្សាទុកទិន្នន័យ custom ក្នុង HTML ។\n\n" +
                        "JavaScript ចូលប្រើ: element.dataset.propertyName (camelCase) ។\n\n" +
                        "ល្អសម្រាប់ store IDs, config, state ។");
        sn(l10_2, "data-* Attributes", """
                        <!-- Store custom data on HTML elements -->
                        <button data-user-id="123" data-role="admin" id="userBtn">
                            ព័ត៌មានអ្នកប្រើ
                        </button>
                        
                        <div data-course-id="html-01"
                             data-difficulty="beginner"
                             class="course-card">
                            <h3>HTML Course</h3>
                        </div>
                        
                        <script>
                            const btn = document.getElementById("userBtn");
                            console.log(btn.dataset.userId); // "123"
                            console.log(btn.dataset.role);   // "admin"
                        
                            // Change data dynamically
                            btn.dataset.role = "user";
                        </script>""", "html",
                "data-user-id= ចូលប្រើ dataset.userId (camelCase) ។ ល្អសម្រាប់ JavaScript interactions ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 11 — HTML Accessibility (a11y)
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch11 = ch(c, "HTML Accessibility (a11y)", 11);

        Lesson l11_1 = ls(ch11, c, "ARIA Roles និង Attributes", 1,
                "ARIA (Accessible Rich Internet Applications) ផ្ដល់ semantic information " +
                        "ដល់ assistive technologies (screen readers) ។\n\n" +
                        "role= — បញ្ជាក់ function (button, navigation, alert)\n" +
                        "aria-label= — label ដែលស្ដាប់បាន\n" +
                        "aria-live= — ប្រកាស dynamic changes\n" +
                        "aria-pressed= / aria-expanded= — state management");
        sn(l11_1, "ARIA Examples", """
                        <!-- Alert region -->
                        <div role="alert" aria-live="assertive">
                            មានបញ្ហា! សូមមើលឡើងវិញ។
                        </div>
                        
                        <!-- Toggle button with state -->
                        <button aria-pressed="false"
                                onclick="this.setAttribute('aria-pressed',
                                         this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')">
                            Like
                        </button>
                        
                        <!-- Icon button with accessible label -->
                        <button aria-label="ស្វែងរក">🔍</button>
                        
                        <!-- Collapsible menu -->
                        <button aria-expanded="false" aria-controls="menu">ម៉ឺនុយ</button>
                        <ul id="menu" hidden>
                            <li><a href="/">ដើម</a></li>
                        </ul>""", "html",
                "aria-label= ជួយ screen readers ។ aria-live='assertive' ប្រកាសភ្លាម ។", 1);

        Lesson l11_2 = ls(ch11, c, "Keyboard Navigation", 2,
                "Website ល្អអាចប្រើដោយ keyboard ទាំងស្រុង ។\n\n" +
                        "tabindex='0' — ដាក់ element ក្នុង tab order\n" +
                        "tabindex='-1' — ដោះ element ចេញពី tab order\n" +
                        "accesskey= — keyboard shortcut\n" +
                        "Skip link — លោតរំលង navigation សម្រាប់ keyboard users ។");
        sn(l11_2, "Keyboard Navigation", """
                        <!-- Tab order -->
                        <a href="/" tabindex="1">ទំព័រដើម</a>
                        <a href="/courses" tabindex="2">វគ្គសិក្សា</a>
                        
                        <!-- Access key shortcut -->
                        <button tabindex="0" accesskey="s">រក្សាទុក (Alt+S)</button>
                        
                        <!-- Skip navigation link (a11y best practice) -->
                        <a href="#main-content" class="skip-link">Skip to main content</a>
                        
                        <main id="main-content">
                            <h1>ខ្លឹមសារ</h1>
                        </main>
                        
                        <style>
                            .skip-link {
                                position: absolute;
                                top: -40px;
                                left: 0;
                                background: #000;
                                color: white;
                                padding: 8px;
                                z-index: 100;
                            }
                            .skip-link:focus { top: 0; }
                        </style>""", "html",
                "Skip link ជួយ keyboard users លោតរំលង nav ។ tabindex='0' ធ្វើ element focusable ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 12 — Meta Tags និង SEO
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch12 = ch(c, "Meta Tags, SEO និង Head Elements", 12);

        Lesson l12_1 = ls(ch12, c, "Meta Tags សំខាន់ៗ", 1,
                "Meta tags ស្ថិតនៅក្នុង <head> ។\n\n" +
                        "charset='UTF-8' — support Khmer text ។\n" +
                        "viewport — mobile responsive ។\n" +
                        "description — Google search snippet (max 160 chars) ។\n" +
                        "og: — Open Graph = Facebook/Twitter link preview ។\n" +
                        "canonical — ដោះ duplicate content ។");
        sn(l12_1, "Complete Head Section", """
                        <head>
                            <!-- Encoding: ចំបាច់ណាស់សម្រាប់ Khmer -->
                            <meta charset="UTF-8">
                        
                            <!-- Mobile responsive -->
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        
                            <!-- SEO -->
                            <meta name="description"
                                  content="រៀន HTML ពីដំបូង ជាភាសាខ្មែរ ជាមួយ Code Khmer Learning">
                            <meta name="keywords" content="HTML, Khmer, Web Development, ភាសាខ្មែរ">
                            <meta name="author" content="Code Khmer Learning">
                            <meta name="robots" content="index, follow">
                        
                            <!-- Open Graph (Facebook/Social media preview) -->
                            <meta property="og:title" content="HTML Course - Code Khmer">
                            <meta property="og:description" content="រៀន HTML ជាភាសាខ្មែរ">
                            <meta property="og:image" content="https://codekhmerlearning.site/og.jpg">
                            <meta property="og:url" content="https://codekhmerlearning.site">
                        
                            <!-- Canonical URL (SEO: no duplicate content) -->
                            <link rel="canonical" href="https://codekhmerlearning.site/courses/html">
                        
                            <!-- Favicon -->
                            <link rel="icon" href="/favicon.ico" type="image/x-icon">
                        
                            <!-- External CSS -->
                            <link rel="stylesheet" href="styles.css">
                        
                            <title>HTML Course — Code Khmer Learning</title>
                        </head>""", "html",
                "description ក្រោម 160 characters ។ og: tags ធ្វើ link preview ។ canonical ដោះ duplicate content ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 13 — CSS Introduction
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch13 = ch(c, "CSS Introduction — Styling HTML", 13);

        Lesson l13_1 = ls(ch13, c, "Ways to Add CSS", 1,
                "CSS អាចបញ្ចូលបាន ៣ វិធី:\n\n" +
                        "1. Inline CSS — style= attribute\n" +
                        "2. Internal CSS — <style> tag ក្នុង <head>\n" +
                        "3. External CSS — <link> ទៅ .css file (recommended)\n\n" +
                        "External CSS: reusable, maintainable, cacheable ។");
        sn(l13_1, "3 Ways to Add CSS", """
                        <!DOCTYPE html>
                        <html lang="km">
                        <head>
                            <meta charset="UTF-8">
                        
                            <!-- ② Internal CSS -->
                            <style>
                                body {
                                    background-color: #f5f5f5;
                                    font-family: Arial, sans-serif;
                                }
                                h1 { color: #2c3e50; }
                            </style>
                        
                            <!-- ③ External CSS (best practice) -->
                            <link rel="stylesheet" href="styles.css">
                        </head>
                        <body>
                        
                            <!-- ① Inline CSS -->
                            <p style="color: red; font-size: 18px;">Inline styled paragraph</p>
                        
                            <h1>ស្វាគមន៍</h1>
                            <p>ខ្លឹមសារ</p>
                        
                        </body>
                        </html>""", "html",
                "External CSS ល្អបំផុតសម្រាប់ project ។ Inline CSS ប្រើតែ quick override ។", 1);
        sn(l13_1, "Basic CSS Properties", """
                        /* styles.css */
                        h1 {
                            color: blue;
                            font-size: 32px;
                            font-family: Arial, sans-serif;
                            text-align: center;
                            margin-top: 20px;
                            padding: 10px;
                        }
                        
                        p {
                            color: #333333;
                            line-height: 1.6;
                            margin: 0 0 10px 0;
                            padding: 5px;
                        }
                        
                        .highlight {
                            background-color: #FFEB3B;
                            border-radius: 4px;
                            padding: 2px 6px;
                        }
                        
                        #header {
                            background-color: #2c3e50;
                            color: white;
                            padding: 20px;
                        }""", "css",
                "color= text color ។ margin= space ខាងក្រៅ ។ padding= space ខាងក្នុង ។ #id selector vs .class selector ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 14 — HTML5 New Features និង APIs
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch14 = ch(c, "HTML5 New Features និង APIs", 14);

        Lesson l14_1 = ls(ch14, c, "HTML5 New Input Types", 1,
                "HTML5 ផ្ដល់ input types ថ្មីៗ:\n\n" +
                        "date, time, month, week — date/time pickers\n" +
                        "color — color picker\n" +
                        "range — slider\n" +
                        "search — search field\n" +
                        "url, tel — validated URL/phone ។");
        sn(l14_1, "HTML5 Input Types", """
                        <input type="date">
                        <input type="time">
                        <input type="month">
                        <input type="color">
                        <input type="range"  min="0" max="100" step="5">
                        <input type="search" placeholder="ស្វែងរក...">
                        <input type="url"    placeholder="https://...">
                        <input type="tel"    placeholder="+855...">
                        
                        <!-- Date range example -->
                        <label>ថ្ងៃចាប់ផ្ដើម: <input type="date" name="start"></label>
                        <label>ថ្ងៃបញ្ចប់: <input type="date" name="end"></label>""", "html",
                "Browser mobile បង្ហាញ native picker ។ type='color' ផ្ដល់ color picker UI ។", 1);

        Lesson l14_2 = ls(ch14, c, "HTML5 APIs", 2,
                "HTML5 APIs ផ្ដល់មុខងារថ្មី:\n\n" +
                        "localStorage / sessionStorage — store data ក្នុង browser\n" +
                        "Geolocation API — ស្វែងរក GPS location\n" +
                        "Canvas API — draw graphics with JS\n" +
                        "Web Workers — run JS ក្នុង background thread");
        sn(l14_2, "Local Storage & Geolocation", """
                        <script>
                            // ── Local Storage ─────────────────────────────────────
                            // Save
                            localStorage.setItem("username", "sokha");
                            localStorage.setItem("theme", "dark");
                        
                            // Read
                            const user = localStorage.getItem("username"); // "sokha"
                        
                            // Delete
                            localStorage.removeItem("theme");
                        
                            // Clear all
                            localStorage.clear();
                        
                            // ── Geolocation ───────────────────────────────────────
                            function getLocation() {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        function(pos) {
                                            console.log("Lat:", pos.coords.latitude);
                                            console.log("Lng:", pos.coords.longitude);
                                        },
                                        function(err) {
                                            console.log("Error:", err.message);
                                        }
                                    );
                                } else {
                                    alert("Browser មិនគាំទ្រ Geolocation");
                                }
                            }
                        </script>
                        
                        <button onclick="getLocation()">រកទីតាំង</button>""", "html",
                "localStorage = អចិន្ត្រៃយ៍ (stay after close) ។ sessionStorage = តែ tab ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 15 — Responsive Design
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch15 = ch(c, "Responsive Design", 15);

        Lesson l15_1 = ls(ch15, c, "Viewport Meta Tag", 1,
                "Responsive design ធ្វើអោយ website ល្អ នៅ devices ទំហំផ្សេងៗ ។\n\n" +
                        "viewport meta tag ជាចំណុចសំខាន់ដំបូង ។\n\n" +
                        "width=device-width — ប្រើ screen width ពិតប្រាកដ\n" +
                        "initial-scale=1.0 — zoom level ដំបូង = 1x");
        sn(l15_1, "Viewport Meta Tag", """
                        <!-- ✅ Viewport meta tag: ចំបាច់ណាស់សម្រាប់ mobile -->
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        
                        <!-- Responsive image pattern -->
                        <style>
                            img { max-width: 100%; height: auto; }
                            body { margin: 0; padding: 16px; font-family: Arial, sans-serif; }
                        </style>
                        
                        <img src="banner.jpg" alt="Banner">
                        <h1>ទំព័រ Responsive</h1>""", "html",
                "Viewport tag ត្រូវតែមានក្នុង <head> ។ img max-width:100% = responsive image ។", 1);

        Lesson l15_2 = ls(ch15, c, "CSS Media Queries", 2,
                "Media queries ដំណោះស្រាយ CSS ខុសៗគ្នា ទៅតាម screen size ។\n\n" +
                        "Mobile-first: CSS ដំបូងសម្រាប់ mobile, @media min-width = desktop ។\n\n" +
                        "Breakpoints ទូទៅ:\n" +
                        "• ≤ 480px — Mobile small\n" +
                        "• ≤ 768px — Tablet\n" +
                        "• ≥ 1024px — Desktop");
        sn(l15_2, "Media Queries", """
                        <style>
                            /* ── Mobile first (default) ─────────────── */
                            body {
                                font-size: 16px;
                                padding: 10px;
                            }
                        
                            .container {
                                display: flex;
                                flex-direction: column; /* stack vertically */
                                gap: 16px;
                            }
                        
                            /* ── Tablet (≥ 768px) ───────────────────── */
                            @media (min-width: 768px) {
                                .container {
                                    flex-direction: row; /* side by side */
                                }
                                body {
                                    font-size: 18px;
                                    padding: 20px;
                                }
                            }
                        
                            /* ── Desktop (≥ 1024px) ─────────────────── */
                            @media (min-width: 1024px) {
                                .container {
                                    max-width: 1200px;
                                    margin: 0 auto;
                                }
                                body {
                                    background-color: #f5f5f5;
                                }
                            }
                        
                            /* ── Print ──────────────────────────────── */
                            @media print {
                                nav, footer { display: none; }
                                body { font-size: 12pt; }
                            }
                        </style>
                        
                        <div class="container">
                            <main><h1>ខ្លឹមសារ</h1></main>
                            <aside><h2>Sidebar</h2></aside>
                        </div>""", "html",
                "Mobile-first approach ល្អជាង desktop-first ។ @media print ល្អ hide navigation ពេលបោះពុម្ព ។", 1);

        Lesson l15_3 = ls(ch15, c, "Form Submission — GET vs POST", 3,
                "GET vs POST ជាវិធីសាស្រ្តបញ្ជូន form data:\n\n" +
                        "GET:\n" +
                        "• ទិន្នន័យបង្ហាញក្នុង URL\n" +
                        "• ល្អសម្រាប់ search, filter\n" +
                        "• Bookmarkable\n\n" +
                        "POST:\n" +
                        "• ទិន្នន័យនៅ request body\n" +
                        "• ល្អសម្រាប់ login, register, sensitive data\n" +
                        "• Security ខ្ពស់ជាង");
        sn(l15_3, "GET vs POST", """
                        <!-- GET: data visible in URL -->
                        <!-- URL becomes: /search?query=HTML&category=beginner -->
                        <form method="get" action="/search">
                            <input type="text" name="query" placeholder="ស្វែងរក...">
                            <select name="category">
                                <option value="beginner">ចាប់ផ្ដើម</option>
                                <option value="advanced">ខ្ពស់</option>
                            </select>
                            <button type="submit">ស្វែងរក</button>
                        </form>
                        
                        <!-- POST: data in request body (secure) -->
                        <form method="post" action="/login">
                            <input type="email"    name="email"    placeholder="Email" required>
                            <input type="password" name="password" placeholder="ពាក្យសម្ងាត់" required>
                            <button type="submit">ចូល</button>
                        </form>""", "html",
                "GET = search/filter (bookmarkable) ។ POST = login/register/payment (secure) ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. CSS
    private void seedCSS(User ins, Category cat) {
        Course c = course("CSS Styling ជាភាសាខ្មែរ (Full Course)", "css-styling-khmer",
                "រៀន CSS ពីមូលដ្ឋានដល់កម្រិតខ្ពស់ផ្អែកលើ CodeKhmerLearning ។ " +
                        "រួមមាន Selectors, Box Model, Flexbox, Grid, Responsive និង Animations។",
                "BEGINNER_TO_ADVANCED", true, ins, cat);

        // Ch1: CSS Syntax and Selectors
        Chapter ch1 = ch(c, "1. CSS Syntax and Selectors", 1);
        Lesson l1 = ls(ch1, c, "វាក្យសម្ព័ន្ធ CSS និងប្រភេទ Selector", 1,
                "CSS (Cascading Style Sheets) ត្រូវបានប្រើដើម្បីកំណត់រចនាប័ទ្ទ។\n\n" +
                        "• Element Selector: ហៅឈ្មោះ tag ចំៗ (ឧ. p, h1)\n" +
                        "• Class Selector (.): ប្រើសញ្ញាចុចសម្រាប់ class (ឧ. .highlight)\n" +
                        "• ID Selector (#): ប្រើសញ្ញាទ្រុងជ្រូកសម្រាប់ ID (ឧ. #header)\n" +
                        "• Universal (*): ជ្រើសរើសធាតុទាំងអស់\n" +
                        "• Attribute, Pseudo-class (:hover), Pseudo-element (::first-line)");
        sn(l1, "CSS Selectors", """
                        /* Class Selector */
                        .highlight { background-color: yellow; }
                        
                        /* ID Selector */
                        #header { font-weight: bold; }
                        
                        /* Universal */
                        * { margin: 0; }""", "css",
                "Class selector ត្រូវបានប្រើញឹកញាប់ជាងគេក្នុងការសរសេរកូដជាក់ស្តែង។", 1);

        // Ch2: CSS Colors and Backgrounds
        Chapter ch2 = ch(c, "2. CSS Colors and Backgrounds", 2);
        Lesson l2 = ls(ch2, c, "ពណ៌ និង ផ្ទៃខាងក្រោយ", 1,
                "CSS ផ្តល់ជម្រើសជាច្រើនសម្រាប់កំណត់ពណ៌៖ Hexadecimal (#0000FF), RGB (rgb(255,0,0)), RGBA, HSL, និង HSLA។\n\n" +
                        "សម្រាប់ Background យើងមាន៖ background-color, background-image, background-position, background-repeat (no-repeat), និង background-size (cover)។");
        sn(l2, "Colors & Background", """
                        div {
                            background-color: rgba(0, 0, 255, 0.5); /* ខៀវថ្លាពាក់កណ្តាល */
                            background-image: url('image.jpg');
                            background-size: cover;
                            background-repeat: no-repeat;
                            background-position: center;
                        }""", "css",
                "RGBA និង HSLA អនុញ្ញាតឱ្យយើងកំណត់ភាពថ្លា (opacity/alpha) នៃពណ៌បាន។", 1);

        // Ch3: CSS Box Model
        Chapter ch3 = ch(c, "3. CSS Box Model", 3);
        Lesson l3 = ls(ch3, c, "គំរូប្រអប់ CSS", 1,
                "CSS Box Model មាន 4 ផ្នែកសំខាន់៖\n" +
                        "1. Content (មាតិកា)\n" +
                        "2. Padding (គម្លាតខាងក្នុងជុំវិញមាតិកា)\n" +
                        "3. Border (ស៊ុម)\n" +
                        "4. Margin (គម្លាតខាងក្រៅបំបែកធាតុផ្សេងៗ)\n\n" +
                        "ការប្រើប្រាស់ `box-sizing: border-box` គឺដើម្បីការពារកុំឱ្យ Padding និង Border ធ្វើឱ្យទំហំធាតុរីកធំជាងការកំណត់។");
        sn(l3, "Box Model & Box Sizing", """
                div {
                    width: 200px;
                    padding: 20px;
                    border: 2px solid black;
                    margin: 30px;
                    box-sizing: border-box; /* រក្សាទទឹងត្រឹម 200px ដដែល */
                }""", "css", "box-sizing: border-box គួរតែដាក់ជា Global តាមរយៈ Universal Selector (*)", 1);

        // Ch4: CSS Typography
        Chapter ch4 = ch(c, "4. CSS Typography", 4);
        Lesson l4 = ls(ch4, c, "ការកំណត់អក្សរ CSS", 1,
                "លក្ខណៈសម្បត្តិសម្រាប់អក្សររួមមាន៖\n" +
                        "• font-family: ប្រភេទពុម្ពអក្សរ\n" +
                        "• font-size: ទំហំអក្សរ (px, em, rem)\n" +
                        "• font-weight: ភាពដិត (bold, normal)\n" +
                        "• line-height: គម្លាតបន្ទាត់\n" +
                        "• text-align: ការតម្រឹម (center, left, right)\n" +
                        "• text-transform: បំលែងអក្សរ (uppercase, lowercase)");

        // Ch5: CSS Layouts
        Chapter ch5 = ch(c, "5. CSS Layouts (Display & Positioning)", 5);
        Lesson l5 = ls(ch5, c, "Display Property ទីតាំង និង Z-index", 1,
                "Display កំណត់របៀបបង្ហាញធាតុ៖ block (យកពេញបន្ទាត់), inline (តាមទំហំមាតិកា), inline-block, none (លាក់)។\n\n" +
                        "Positioning គ្រប់គ្រងទីតាំង៖ static (ធម្មតា), relative (ទាក់ទងទីតាំងដើម), absolute (ផ្អែកលើធាតុមេ), fixed (ថេរលើអេក្រង់), sticky។\n" +
                        "Z-index គ្រប់គ្រងលំដាប់ជាន់គ្នា (ធាតុ z-index ធំជាងនឹងនៅពីមុខ)។");

        // Ch6: CSS Lists & Tables
        Chapter ch6 = ch(c, "6. CSS Lists and Tables", 6);
        Lesson l6 = ls(ch6, c, "រចនាប័ទ្ទបញ្ជី និងតារាង", 1,
                "List: list-style-type (disc, square), list-style-image, list-style-position (inside, outside)។\n\n" +
                        "Table: border-collapse: collapse (បញ្ចូលស៊ុមចូលគ្នា), padding សម្រាប់ទំហំកោសិកា, និងការតម្រឹមដោយប្រើ text-align និង vertical-align (middle)។");

        // Ch7: Pseudo-classes & Pseudo-elements
        Chapter ch7 = ch(c, "7. Pseudo-classes & Pseudo-elements", 7);
        Lesson l7 = ls(ch7, c, "ស្ថានភាពពិសេសរបស់ធាតុ", 1,
                "Pseudo-classes (:) ដូចជា :hover (ពេលដាក់ម៉ៅស៍លើ), :active (ពេលកំពុងចុច), :focus, :first-child, :last-child។\n\n" +
                        "Pseudo-elements (::) ដូចជា ::before (បញ្ចូលមាតិកាពីមុខ), ::after, ::first-letter, ::first-line។");

        // Ch8: Transitions & Animations
        Chapter ch8 = ch(c, "8. Transitions and Animations", 8);
        Lesson l8 = ls(ch8, c, "ការផ្លាស់ប្តូរ និងចលនា", 1,
                "Transitions ធ្វើឱ្យការផ្លាស់ប្តូររលូន (transition-property, duration, timing-function, delay)។\n\n" +
                        "Animations បង្កើតចលនាស្មុគស្មាញដោយប្រើ @keyframes ដើម្បីកំណត់ដំណាក់កាលនៃចលនា (0% ទៅ 100%)។");
        sn(l8, "Keyframes Animation", """
                .box { animation: move 2s infinite; }
                
                @keyframes move {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(100px); }
                    100% { transform: translateX(0); }
                }""", "css", "@keyframes កំណត់ជំហាននៃចលនា ចំណែក property `animation` ប្រើសម្រាប់ហៅវាមកអនុវត្ត។", 1);

        // Ch9: Responsive Design
        Chapter ch9 = ch(c, "9. Responsive Design", 9);
        Lesson l9 = ls(ch9, c, "ការរចនាឆ្លើយតប (Responsive)", 1,
                "Media Queries (@media) ផ្លាស់ប្តូរ CSS ទៅតាមទំហំអេក្រង់ (max-width, min-width)។\n\n" +
                        "Mobile-first Design រចនាទូរស័ព្ទមុន រួចប្រើ min-width សម្រាប់អេក្រង់ធំ។\n" +
                        "ប្រើប្រាស់ខ្នាត Responsive ដូចជា vw, vh, em, និង rem ជាជាង px។");
        sn(l9, "Media Query", """
                .box { width: 100%; } /* Mobile First */
                
                @media (min-width: 768px) {
                    .box { width: 50%; } /* Tablet & Desktop */
                }""", "css", "ការរចនាបែប Mobile-first (ប្រើ min-width) ធ្វើឱ្យគេហទំព័រដើរលឿននៅលើទូរស័ព្ទ។", 1);

        // Ch10: CSS Variables & Functions
        Chapter ch10 = ch(c, "10. CSS Variables & Functions", 10);
        Lesson l10 = ls(ch10, c, "អថេរ និង មុខងារ (Functions)", 1,
                "CSS Variables (--name) រក្សាទុកតម្លៃដែលអាចប្រើឡើងវិញបាន។ ប្រើ `var(--name)` ដើម្បីទាញយកមកប្រើ។\n\n" +
                        "Functions សំខាន់ៗ៖\n" +
                        "• calc(): គណនាតម្លៃ (ឧ. calc(100% - 50px))\n" +
                        "• clamp(min, val, max): កំណត់តម្លៃនៅចន្លោះអប្បបរមានិងអតិបរមា។");

        // Ch11: Grid Layout
        Chapter ch11 = ch(c, "11. CSS Grid Layout", 11);
        Lesson l11 = ls(ch11, c, "ប្លង់ក្រឡាចត្រង្គ CSS", 1,
                "Grid គឺជាប្រព័ន្ធប្លង់ 2 វិមាត្រ (ជួរឈរ និងជួរដេក)។\n" +
                        "• display: grid;\n" +
                        "• grid-template-columns: កំណត់ទំហំជួរឈរ (ឧ. 1fr 1fr 1fr)\n" +
                        "• grid-template-rows: កំណត់ទំហំជួរដេក\n" +
                        "• gap (ឬ grid-gap): ចន្លោះរវាងធាតុ។");

        // Ch12: Flexbox Layout
        Chapter ch12 = ch(c, "12. CSS Flexbox Layout", 12);
        Lesson l12 = ls(ch12, c, "ប្លង់ Flexbox", 1,
                "Flexbox គឺជាប្រព័ន្ធ 1 វិមាត្រ។ ប្រើ `display: flex` លើធាតុមេ។\n" +
                        "មានអ័ក្ស២: Main Axis (អ័ក្សគោល) គ្រប់គ្រងដោយ `justify-content` និង Cross Axis (អ័ក្សកាត់) គ្រប់គ្រងដោយ `align-items`។\n" +
                        "• flex-direction: row (ផ្ដេក) ឬ column (បញ្ឈរ)។");
        sn(l12, "Flexbox Center", """
                .container {
                    display: flex;
                    justify-content: center; /* កណ្តាលផ្ដេក */
                    align-items: center;     /* កណ្តាលបញ្ឈរ */
                    height: 100vh;
                }""", "css", "Flexbox ងាយស្រួលបំផុតសម្រាប់ការដាក់ធាតុនៅចំកណ្តាលអេក្រង់។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. JAVASCRIPT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedJavaScript(User ins, Category cat) {
        Course c = course("JavaScript ជាភាសាខ្មែរ", "javascript-khmer",
                "រៀន JavaScript ពីមូលដ្ឋានរហូតដល់ ES6+, DOM, Fetch API ជាភាសាខ្មែរ ។",
                "BEGINNER", true, ins, cat);

        Chapter ch1 = ch(c, "ការណែនាំ & Variables", 1);
        Lesson l1 = ls(ch1, c, "JavaScript គឺជាអ្វី?", 1,
                "JavaScript ជា programming language ដែលដំណើរការ browser ។ JS ធ្វើឱ្យ HTML interactive ។\n\n" +
                        "JS ប្រើក្នុង Frontend (browser), Backend (Node.js), Mobile (React Native) ។\n\n" +
                        "Dynamic typing: variable type កំណត់ automatically ។");
        sn(l1, "Hello World", """
                        // console.log - print output
                        console.log("សួស្តី ពិភពលោក!");
                        console.log(42);
                        console.log(true);
                        console.log([1, 2, 3]);
                        
                        // comment
                        // single line comment
                        /* multi
                           line comment */
                        
                        // typeof - check data type
                        console.log(typeof "Hello");  // string
                        console.log(typeof 42);       // number
                        console.log(typeof true);     // boolean
                        console.log(typeof undefined);// undefined
                        console.log(typeof null);     // object (JS quirk)""", "javascript",
                "console.log() ជាវិធីងាយបំផុតក្នុងការ debug ។ F12 ក្នុង browser បើក DevTools ។", 1);

        Lesson l2 = ls(ch1, c, "Variables & Data Types", 2,
                "const: value ថេរ (recommended) ។ let: value ប្ដូរបាន ។ var: function-scoped (avoid) ។\n\n" +
                        "JS Data Types: String, Number, Boolean, Null, Undefined, Object, Array ។");
        sn(l2, "Variables & Types", """
                        // ✅ const - value មិនប្ដូរ
                        const PI = 3.14159;
                        const siteName = "Code Khmer Learning";
                        const year = 2026;
                        
                        // ✅ let - value ប្ដូរបាន
                        let studentName = "ដារ៉ា";
                        let score = 85;
                        score = 90; // OK
                        
                        // String
                        const greeting = "សួស្តី";
                        const message  = `ឈ្មោះ: ${studentName}, ពិន្ទុ: ${score}`; // template literal
                        console.log(message);
                        
                        // Number
                        const price  = 9.99;
                        const total  = Math.round(price * 100) / 100;
                        const random = Math.random(); // 0–1
                        
                        // Boolean
                        const isLoggedIn = true;
                        const isEmpty    = false;
                        
                        // Null & Undefined
                        let user = null;        // intentionally empty
                        let token;              // undefined - not yet assigned
                        
                        // Array
                        const courses = ["HTML", "CSS", "JavaScript", "React"];
                        console.log(courses[0]);     // HTML
                        console.log(courses.length); // 4
                        
                        // Object
                        const student = {
                            name: "ដារ៉ា",
                            age: 22,
                            skills: ["HTML", "CSS"],
                            address: { city: "ភ្នំពេញ", country: "កម្ពុជា" }
                        };
                        console.log(student.name);          // ដារ៉ា
                        console.log(student.address.city);  // ភ្នំពេញ""", "javascript",
                "ប្រើ const ជានិច្ចកាល ។ Template literals (backtick) ជំនួស string concatenation (+) ។", 1);

        Chapter ch2 = ch(c, "Control Flow & Functions", 2);
        Lesson l3 = ls(ch2, c, "if/else, switch & Loops", 1,
                "if/else: execute code តាម condition ។ switch: check ច្រើន cases ។\n\n" +
                        "for loop, while loop, forEach, for...of ។");
        sn(l3, "Control Flow", """
                        // if / else if / else
                        const score = 87;
                        if (score >= 90)      console.log("A - ឆ្នើម");
                        else if (score >= 80) console.log("B - ល្អ");
                        else if (score >= 70) console.log("C - មធ្យម");
                        else                  console.log("F - ធ្លាក់");
                        
                        // Ternary operator
                        const status = score >= 50 ? "✅ បាន" : "❌ ធ្លាក់";
                        
                        // switch
                        const day = new Date().getDay();
                        switch (day) {
                            case 0: console.log("ថ្ងៃអាទិត្យ"); break;
                            case 1: console.log("ថ្ងៃច័ន្ទ");   break;
                            case 6: console.log("ថ្ងៃសៅរ៍");    break;
                            default: console.log("ថ្ងៃធ្វើការ");
                        }
                        
                        // for loop
                        for (let i = 1; i <= 5; i++) console.log(`ជំហានទី ${i}`);
                        
                        // forEach
                        ["HTML","CSS","JS"].forEach((lang, i) => console.log(`${i+1}. ${lang}`));
                        
                        // for...of (recommended for arrays)
                        const skills = ["HTML", "CSS", "JS", "React"];
                        for (const skill of skills) {
                            console.log(`📚 ${skill}`);
                        }""", "javascript",
                "forEach ជំនួស for loop ។ for...of ច្បាស់ ។ ternary ខ្លី ។ === ប្រើ strict equality ។", 1);

        Lesson l4 = ls(ch2, c, "Functions & Arrow Functions", 2,
                "Function ជា reusable block of code ។\n\n" +
                        "Arrow function (=>) ខ្លី clean ។ Default parameters ។ Rest parameters (…) ។");
        sn(l4, "Functions", """
                        // Function Declaration
                        function greet(name) {
                            return `សួស្តី ${name}!`;
                        }
                        
                        // Arrow Function ✅
                        const add     = (a, b) => a + b;
                        const square  = n => n * n;           // ១ parameter គ្មាន ()
                        const sayHi   = () => "Hello!";       // គ្មាន parameter
                        
                        // Default parameters
                        const welcome = (name = "Guest", lang = "km") =>
                            `Welcome ${name} [${lang}]`;
                        console.log(welcome());           // Welcome Guest [km]
                        console.log(welcome("ដារ៉ា", "en")); // Welcome ដារ៉ា [en]
                        
                        // Rest parameters
                        const sum = (...nums) => nums.reduce((acc, n) => acc + n, 0);
                        console.log(sum(1, 2, 3, 4, 5)); // 15
                        
                        // Destructuring in parameters
                        const showCourse = ({ title, level, isFree }) =>
                            `${title} [${level}] ${isFree ? "FREE" : "PAID"}`;
                        
                        console.log(showCourse({
                            title: "React.js",
                            level: "INTERMEDIATE",
                            isFree: true
                        }));""", "javascript",
                "Arrow functions ប្រើ this ពី outer scope ។ Destructuring params ធ្វើ code clean ។", 1);

        Chapter ch3 = ch(c, "Arrays, Objects & ES6+", 3);
        Lesson l5 = ls(ch3, c, "Array Methods", 1,
                "map(), filter(), reduce(), find(), some(), every(), includes() ។\n\n" +
                        "Spread operator (...) copy/merge arrays ។\n\n" +
                        "Array destructuring ។");
        sn(l5, "Array Methods", """
                        const courses = [
                            { id: 1, title: "HTML",       level: "BEGINNER", isFree: true  },
                            { id: 2, title: "CSS",         level: "BEGINNER", isFree: true  },
                            { id: 3, title: "JavaScript",  level: "BEGINNER", isFree: false },
                            { id: 4, title: "React.js",    level: "INTERMEDIATE", isFree: false },
                            { id: 5, title: "Spring Boot", level: "INTERMEDIATE", isFree: false },
                        ];
                        
                        // map - transform
                        const titles = courses.map(c => c.title);
                        console.log(titles); // ["HTML","CSS","JavaScript",...]
                        
                        // filter - select
                        const freeCourses      = courses.filter(c => c.isFree);
                        const beginnerCourses  = courses.filter(c => c.level === "BEGINNER");
                        
                        // find - first match
                        const reactCourse = courses.find(c => c.title === "React.js");
                        console.log(reactCourse?.title); // React.js
                        
                        // some / every
                        const hasFreeCourse = courses.some(c => c.isFree);  // true
                        const allFree       = courses.every(c => c.isFree); // false
                        
                        // reduce - count free courses
                        const freeCount = courses.reduce((acc, c) => acc + (c.isFree ? 1 : 0), 0);
                        
                        // Spread
                        const moreCourses = [...courses, { id: 6, title: "Next.js" }];
                        
                        // Destructuring
                        const [first, second, ...rest] = courses;
                        console.log(first.title);  // HTML
                        console.log(rest.length);  // 3""", "javascript",
                "Optional chaining (?.) ការពារ error នៅពេល object undefined ។ Spread (...) copy array ។", 1);

        Lesson l6 = ls(ch3, c, "Objects & Destructuring", 2,
                "Object destructuring ។ Spread object ។ Optional chaining (?.) ។\n\n" +
                        "Nullish coalescing (??) ។ Dynamic keys ។");
        sn(l6, "Objects ES6+", """
                        const student = {
                            name: "ដារ៉ា",
                            age: 22,
                            skills: ["HTML", "CSS"],
                            address: { city: "ភ្នំពេញ", country: "កម្ពុជា" },
                            score: null
                        };
                        
                        // Destructuring
                        const { name, age, skills, address: { city } } = student;
                        console.log(name, city); // ដារ៉ា ភ្នំពេញ
                        
                        // Rename & default
                        const { name: studentName, phone = "N/A" } = student;
                        console.log(phone); // N/A
                        
                        // Spread - copy/merge
                        const updated = { ...student, age: 23, school: "RUPP" };
                        
                        // Optional chaining (?.)
                        console.log(student?.address?.city);   // ភ្នំពេញ
                        console.log(student?.phone?.number);   // undefined (no error)
                        
                        // Nullish coalescing (??)
                        console.log(student.score ?? "N/A");   // N/A (score is null)
                        console.log(student.age   ?? "N/A");   // 22  (age is 22)
                        
                        // Dynamic keys
                        const field = "name";
                        console.log(student[field]); // ដារ៉ា""", "javascript",
                "?? ខុស || ។ ?? ពិនិត្យ null/undefined ។ || ពិនិត្យ falsy (0, '', false) ។", 1);

        Chapter ch4 = ch(c, "DOM & Events", 4);
        Lesson l7 = ls(ch4, c, "DOM Manipulation", 1,
                "DOM (Document Object Model) ជា API ដែល JS ប្រើ access/modify HTML ។\n\n" +
                        "querySelector, textContent, innerHTML, classList, createElement ។");
        sn(l7, "DOM Manipulation", """
                        // Select elements
                        const title   = document.querySelector("h1");
                        const cards   = document.querySelectorAll(".card");
                        const sidebar = document.getElementById("sidebar");
                        
                        // Read / Write content
                        console.log(title.textContent);          // read
                        title.textContent = "ចំណងជើងថ្មី";      // write (safe)
                        title.innerHTML   = "<span>ថ្មី</span>"; // write (HTML)
                        
                        // CSS classes
                        title.classList.add("active");
                        title.classList.remove("hidden");
                        title.classList.toggle("dark");
                        console.log(title.classList.contains("active")); // true
                        
                        // Inline styles
                        title.style.color = "#3b82f6";
                        title.style.display = "none";
                        
                        // Attributes
                        const img = document.querySelector("img");
                        img.setAttribute("src", "new-image.jpg");
                        img.getAttribute("alt");
                        
                        // Create element
                        const card = document.createElement("div");
                        card.className = "card";
                        card.textContent = "Card ថ្មី";
                        document.body.appendChild(card);
                        
                        // Remove element
                        card.remove();""", "javascript",
                "textContent ស្ងាំជាង innerHTML ។ innerHTML អាចបង្ក XSS attack ។", 1);

        Chapter ch5 = ch(c, "Async JavaScript & Fetch API", 5);
        Lesson l8 = ls(ch5, c, "Fetch API & async/await", 1,
                "Fetch API ប្រើ HTTP requests ពី browser ។\n\n" +
                        "async/await ធ្វើ asynchronous code ងាយ ។ Promise-based ។\n\n" +
                        "try/catch handle errors ។");
        sn(l8, "Fetch API ជាមួយ async/await", """
                        const API = "http://localhost:8080/api/v1";
                        
                        // GET - fetch courses
                        async function getCourses() {
                            try {
                                const res  = await fetch(`${API}/courses`);
                                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                const json = await res.json();
                                return json.data.content; // your ApiResponse shape
                            } catch (err) {
                                console.error("❌ getCourses:", err.message);
                                return [];
                            }
                        }
                        
                        // GET - course by slug
                        async function getCourseBySlug(slug) {
                            const res  = await fetch(`${API}/courses/slug/${slug}/full`);
                            const json = await res.json();
                            return json.data;
                        }
                        
                        // POST - with auth token
                        async function createCourse(data, token) {
                            const res = await fetch(`${API}/courses`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify(data)
                            });
                            if (!res.ok) throw new Error(`Failed: ${res.status}`);
                            return res.json();
                        }
                        
                        // Run
                        getCourses().then(courses => console.log(courses));""", "javascript",
                "Always use try/catch ។ Check res.ok before parsing ។ Async function returns Promise ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. REACT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedReact(User ins, Category cat) {
        Course c = course("React.js ជាភាសាខ្មែរ", "reactjs-khmer",
                "រៀន React.js 18+: Components, Hooks, Router, State Management, " +
                        "API Calls, Performance, Firebase, Testing និង Deployment ជាភាសាខ្មែរ ។",
                "INTERMEDIATE", true, ins, cat);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 1 — React Introduction
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch1 = ch(c, "React Introduction", 1);

        Lesson l1_1 = ls(ch1, c, "React គឺជាអ្វី?", 1,
                "React ជា JavaScript library (មិនមែន framework) ដែលបង្កើតដោយ Meta (Facebook) " +
                        "ឆ្នាំ 2013 សម្រាប់ build UI នៅ Single Page Applications (SPA) ។\n\n" +
                        "✅ Reusable Components — UI ចែកជា components តូចៗ ប្រើឡើងវិញបាន\n" +
                        "✅ Virtual DOM — compare virtual DOM → update DOM ដែល changed ប៉ុណ្ណោះ\n" +
                        "✅ Declarative — ប្រាប់ React ថា UI គួរមើលដូចអ្វី ជំនួសការប្រាប់ steps\n" +
                        "✅ Strong Community — ecosystem ធំ, packages ច្រើន");
        sn(l1_1, "React App ដំបូង", """
                        // App.js
                        import React from 'react';
                        
                        function App() {
                            return (
                                <div>
                                    <h1>Hello, React!</h1>
                                    <p>វគ្គ React.js ជាភាសាខ្មែរ</p>
                                </div>
                            );
                        }
                        
                        export default App;""", "jsx",
                "React components ជា function ដែល return JSX ។ export default = ជា default export ។", 1);

        Lesson l1_2 = ls(ch1, c, "Setup React ជាមួយ Vite & CRA", 2,
                "វិធី ២ ក្នុងការ create React app:\n\n" +
                        "Vite — លឿន, modern, recommended\n" +
                        "CRA (Create React App) — classic, slower\n\n" +
                        "Prerequisites: Node.js (node -v ≥ 18)");
        sn(l1_2, "Setup ជាមួយ Vite (Recommended)", """
                        # Check Node.js version
                        node -v
                        
                        # Create React app ជាមួយ Vite (faster)
                        npm create vite@latest my-react-app -- --template react
                        cd my-react-app
                        npm install
                        npm run dev   # http://localhost:5173""", "bash",
                "Vite លឿនជាង CRA ។ --template react ជ្រើស React template ។", 1);
        sn(l1_2, "Setup ជាមួយ CRA", """
                        # Create React app ជាមួយ CRA
                        npx create-react-app my-react-app
                        cd my-react-app
                        npm start     # http://localhost:3000""", "bash",
                "CRA ប្រើ Webpack ។ Vite ប្រើ ESBuild → លឿនជាង ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 2 — React Basics
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch2 = ch(c, "React Basics — JSX, State, Events", 2);

        Lesson l2_1 = ls(ch2, c, "JSX (JavaScript XML)", 1,
                "JSX ជាការ mix រវាង JavaScript និង HTML ។\n\n" +
                        "Rules:\n" +
                        "• ត្រូវមាន single root element (ឬ Fragment <>)\n" +
                        "• className ជំនួស class\n" +
                        "• camelCase attributes (onClick, onChange)\n" +
                        "• {} សម្រាប់ JS expressions\n" +
                        "• Self-closing tags: <br />, <img />\n\n" +
                        "JSX ត្រូវ compile ទៅ JS ដោយ Babel ។");
        sn(l2_1, "JSX Syntax", """
                        // JSX expression
                        const element = <h1>Hello, JSX!</h1>;
                        
                        // JS inside JSX
                        const name = "Code Khmer";
                        const title = <h1>Welcome to {name}!</h1>;
                        
                        // Conditional rendering
                        const isLoggedIn = true;
                        return (
                            <div>
                                {isLoggedIn ? <p>ចូលហើយ</p> : <p>មិនទាន់ចូល</p>}
                                {isLoggedIn && <button>Logout</button>}
                            </div>
                        );""", "jsx",
                "JSX compile ទៅ React.createElement() ។ {} ប្រើ JS expression (មិនមែន statement) ។", 1);

        Lesson l2_2 = ls(ch2, c, "State & Lifecycle (Class vs Function)", 2,
                "State ជា data ផ្ទាល់ខ្លួនរបស់ component ដែលអាចផ្លាស់ប្ដូរ ។\n\n" +
                        "Class Component:\n" +
                        "• this.state = {} in constructor\n" +
                        "• this.setState() to update\n" +
                        "• Lifecycle: componentDidMount, componentWillUnmount\n\n" +
                        "Function Component (modern):\n" +
                        "• useState() Hook\n" +
                        "• useEffect() Hook ជំនួស lifecycle");
        sn(l2_2, "Class Component — State & Lifecycle", """
                        import React from 'react';
                        
                        class Clock extends React.Component {
                            constructor(props) {
                                super(props);
                                this.state = { date: new Date() };
                            }
                        
                            componentDidMount() {
                                // Run after component mounts
                                this.timerID = setInterval(() => this.tick(), 1000);
                            }
                        
                            componentWillUnmount() {
                                // Cleanup before unmount
                                clearInterval(this.timerID);
                            }
                        
                            tick() {
                                this.setState({ date: new Date() });
                            }
                        
                            render() {
                                return <h1>It is {this.state.date.toLocaleTimeString()}.</h1>;
                            }
                        }""", "jsx",
                "Class components ប្រើ this.state ។ componentDidMount = mount ។ componentWillUnmount = cleanup ។", 1);

        Lesson l2_3 = ls(ch2, c, "Handling Events", 3,
                "React events ប្រើ camelCase: onClick, onChange, onSubmit ។\n\n" +
                        "event.preventDefault() ប្រើ prevent form submit reload ។\n\n" +
                        "Arrow functions ក្នុង JSX អាចបង្ករ performance issue ។");
        sn(l2_3, "Event Handling", """
                        function EventDemo() {
                            function handleClick() {
                                alert('Button clicked!');
                            }
                        
                            function handleChange(event) {
                                console.log('Input value:', event.target.value);
                            }
                        
                            function handleSubmit(event) {
                                event.preventDefault(); // prevent page reload
                                alert('Form submitted!');
                            }
                        
                            return (
                                <div>
                                    {/* Click event */}
                                    <button onClick={handleClick}>Click Me</button>
                        
                                    {/* Change event */}
                                    <input onChange={handleChange} placeholder="វាយអ្វីមួយ..." />
                        
                                    {/* Form submit */}
                                    <form onSubmit={handleSubmit}>
                                        <button type="submit">Submit</button>
                                    </form>
                        
                                    {/* Inline arrow function */}
                                    <button onClick={() => alert('Inline!')}>Inline Handler</button>
                                </div>
                            );
                        }""", "jsx",
                "onClick={handleClick} មិន () ។ onClick={() => fn()} ប្រើពេល pass arguments ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 3 — React Components
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch3 = ch(c, "React Components & Props", 3);

        Lesson l3_1 = ls(ch3, c, "Functional vs Class Components", 1,
                "Functional Components — modern, simple, ប្រើ Hooks ។\n" +
                        "Class Components — legacy, ប្រើ this.state, lifecycle methods ។\n\n" +
                        "React 16.8+ ណែនាំ Hooks → ប្រើ Functional Components ជានិច្ច ។");
        sn(l3_1, "Function Component vs Class Component", """
                        // ✅ Functional Component (modern - recommended)
                        function Welcome({ name }) {
                            return <h1>Hello, {name}!</h1>;
                        }
                        
                        // Class Component (legacy)
                        class WelcomeClass extends React.Component {
                            render() {
                                return <h1>Hello, {this.props.name}!</h1>;
                            }
                        }
                        
                        // Usage
                        function App() {
                            return (
                                <div>
                                    <Welcome name="Alice" />
                                    <WelcomeClass name="Bob" />
                                </div>
                            );
                        }""", "jsx",
                "Functional Component ល្អជាង ។ Class Component ប្រើតែ legacy code ។", 1);

        Lesson l3_2 = ls(ch3, c, "Props — Passing Data", 2,
                "Props ជា data បញ្ជូនពី parent → child (read-only) ។\n\n" +
                        "• Destructure props ក្នុង function params\n" +
                        "• Default values: prop = defaultValue\n" +
                        "• children prop — nested JSX\n" +
                        "• Callback props — pass functions");
        sn(l3_2, "Props Examples", """
                        // Child: Destructure + default props
                        function CourseCard({ title, level = "BEGINNER", isFree, onEnroll }) {
                            return (
                                <div className="course-card">
                                    <h3>{title}</h3>
                                    <span className={`badge badge-${level.toLowerCase()}`}>
                                        {level}
                                    </span>
                                    {isFree && <span className="badge-free">FREE</span>}
                                    <button onClick={onEnroll}>ចុះឈ្មោះ</button>
                                </div>
                            );
                        }
                        
                        // Parent
                        function App() {
                            return (
                                <CourseCard
                                    title="HTML សម្រាប់អ្នកចាប់ផ្ដើម"
                                    level="BEGINNER"
                                    isFree={true}
                                    onEnroll={() => alert("Enrolled!")}
                                />
                            );
                        }""", "jsx",
                "Destructure props in params ។ {} pass dynamic values ។ Props are read-only ។", 1);
        sn(l3_2, "children Prop", """
                        // Card component with children
                        function Card({ title, children }) {
                            return (
                                <div className="card">
                                    <h2>{title}</h2>
                                    <div className="card-body">
                                        {children}
                                    </div>
                                </div>
                            );
                        }
                        
                        // Usage — nested JSX becomes children
                        function App() {
                            return (
                                <Card title="HTML Course">
                                    <p>រៀន HTML ពីដំបូង...</p>
                                    <button>ចូលរៀន</button>
                                </Card>
                            );
                        }""", "jsx",
                "children prop ប្រើ wrap content ។ ល្អសម្រាប់ layout components ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 4 — React Hooks
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch4 = ch(c, "React Hooks", 4);

        Lesson l4_1 = ls(ch4, c, "useState Hook", 1,
                "useState ផ្ដល់ state ទៅ function component ។\n\n" +
                        "State change → component re-renders → UI updates ។\n\n" +
                        "Rules:\n" +
                        "• ប្រើតែ top level (not inside if/loop)\n" +
                        "• Functional update: setCount(prev => prev + 1)\n" +
                        "• Object state: spread {...state, key: value}");
        sn(l4_1, "useState Basic", """
                        import { useState } from 'react';
                        
                        function Counter() {
                            const [count, setCount] = useState(0);
                        
                            return (
                                <div>
                                    <p>You clicked {count} times</p>
                                    <button onClick={() => setCount(count + 1)}>+1</button>
                                    <button onClick={() => setCount(prev => prev - 1)}>-1</button>
                                    <button onClick={() => setCount(0)}>Reset</button>
                                </div>
                            );
                        }""", "jsx",
                "Functional update setCount(prev => prev + 1) ។ State update is async ។", 1);
        sn(l4_1, "useState — Real App Example", """
                        import { useState } from "react";
                        
                        function CourseSearch() {
                            const [keyword, setKeyword] = useState("");
                            const [courses, setCourses]  = useState([]);
                            const [loading, setLoading]  = useState(false);
                        
                            const handleSearch = async () => {
                                if (!keyword.trim()) return;
                                setLoading(true);
                                const res  = await fetch(`/api/v1/courses?keyword=${keyword}`);
                                const data = await res.json();
                                setCourses(data.data.content);
                                setLoading(false);
                            };
                        
                            return (
                                <div>
                                    <input
                                        value={keyword}
                                        onChange={e => setKeyword(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                                        placeholder="ស្វែងរកវគ្គ..."
                                    />
                                    <button onClick={handleSearch} disabled={loading}>
                                        {loading ? "កំពុងស្វែងរក..." : "ស្វែងរក"}
                                    </button>
                                    <ul>
                                        {courses.map(c => <li key={c.id}>{c.title}</li>)}
                                    </ul>
                                </div>
                            );
                        }""", "jsx",
                "multiple useState ។ disabled={loading} ប្រើ prevent double click ។", 2);

        Lesson l4_2 = ls(ch4, c, "useEffect Hook", 2,
                "useEffect: run side effects (fetch, subscriptions, DOM manipulation) ។\n\n" +
                        "Dependency array:\n" +
                        "• [] = run once on mount\n" +
                        "• [dep1, dep2] = run when deps change\n" +
                        "• (no array) = run every render\n\n" +
                        "Cleanup function — prevent memory leak ។");
        sn(l4_2, "useEffect — Timer", """
                        import { useState, useEffect } from 'react';
                        
                        function Timer() {
                            const [seconds, setSeconds] = useState(0);
                        
                            useEffect(() => {
                                const interval = setInterval(() => {
                                    setSeconds(prev => prev + 1); // functional update
                                }, 1000);
                        
                                // Cleanup: clear interval on unmount
                                return () => clearInterval(interval);
                            }, []); // [] = run only once on mount
                        
                            return <p>Seconds: {seconds}</p>;
                        }""", "jsx",
                "cleanup function return ។ setSeconds(prev => prev + 1) = safe functional update ។", 1);
        sn(l4_2, "useEffect — Fetch Data", """
                        import { useState, useEffect } from "react";
                        
                        function CourseDetailPage({ slug }) {
                            const [course,  setCourse]  = useState(null);
                            const [loading, setLoading] = useState(true);
                            const [error,   setError]   = useState(null);
                        
                            useEffect(() => {
                                let cancelled = false; // cleanup flag
                        
                                async function load() {
                                    try {
                                        const res  = await fetch(`/api/v1/courses/slug/${slug}/full`);
                                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                        const json = await res.json();
                                        if (!cancelled) setCourse(json.data);
                                    } catch (e) {
                                        if (!cancelled) setError(e.message);
                                    } finally {
                                        if (!cancelled) setLoading(false);
                                    }
                                }
                                load();
                        
                                return () => { cancelled = true; }; // prevent setState after unmount
                            }, [slug]); // re-run when slug changes
                        
                            if (loading) return <div>កំពុងផ្ទុក...</div>;
                            if (error)   return <div>Error: {error}</div>;
                            if (!course) return null;
                        
                            return (
                                <div>
                                    <h1>{course.title}</h1>
                                    <p>{course.description}</p>
                                </div>
                            );
                        }""", "jsx",
                "cancelled flag ការពារ setState after unmount ។ [slug] = re-fetch ពេល slug ផ្លាស់ប្ដូរ ។", 2);

        Lesson l4_3 = ls(ch4, c, "useContext Hook", 3,
                "useContext ប្រើ consume Context ក្នុង functional components ។\n\n" +
                        "ប្រើ share data (theme, user, language) ដោយមិនបញ្ជូន props ។\n\n" +
                        "Steps:\n" +
                        "1. createContext(defaultValue)\n" +
                        "2. Context.Provider value={}\n" +
                        "3. useContext(Context) ក្នុង consumer");
        sn(l4_3, "useContext — Theme Example", """
                        import React, { createContext, useContext, useState } from 'react';
                        
                        // 1. Create Context
                        const ThemeContext = createContext('light');
                        
                        // 2. Provider wraps the app
                        function App() {
                            const [theme, setTheme] = useState('light');
                        
                            return (
                                <ThemeContext.Provider value={theme}>
                                    <ThemedButton />
                                    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
                                        Toggle Theme
                                    </button>
                                </ThemeContext.Provider>
                            );
                        }
                        
                        // 3. Consumer uses useContext
                        function ThemedButton() {
                            const theme = useContext(ThemeContext);
                            const style = {
                                background: theme === 'dark' ? '#333' : '#fff',
                                color:      theme === 'dark' ? '#fff' : '#333',
                                padding: '8px 16px',
                            };
                            return <button style={style}>Theme: {theme}</button>;
                        }""", "jsx",
                "Context ល្អសម្រាប់ theme, auth, language ។ ប្រើ useReducer + Context ជំនួស Redux ។", 1);

        Lesson l4_4 = ls(ch4, c, "useRef Hook", 4,
                "useRef ប្រើ ២ cases:\n\n" +
                        "1. DOM reference — focus, scroll, measure elements\n" +
                        "2. Mutable value — store value ដែលមិន trigger re-render\n\n" +
                        "ref.current ផ្ទុក value ។ Change ref.current មិន re-render ។");
        sn(l4_4, "useRef Examples", """
                        import { useRef, useState } from 'react';
                        
                        function TextInput() {
                            const inputRef = useRef(null);
                        
                            const focusInput = () => {
                                inputRef.current.focus(); // DOM access
                            };
                        
                            const clearInput = () => {
                                inputRef.current.value = ''; // direct DOM manipulation
                            };
                        
                            return (
                                <div>
                                    <input ref={inputRef} type="text" placeholder="ឈ្មោះ..." />
                                    <button onClick={focusInput}>Focus</button>
                                    <button onClick={clearInput}>Clear</button>
                                </div>
                            );
                        }
                        
                        // useRef as mutable value (no re-render)
                        function RenderCounter() {
                            const [count, setCount] = useState(0);
                            const renderCount = useRef(0);
                        
                            renderCount.current += 1; // updates silently
                        
                            return (
                                <div>
                                    <p>Count: {count}</p>
                                    <p>Renders: {renderCount.current}</p>
                                    <button onClick={() => setCount(c => c + 1)}>Increment</button>
                                </div>
                            );
                        }""", "jsx",
                "ref.current ផ្ទាល់ DOM element ។ Change ref.current មិន cause re-render ។", 1);

        Lesson l4_5 = ls(ch4, c, "Custom Hooks", 5,
                "Custom Hook = function ដែលចាប់ផ្ដើម 'use' ។\n\n" +
                        "ជួយ extract & reuse logic រវាង components ។\n" +
                        "avoid duplicate code ។");
        sn(l4_5, "useFetch Custom Hook", """
                        import { useState, useEffect } from 'react';
                        
                        // Custom Hook
                        export function useFetch(url) {
                            const [data,    setData]    = useState(null);
                            const [loading, setLoading] = useState(true);
                            const [error,   setError]   = useState(null);
                        
                            useEffect(() => {
                                if (!url) return;
                                let cancelled = false;
                                setLoading(true);
                        
                                fetch(url)
                                    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
                                    .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
                                    .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
                        
                                return () => { cancelled = true; };
                            }, [url]);
                        
                            return { data, loading, error };
                        }
                        
                        // Usage in component
                        function CourseList() {
                            const { data, loading, error } = useFetch("/api/v1/courses");
                        
                            if (loading) return <p>Loading...</p>;
                            if (error)   return <p>Error: {error}</p>;
                        
                            return (
                                <ul>
                                    {data?.content?.map(c => <li key={c.id}>{c.title}</li>)}
                                </ul>
                            );
                        }""", "jsx",
                "Custom hooks ជួយ reuse logic ។ ប្រើ useFetch ក្នុង components ច្រើន ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 5 — React Forms
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch5 = ch(c, "React Forms", 5);

        Lesson l5_1 = ls(ch5, c, "Controlled vs Uncontrolled Components", 1,
                "Controlled Component:\n" +
                        "• value controlled by React state\n" +
                        "• onChange → setState → value update\n" +
                        "• ✅ Real-time validation, conditional logic\n\n" +
                        "Uncontrolled Component:\n" +
                        "• value controlled by DOM (useRef)\n" +
                        "• ✅ ងាយ integrate third-party libraries\n" +
                        "• ✅ File inputs");
        sn(l5_1, "Controlled Component", """
                        import { useState } from 'react';
                        
                        function ControlledInput() {
                            const [value, setValue] = useState('');
                        
                            const handleChange = (event) => {
                                setValue(event.target.value);
                            };
                        
                            return (
                                <div>
                                    <input type="text" value={value} onChange={handleChange} />
                                    <p>You typed: {value}</p>
                                </div>
                            );
                        }""", "jsx",
                "value= + onChange= = controlled ។ React is single source of truth ។", 1);
        sn(l5_1, "Uncontrolled Component (useRef)", """
                        import { useRef } from 'react';
                        
                        function UncontrolledInput() {
                            const inputRef = useRef(null);
                        
                            const handleSubmit = () => {
                                alert('Input value: ' + inputRef.current.value);
                            };
                        
                            return (
                                <div>
                                    <input type="text" ref={inputRef} placeholder="ឈ្មោះ" />
                                    <button onClick={handleSubmit}>Submit</button>
                                </div>
                            );
                        }""", "jsx",
                "Uncontrolled ប្រើ ref ។ ល្អសម្រាប់ file upload ។", 2);

        Lesson l5_2 = ls(ch5, c, "Form Handling", 2,
                "Form handling ក្នុង React:\n\n" +
                        "• onSubmit + event.preventDefault()\n" +
                        "• Controlled inputs ជា state\n" +
                        "• Handle multiple inputs ដោយ name attribute");
        sn(l5_2, "Login Form", """
                        import { useState } from 'react';
                        
                        function LoginForm() {
                            const [username, setUsername] = useState('');
                            const [password, setPassword] = useState('');
                        
                            const handleSubmit = (event) => {
                                event.preventDefault(); // prevent page reload
                                alert(`Username: ${username}`);
                            };
                        
                            return (
                                <form onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button type="submit">Login</button>
                                </form>
                            );
                        }""", "jsx",
                "event.preventDefault() ចំបាច់ ។ onSubmit ក្នុង <form> មិនមែន <button> ។", 1);

        Lesson l5_3 = ls(ch5, c, "Form Validation", 3,
                "Validation ក្នុង React:\n\n" +
                        "• State-based validation\n" +
                        "• Show errors conditionally\n" +
                        "• Disable submit ពេល invalid\n\n" +
                        "Libraries: react-hook-form, Formik, Zod ។");
        sn(l5_3, "Validation Form", """
                        import { useState } from 'react';
                        
                        function ValidationForm() {
                            const [email, setEmail] = useState('');
                            const [error, setError] = useState('');
                        
                            const validate = () => {
                                if (!email) return 'Email ចំបាច់';
                                if (!email.includes('@')) return 'Email មិនត្រឹមត្រូវ';
                                return '';
                            };
                        
                            const handleSubmit = (e) => {
                                e.preventDefault();
                                const err = validate();
                                if (err) {
                                    setError(err);
                                } else {
                                    setError('');
                                    alert('Form submitted successfully!');
                                }
                            };
                        
                            return (
                                <form onSubmit={handleSubmit}>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError(''); // clear error on type
                                        }}
                                        style={{ borderColor: error ? 'red' : '#ccc' }}
                                    />
                                    {error && <p style={{ color: 'red' }}>{error}</p>}
                                    <button type="submit" disabled={!email}>Submit</button>
                                </form>
                            );
                        }""", "jsx",
                "Real-time clear errors when user types ។ Disable button ពេល form empty ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 6 — React Router
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch6 = ch(c, "React Router (Navigation)", 6);

        Lesson l6_1 = ls(ch6, c, "React Router Setup & Basic Routing", 1,
                "React Router DOM v6 សម្រាប់ navigate SPA ។\n\n" +
                        "npm install react-router-dom\n\n" +
                        "BrowserRouter — HTML5 history API\n" +
                        "Routes — container ។ Route — single route\n" +
                        "Link — navigate ដោយគ្មាន page reload\n" +
                        "NavLink — Link ជាមួយ active class");
        sn(l6_1, "Install React Router", """
                        # Install
                        npm install react-router-dom""", "bash",
                "react-router-dom ជា package ។ ប្រើ v6+ ។", 1);
        sn(l6_1, "Basic Routing Setup", """
                        // App.jsx
                        import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
                        
                        function App() {
                            return (
                                <BrowserRouter>
                                    <nav>
                                        <Link to="/">Home</Link>
                                        <Link to="/about">About</Link>
                                        <Link to="/courses">Courses</Link>
                                    </nav>
                        
                                    <Routes>
                                        <Route path="/"               element={<HomePage />} />
                                        <Route path="/about"          element={<AboutPage />} />
                                        <Route path="/courses"        element={<CoursesPage />} />
                                        <Route path="/courses/:slug"  element={<CourseDetailPage />} />
                                        <Route path="/login"          element={<LoginPage />} />
                                        <Route path="*"               element={<NotFoundPage />} />
                                    </Routes>
                                </BrowserRouter>
                            );
                        }
                        
                        function HomePage()   { return <h1>ទំព័រដើម</h1>; }
                        function AboutPage()  { return <h1>អំពីយើង</h1>; }
                        function CoursesPage(){ return <h1>វគ្គសិក្សា</h1>; }""", "jsx",
                "Link ជំនួស <a> (no page reload) ។ path='*' = 404 page ។", 2);

        Lesson l6_2 = ls(ch6, c, "Route Parameters & Hooks", 2,
                "useParams — ខ្ចី URL params (:id, :slug)\n" +
                        "useNavigate — navigate programmatically\n" +
                        "useLocation — current location info\n" +
                        "useSearchParams — query string (?q=html)");
        sn(l6_2, "useParams & useNavigate", """
                        import { useParams, useNavigate } from 'react-router-dom';
                        
                        // useParams: get URL parameters
                        function CourseDetailPage() {
                            const { slug } = useParams(); // from path="/courses/:slug"
                        
                            // Fetch course by slug
                            const { data: course, loading } = useFetch(`/api/v1/courses/slug/${slug}`);
                        
                            if (loading) return <p>Loading...</p>;
                        
                            return (
                                <div>
                                    <h1>{course?.title}</h1>
                                    <p>{course?.description}</p>
                                </div>
                            );
                        }
                        
                        // useNavigate: programmatic navigation
                        function LoginPage() {
                            const navigate = useNavigate();
                        
                            const handleLogin = async () => {
                                // ... login logic ...
                                navigate('/dashboard');        // go to dashboard
                                // navigate(-1);               // go back
                                // navigate('/login', { replace: true }); // replace history
                            };
                        
                            return <button onClick={handleLogin}>Login</button>;
                        }""", "jsx",
                "useParams() ខ្ចី URL params ។ navigate('/path') ប្រើ push ។ navigate(-1) = go back ។", 1);

        Lesson l6_3 = ls(ch6, c, "Private Routes & Redirects", 3,
                "Private routes ការពារ pages ដែលត្រូវ authentication ។\n\n" +
                        "Navigate component ប្រើ redirect ។\n" +
                        "WrappedRoute pattern ។");
        sn(l6_3, "Private Route Implementation", """
                        import { Navigate } from 'react-router-dom';
                        
                        // ── Option 1: Inline ─────────────────────────────────────
                        function App() {
                            const isAuthenticated = !!localStorage.getItem('token');
                        
                            return (
                                <Routes>
                                    <Route path="/login"     element={<LoginPage />} />
                                    <Route
                                        path="/dashboard"
                                        element={
                                            isAuthenticated
                                                ? <DashboardPage />
                                                : <Navigate to="/login" replace />
                                        }
                                    />
                                </Routes>
                            );
                        }
                        
                        // ── Option 2: PrivateRoute Component (cleaner) ───────────
                        function PrivateRoute({ children }) {
                            const isAuthenticated = !!localStorage.getItem('token');
                            return isAuthenticated ? children : <Navigate to="/login" replace />;
                        }
                        
                        function App() {
                            return (
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <PrivateRoute>
                                                <DashboardPage />
                                            </PrivateRoute>
                                        }
                                    />
                                </Routes>
                            );
                        }""", "jsx",
                "replace prop ជំនួស push ។ ប្រើ replace ដើម្បី prevent back → protected page ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 7 — React Styling
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch7 = ch(c, "React Styling", 7);

        Lesson l7_1 = ls(ch7, c, "Inline CSS, CSS Modules & Tailwind", 1,
                "Ways to style React:\n\n" +
                        "1. Inline CSS — style={{ }} object\n" +
                        "2. CSS Modules — scoped CSS per component\n" +
                        "3. Styled Components — CSS-in-JS\n" +
                        "4. Tailwind CSS — utility-first (recommended)");
        sn(l7_1, "Inline CSS", """
                        function InlineStyleExample() {
                            const styles = {
                                color: 'blue',
                                fontSize: '20px',         // camelCase!
                                backgroundColor: '#f0f0f0',
                                padding: '16px',
                                borderRadius: '8px',
                            };
                        
                            return <div style={styles}>This is inline-styled.</div>;
                        }
                        
                        // Dynamic inline style
                        function Alert({ type }) {
                            const color = type === 'error' ? 'red' : 'green';
                            return (
                                <p style={{ color, fontWeight: 'bold' }}>
                                    {type === 'error' ? 'Error!' : 'Success!'}
                                </p>
                            );
                        }""", "jsx",
                "Inline CSS ប្រើ JS object ។ property ជា camelCase ។ ល្អតែ dynamic styles ។", 1);
        sn(l7_1, "CSS Modules", """
                        // MyComponent.module.css
                        .card {
                            background: white;
                            border-radius: 8px;
                            padding: 16px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .title { color: #333; font-size: 18px; }
                        
                        // MyComponent.jsx
                        import styles from './MyComponent.module.css';
                        
                        function MyComponent() {
                            return (
                                <div className={styles.card}>
                                    <h2 className={styles.title}>Course Title</h2>
                                </div>
                            );
                        }""", "jsx",
                "CSS Modules scoped per file → no class name conflicts ។ ល្អ medium projects ។", 2);
        sn(l7_1, "Tailwind CSS", """
                        // Install: npm install -D tailwindcss
                        // npx tailwindcss init
                        
                        function TailwindCard({ title, description }) {
                            return (
                                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl
                                                transition-shadow duration-300">
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
                                    <p className="text-gray-600 text-sm">{description}</p>
                                    <button className="mt-4 bg-blue-600 text-white px-4 py-2
                                                       rounded-lg hover:bg-blue-700 transition-colors">
                                        ចូលរៀន
                                    </button>
                                </div>
                            );
                        }""", "jsx",
                "Tailwind utility-first ។ className ប្រើ classes ។ ល្អ large projects ។", 3);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 8 — React API Calls
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch8 = ch(c, "React API Calls", 8);

        Lesson l8_1 = ls(ch8, c, "Fetch API & Axios", 1,
                "Fetch API — built-in browser API ។\n" +
                        "Axios — library ជាមួយ features ច្រើន:\n" +
                        "• auto JSON parse\n" +
                        "• request/response interceptors\n" +
                        "• cancel requests\n" +
                        "• better error handling\n\n" +
                        "npm install axios");
        sn(l8_1, "Fetch API", """
                        import { useEffect, useState } from 'react';
                        
                        function FetchDataExample() {
                            const [data, setData] = useState(null);
                        
                            useEffect(() => {
                                fetch('https://jsonplaceholder.typicode.com/posts')
                                    .then(response => {
                                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                                        return response.json();
                                    })
                                    .then(data => setData(data))
                                    .catch(error => console.error('Error:', error));
                            }, []);
                        
                            return (
                                <ul>
                                    {data ? data.map(item => (
                                        <li key={item.id}>{item.title}</li>
                                    )) : <p>Loading...</p>}
                                </ul>
                            );
                        }""", "jsx",
                "Fetch មិន throw error ពេល 4xx/5xx → ត្រូវ check response.ok ។", 1);
        sn(l8_1, "Axios", """
                        import { useEffect, useState } from 'react';
                        import axios from 'axios';
                        
                        function AxiosExample() {
                            const [data,    setData]    = useState(null);
                            const [loading, setLoading] = useState(true);
                            const [error,   setError]   = useState(null);
                        
                            useEffect(() => {
                                axios.get('https://jsonplaceholder.typicode.com/posts')
                                    .then(response => {
                                        setData(response.data);  // auto-parsed JSON
                                        setLoading(false);
                                    })
                                    .catch(error => {
                                        setError(error.message);
                                        setLoading(false);
                                    });
                            }, []);
                        
                            if (loading) return <p>Loading...</p>;
                            if (error)   return <p>Error: {error}</p>;
                        
                            return (
                                <ul>
                                    {data.map(item => <li key={item.id}>{item.title}</li>)}
                                </ul>
                            );
                        }""", "jsx",
                "Axios auto-parse JSON ។ response.data ជា data ។ Throw error ពេល 4xx/5xx ។", 2);

        Lesson l8_2 = ls(ch8, c, "Pagination & Infinite Scrolling", 2,
                "Pagination — ចែក data ជាទំព័រ\n" +
                        "Infinite Scrolling — load more ពេល scroll ដល់ bottom\n\n" +
                        "ប្រើ Intersection Observer API ជំនួស scroll event ។");
        sn(l8_2, "Pagination", """
                        import { useState, useEffect } from 'react';
                        import axios from 'axios';
                        
                        function PaginationExample() {
                            const [data, setData]   = useState([]);
                            const [page, setPage]   = useState(1);
                            const [total, setTotal] = useState(0);
                            const limit = 10;
                        
                            useEffect(() => {
                                axios.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`)
                                    .then(res => {
                                        setData(res.data);
                                        setTotal(parseInt(res.headers['x-total-count'], 10));
                                    });
                            }, [page]);
                        
                            const totalPages = Math.ceil(total / limit);
                        
                            return (
                                <div>
                                    <ul>
                                        {data.map(item => <li key={item.id}>{item.title}</li>)}
                                    </ul>
                                    <div>
                                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                            ← មុន
                                        </button>
                                        <span> ទំព័រ {page} / {totalPages} </span>
                                        <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                                            បន្ទាប់ →
                                        </button>
                                    </div>
                                </div>
                            );
                        }""", "jsx",
                "Disable prev/next buttons ជ្រុំ ។ totalPages = Math.ceil(total / limit) ។", 1);
        sn(l8_2, "Infinite Scrolling", """
                        import { useState, useEffect } from 'react';
                        import axios from 'axios';
                        
                        function InfiniteScrollExample() {
                            const [data, setData] = useState([]);
                            const [page, setPage] = useState(1);
                        
                            // Load data when page changes
                            useEffect(() => {
                                axios.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`)
                                    .then(res => setData(prev => [...prev, ...res.data])); // append
                            }, [page]);
                        
                            // Detect scroll to bottom
                            useEffect(() => {
                                const handleScroll = () => {
                                    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
                                    if (scrollTop + clientHeight >= scrollHeight - 5) {
                                        setPage(prev => prev + 1);
                                    }
                                };
                        
                                window.addEventListener('scroll', handleScroll);
                                return () => window.removeEventListener('scroll', handleScroll);
                            }, []);
                        
                            return (
                                <ul>
                                    {data.map(item => <li key={item.id}>{item.title}</li>)}
                                </ul>
                            );
                        }""", "jsx",
                "[...prev, ...res.data] append ។ cleanup removeEventListener ។ Intersection Observer = better approach ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 9 — React State Management
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch9 = ch(c, "React State Management", 9);

        Lesson l9_1 = ls(ch9, c, "useReducer Hook", 1,
                "useReducer ជំនួស useState សម្រាប់ complex state logic ។\n\n" +
                        "State transitions ពឹងលើ previous state ។\n" +
                        "Pattern: state + action → reducer → new state\n\n" +
                        "Similar to Redux pattern ។");
        sn(l9_1, "useReducer Counter", """
                        import { useReducer } from 'react';
                        
                        // Initial state
                        const initialState = { count: 0 };
                        
                        // Reducer function: pure function
                        function reducer(state, action) {
                            switch (action.type) {
                                case 'increment':
                                    return { count: state.count + 1 };
                                case 'decrement':
                                    return { count: state.count - 1 };
                                case 'reset':
                                    return initialState;
                                case 'set':
                                    return { count: action.payload };
                                default:
                                    throw new Error(`Unknown action: ${action.type}`);
                            }
                        }
                        
                        function Counter() {
                            const [state, dispatch] = useReducer(reducer, initialState);
                        
                            return (
                                <div>
                                    <p>Count: {state.count}</p>
                                    <button onClick={() => dispatch({ type: 'increment' })}>+</button>
                                    <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
                                    <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
                                    <button onClick={() => dispatch({ type: 'set', payload: 10 })}>Set 10</button>
                                </div>
                            );
                        }""", "jsx",
                "reducer = pure function ។ dispatch({ type, payload }) ។ ល្អសម្រាប់ complex state ។", 1);

        Lesson l9_2 = ls(ch9, c, "Context API — Global State", 2,
                "Context API + useReducer = global state ដោយគ្មាន Redux ។\n\n" +
                        "Pattern:\n" +
                        "1. createContext\n" +
                        "2. Provider ជាមួយ useReducer\n" +
                        "3. useContext ក្នុង consumers");
        sn(l9_2, "Auth Context", """
                        import { createContext, useContext, useReducer } from 'react';
                        
                        // 1. Create Context
                        const AuthContext = createContext(null);
                        
                        // 2. Reducer
                        function authReducer(state, action) {
                            switch (action.type) {
                                case 'LOGIN':
                                    return { ...state, user: action.payload, isAuthenticated: true };
                                case 'LOGOUT':
                                    return { ...state, user: null, isAuthenticated: false };
                                default:
                                    return state;
                            }
                        }
                        
                        // 3. Provider
                        export function AuthProvider({ children }) {
                            const [state, dispatch] = useReducer(authReducer, {
                                user: null,
                                isAuthenticated: false,
                            });
                        
                            const login  = (user) => dispatch({ type: 'LOGIN',  payload: user });
                            const logout = ()     => dispatch({ type: 'LOGOUT' });
                        
                            return (
                                <AuthContext.Provider value={{ ...state, login, logout }}>
                                    {children}
                                </AuthContext.Provider>
                            );
                        }
                        
                        // 4. Custom hook for easy access
                        export function useAuth() {
                            return useContext(AuthContext);
                        }
                        
                        // Usage in component
                        function Navbar() {
                            const { user, isAuthenticated, logout } = useAuth();
                            return (
                                <nav>
                                    {isAuthenticated ? (
                                        <>
                                            <span>Hello, {user.name}!</span>
                                            <button onClick={logout}>Logout</button>
                                        </>
                                    ) : (
                                        <a href="/login">Login</a>
                                    )}
                                </nav>
                            );
                        }""", "jsx",
                "Custom hook useAuth() ជួយ hide Context usage ។ Provider ជ្រុំ App ។", 1);

        Lesson l9_3 = ls(ch9, c, "Redux Toolkit", 3,
                "Redux Toolkit (RTK) = official Redux package ។\n\n" +
                        "npm install @reduxjs/toolkit react-redux\n\n" +
                        "createSlice — reducers + actions\n" +
                        "configureStore — store setup\n" +
                        "useSelector — read state\n" +
                        "useDispatch — dispatch actions");
        sn(l9_3, "Redux Toolkit Setup", """
                        import { configureStore, createSlice } from '@reduxjs/toolkit';
                        import { Provider, useSelector, useDispatch } from 'react-redux';
                        
                        // 1. Create slice (reducer + actions)
                        const counterSlice = createSlice({
                            name: 'counter',
                            initialState: { value: 0 },
                            reducers: {
                                increment: state => { state.value += 1; },
                                decrement: state => { state.value -= 1; },
                                setValue:  (state, action) => { state.value = action.payload; },
                            },
                        });
                        
                        // 2. Create store
                        const store = configureStore({
                            reducer: {
                                counter: counterSlice.reducer,
                            },
                        });
                        
                        // 3. Counter component
                        function Counter() {
                            const count    = useSelector(state => state.counter.value);
                            const dispatch = useDispatch();
                        
                            return (
                                <div>
                                    <p>Count: {count}</p>
                                    <button onClick={() => dispatch(counterSlice.actions.increment())}>+</button>
                                    <button onClick={() => dispatch(counterSlice.actions.decrement())}>-</button>
                                </div>
                            );
                        }
                        
                        // 4. Wrap app with Provider
                        function App() {
                            return (
                                <Provider store={store}>
                                    <Counter />
                                </Provider>
                            );
                        }""", "jsx",
                "createSlice = reducers + auto-generated actions ។ Immer ជ្រោយ mutable-looking code ។", 1);

        Lesson l9_4 = ls(ch9, c, "Zustand & Recoil", 4,
                "Zustand — simple, lightweight state management ។\n" +
                        "npm install zustand\n\n" +
                        "Recoil — atom-based state management by Meta ។\n" +
                        "npm install recoil\n\n" +
                        "Both simpler than Redux ។");
        sn(l9_4, "Zustand Example", """
                        import { create } from 'zustand';
                        
                        // Create store
                        const useCounterStore = create((set) => ({
                            count: 0,
                            increment: () => set(state => ({ count: state.count + 1 })),
                            decrement: () => set(state => ({ count: state.count - 1 })),
                            reset:     () => set({ count: 0 }),
                        }));
                        
                        // Usage — no Provider needed!
                        function Counter() {
                            const { count, increment, decrement } = useCounterStore();
                            return (
                                <div>
                                    <p>Count: {count}</p>
                                    <button onClick={increment}>+</button>
                                    <button onClick={decrement}>-</button>
                                </div>
                            );
                        }""", "jsx",
                "Zustand គ្មាន Provider ។ create() ផ្ទុក state + actions ។ ល្អ small-medium projects ។", 1);
        sn(l9_4, "Recoil Example", """
                        import { RecoilRoot, atom, useRecoilState } from 'recoil';
                        
                        // Define atom (piece of state)
                        const countState = atom({
                            key: 'countState', // unique key
                            default: 0,
                        });
                        
                        function Counter() {
                            const [count, setCount] = useRecoilState(countState);
                            return (
                                <div>
                                    <p>Count: {count}</p>
                                    <button onClick={() => setCount(c => c + 1)}>+</button>
                                    <button onClick={() => setCount(c => c - 1)}>-</button>
                                </div>
                            );
                        }
                        
                        // Wrap app with RecoilRoot
                        function App() {
                            return (
                                <RecoilRoot>
                                    <Counter />
                                </RecoilRoot>
                            );
                        }""", "jsx",
                "atom ជា unit of state ។ useRecoilState = useState-like API ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 10 — React Performance Optimization
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch10 = ch(c, "React Performance Optimization", 10);

        Lesson l10_1 = ls(ch10, c, "React.memo, useCallback & useMemo", 1,
                "Performance tools:\n\n" +
                        "React.memo() — prevent re-render ពេល props មិនផ្លាស់ប្ដូរ\n" +
                        "useCallback — memoize functions (prevent re-create)\n" +
                        "useMemo — memoize computed values (prevent re-compute)\n\n" +
                        "ប្រើតែពេល expensive operations !");
        sn(l10_1, "React.memo()", """
                        import { memo, useState } from 'react';
                        
                        // Wrapped with memo → only re-renders if props change
                        const CourseCard = memo(function CourseCard({ title, level }) {
                            console.log('CourseCard rendered:', title);
                            return (
                                <div>
                                    <h3>{title}</h3>
                                    <span>{level}</span>
                                </div>
                            );
                        });
                        
                        function App() {
                            const [count, setCount] = useState(0);
                        
                            return (
                                <div>
                                    <button onClick={() => setCount(c => c + 1)}>
                                        Click {count}
                                    </button>
                                    {/* CourseCard will NOT re-render when count changes */}
                                    <CourseCard title="HTML Course" level="BEGINNER" />
                                </div>
                            );
                        }""", "jsx",
                "React.memo() ។ shallow comparison props ។ ប្រើតែ expensive components ។", 1);
        sn(l10_1, "useCallback & useMemo", """
                        import { useState, useCallback, useMemo } from 'react';
                        
                        function MyComponent({ items }) {
                            const [count, setCount] = useState(0);
                        
                            // useCallback: memoize function reference
                            const handleClick = useCallback(() => {
                                setCount(prev => prev + 1);
                            }, []); // [] = never re-create
                        
                            // useMemo: memoize computed value
                            const sortedItems = useMemo(() => {
                                console.log('Sorting...');
                                return [...items].sort((a, b) => a - b);
                            }, [items]); // only re-compute when items changes
                        
                            return (
                                <div>
                                    <button onClick={handleClick}>Count: {count}</button>
                                    <ul>
                                        {sortedItems.map(item => <li key={item}>{item}</li>)}
                                    </ul>
                                </div>
                            );
                        }""", "jsx",
                "useCallback ជួយ React.memo children ។ useMemo ជួយ expensive computations ។", 2);

        Lesson l10_2 = ls(ch10, c, "Lazy Loading & Suspense", 2,
                "Lazy Loading — load components ពេលចំបាច់ (code splitting) ។\n\n" +
                        "React.lazy() — dynamic import\n" +
                        "Suspense — fallback UI ពេល loading\n\n" +
                        "ធ្វើ initial bundle size តូច → fast first load ។");
        sn(l10_2, "Lazy Loading with Suspense", """
                        import { lazy, Suspense } from 'react';
                        import { Routes, Route } from 'react-router-dom';
                        
                        // Lazy load pages — only load when visited
                        const HomePage         = lazy(() => import('./pages/HomePage'));
                        const CoursesPage      = lazy(() => import('./pages/CoursesPage'));
                        const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
                        const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
                        
                        function App() {
                            return (
                                <Suspense fallback={
                                    <div style={{ textAlign: 'center', padding: '50px' }}>
                                        <p>កំពុងផ្ទុក...</p>
                                    </div>
                                }>
                                    <Routes>
                                        <Route path="/"          element={<HomePage />} />
                                        <Route path="/courses"   element={<CoursesPage />} />
                                        <Route path="/courses/:slug" element={<CourseDetailPage />} />
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                    </Routes>
                                </Suspense>
                            );
                        }""", "jsx",
                "lazy() + dynamic import = code splitting ។ Suspense fallback= បង្ហាញ loading UI ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 11 — Advanced React Concepts
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch11 = ch(c, "Advanced React Concepts", 11);

        Lesson l11_1 = ls(ch11, c, "Higher-Order Components (HOC)", 1,
                "HOC = function ទទួល component → return component ថ្មី ។\n\n" +
                        "ប្រើ share cross-cutting concerns:\n" +
                        "• Loading state\n" +
                        "• Authentication check\n" +
                        "• Error handling\n\n" +
                        "Custom Hooks ជំនួស HOC ក្នុង modern React ។");
        sn(l11_1, "HOC Example", """
                        import React from 'react';
                        
                        // HOC: adds loading state to any component
                        function withLoading(WrappedComponent) {
                            return function WithLoadingComponent({ isLoading, ...props }) {
                                if (isLoading) {
                                    return <div>Loading...</div>;
                                }
                                return <WrappedComponent {...props} />;
                            };
                        }
                        
                        // Original component
                        function CourseList({ data }) {
                            return (
                                <ul>
                                    {data.map(item => <li key={item.id}>{item.title}</li>)}
                                </ul>
                            );
                        }
                        
                        // Enhanced component
                        const CourseListWithLoading = withLoading(CourseList);
                        
                        // Usage
                        function App() {
                            return (
                                <CourseListWithLoading
                                    isLoading={false}
                                    data={[{ id: 1, title: 'HTML Course' }]}
                                />
                            );
                        }""", "jsx",
                "HOC ។ {...props} spread ។ Custom Hooks ល្អជាង HOC ក្នុង modern React ។", 1);

        Lesson l11_2 = ls(ch11, c, "Error Boundaries", 2,
                "Error Boundaries ចាប់ JavaScript errors ក្នុង child components ។\n\n" +
                        "ប្រើ class component (no functional equivalent yet) ។\n\n" +
                        "getDerivedStateFromError — update state ពេល error\n" +
                        "componentDidCatch — log error");
        sn(l11_2, "Error Boundary", """
                        import React from 'react';
                        
                        class ErrorBoundary extends React.Component {
                            constructor(props) {
                                super(props);
                                this.state = { hasError: false, error: null };
                            }
                        
                            static getDerivedStateFromError(error) {
                                return { hasError: true, error };
                            }
                        
                            componentDidCatch(error, errorInfo) {
                                console.error('Error caught:', error, errorInfo);
                                // Log to error tracking service (Sentry, etc.)
                            }
                        
                            render() {
                                if (this.state.hasError) {
                                    return (
                                        <div style={{ padding: 20, textAlign: 'center' }}>
                                            <h2>Something went wrong.</h2>
                                            <p>{this.state.error?.message}</p>
                                            <button onClick={() => this.setState({ hasError: false })}>
                                                Try Again
                                            </button>
                                        </div>
                                    );
                                }
                                return this.props.children;
                            }
                        }
                        
                        // Usage
                        function App() {
                            return (
                                <ErrorBoundary>
                                    <CoursesPage />
                                </ErrorBoundary>
                            );
                        }""", "jsx",
                "Error Boundary ចាប់ runtime errors ។ ប្រើ class component ។ Wrap critical sections ។", 1);

        Lesson l11_3 = ls(ch11, c, "Portals", 3,
                "Portals render children ទៅ DOM node ខាងក្រៅ parent hierarchy ។\n\n" +
                        "ប្រើ: modals, tooltips, popovers, notifications ។\n\n" +
                        "ReactDOM.createPortal(children, container)");
        sn(l11_3, "Modal with Portal", """
                        import { createPortal } from 'react-dom';
                        import { useState } from 'react';
                        
                        // Modal renders outside #root, directly into body
                        function Modal({ isOpen, onClose, children }) {
                            if (!isOpen) return null;
                        
                            return createPortal(
                                <div style={{
                                    position: 'fixed', top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    background: 'rgba(0,0,0,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 1000,
                                }}>
                                    <div style={{ background: 'white', padding: 24, borderRadius: 8 }}>
                                        {children}
                                        <button onClick={onClose} style={{ marginTop: 16 }}>Close</button>
                                    </div>
                                </div>,
                                document.body // render target
                            );
                        }
                        
                        function App() {
                            const [open, setOpen] = useState(false);
                            return (
                                <div>
                                    <button onClick={() => setOpen(true)}>Open Modal</button>
                                    <Modal isOpen={open} onClose={() => setOpen(false)}>
                                        <h2>Modal Title</h2>
                                        <p>Modal content here...</p>
                                    </Modal>
                                </div>
                            );
                        }""", "jsx",
                "Portal render ក្រៅ #root ។ Events still bubble up through React tree ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 12 — React and Firebase
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch12 = ch(c, "React and Firebase", 12);

        Lesson l12_1 = ls(ch12, c, "Firebase Authentication", 1,
                "Firebase Auth ជួយ implement login/register ។\n\n" +
                        "npm install firebase\n\n" +
                        "Providers: email/password, Google, Facebook, GitHub ។\n\n" +
                        "signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut ។");
        sn(l12_1, "Firebase Auth Setup", """
                        // firebase.js - config
                        import { initializeApp } from 'firebase/app';
                        import { getAuth } from 'firebase/auth';
                        
                        const firebaseConfig = {
                            apiKey:            "YOUR_API_KEY",
                            authDomain:        "YOUR_PROJECT.firebaseapp.com",
                            projectId:         "YOUR_PROJECT_ID",
                            storageBucket:     "YOUR_PROJECT.appspot.com",
                            messagingSenderId: "YOUR_SENDER_ID",
                            appId:             "YOUR_APP_ID",
                        };
                        
                        const app  = initializeApp(firebaseConfig);
                        export const auth = getAuth(app);""", "jsx",
                "firebase config ពី Firebase Console ។ ប្រើ environment variables ។", 1);
        sn(l12_1, "Login with Firebase", """
                        import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
                        import { auth } from './firebase';
                        import { useState } from 'react';
                        
                        function LoginPage() {
                            const [email,    setEmail]    = useState('');
                            const [password, setPassword] = useState('');
                            const [error,    setError]    = useState('');
                        
                            const handleLogin = async (e) => {
                                e.preventDefault();
                                try {
                                    const userCredential = await signInWithEmailAndPassword(
                                        auth, email, password
                                    );
                                    console.log('Logged in:', userCredential.user.email);
                                } catch (error) {
                                    setError('Email ឬ Password មិនត្រឹមត្រូវ');
                                }
                            };
                        
                            const handleLogout = async () => {
                                await signOut(auth);
                            };
                        
                            return (
                                <form onSubmit={handleLogin}>
                                    <input type="email"    value={email}    onChange={e => setEmail(e.target.value)}    placeholder="Email" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                                    {error && <p style={{ color: 'red' }}>{error}</p>}
                                    <button type="submit">Login</button>
                                </form>
                            );
                        }""", "jsx",
                "try/catch Firebase errors ។ auth.currentUser ផ្ទុក logged-in user ។", 2);

        Lesson l12_2 = ls(ch12, c, "Firestore Database & Hosting", 2,
                "Firestore — NoSQL real-time database ។\n\n" +
                        "collection() + addDoc() — add data\n" +
                        "getDocs() — read data\n" +
                        "onSnapshot() — real-time listener\n\n" +
                        "Firebase Hosting: deploy React app ។");
        sn(l12_2, "Firestore CRUD", """
                        import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
                        import { initializeApp } from 'firebase/app';
                        
                        const app = initializeApp(firebaseConfig);
                        const db  = getFirestore(app);
                        
                        // Add document
                        async function addUser() {
                            try {
                                const docRef = await addDoc(collection(db, 'users'), {
                                    name:  'Sokha',
                                    email: 'sokha@example.com',
                                    role:  'student',
                                });
                                console.log('Document ID:', docRef.id);
                            } catch (error) {
                                console.error('Error:', error);
                            }
                        }
                        
                        // Read documents
                        async function getUsers() {
                            const querySnapshot = await getDocs(collection(db, 'users'));
                            querySnapshot.forEach(doc => {
                                console.log(doc.id, doc.data());
                            });
                        }""", "jsx",
                "Firestore auto-generates IDs ។ onSnapshot() = real-time updates ។", 1);
        sn(l12_2, "Deploy to Firebase Hosting", """
                        # 1. Install Firebase CLI
                        npm install -g firebase-tools
                        
                        # 2. Login
                        firebase login
                        
                        # 3. Initialize project (select Hosting)
                        firebase init
                        
                        # 4. Build React app
                        npm run build
                        
                        # 5. Deploy
                        firebase deploy
                        
                        # Public URL: https://your-project.web.app""", "bash",
                "firebase init ជ្រើស Hosting ។ build directory = dist (Vite) ឬ build (CRA) ។", 2);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 13 — React Testing
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch13 = ch(c, "React Testing", 13);

        Lesson l13_1 = ls(ch13, c, "Jest & React Testing Library", 1,
                """
                        Jest — unit testing framework ។
                        React Testing Library (RTL) — test components ផ្ដោតលើ user behavior ។
                        
                        npm install --save-dev @testing-library/react
                        
                        render(), screen, fireEvent, userEvent ។""");
        sn(l13_1, "Jest Unit Test", """
                        // sum.js
                        function sum(a, b) {
                            return a + b;
                        }
                        module.exports = sum;
                        
                        // sum.test.js
                        const sum = require('./sum');
                        
                        test('adds 1 + 2 to equal 3', () => {
                            expect(sum(1, 2)).toBe(3);
                        });
                        
                        test('adds 0 + 0 to equal 0', () => {
                            expect(sum(0, 0)).toBe(0);
                        });""", "jsx",
                "test() ឬ it() ។ expect().toBe() ។ npm test ដំណើរការ tests ។", 1);
        sn(l13_1, "React Testing Library", """
                        import { render, screen, fireEvent } from '@testing-library/react';
                        import Counter from './Counter';
                        
                        test('renders Counter component', () => {
                            render(<Counter />);
                        
                            // Find element by text
                            const countText = screen.getByText(/Count: 0/i);
                            expect(countText).toBeInTheDocument();
                        });
                        
                        test('increments count on button click', () => {
                            render(<Counter />);
                        
                            const button = screen.getByRole('button', { name: /+/i });
                            fireEvent.click(button);
                        
                            expect(screen.getByText(/Count: 1/i)).toBeInTheDocument();
                        });
                        
                        test('renders MyComponent correctly', () => {
                            render(<MyComponent />);
                            expect(screen.getByText(/Hello, World!/i)).toBeInTheDocument();
                        });""", "jsx",
                "getByText, getByRole, getByPlaceholderText ។ fireEvent.click() ។ RTL test ជា user ។", 2);

        Lesson l13_2 = ls(ch13, c, "End-to-End Testing with Cypress", 2,
                """
                        Cypress — E2E testing framework ។
                        
                        npm install --save-dev cypress
                        npx cypress open
                        
                        Test real browser behavior ។
                        cy.visit(), cy.get(), cy.contains(), cy.click() ។""");
        sn(l13_2, "Cypress E2E Tests", """
                        // cypress/e2e/app.cy.js
                        
                        describe('Code Khmer Learning App', () => {
                        
                            it('visits the homepage', () => {
                                cy.visit('/');
                                cy.contains('Code Khmer'); // check text exists
                            });
                        
                            it('navigates to courses page', () => {
                                cy.visit('/');
                                cy.get('a[href="/courses"]').click();
                                cy.url().should('include', '/courses');
                            });
                        
                            it('searches for a course', () => {
                                cy.visit('/courses');
                                cy.get('input[placeholder*="ស្វែងរក"]').type('HTML');
                                cy.get('button').contains('ស្វែងរក').click();
                                cy.contains('HTML').should('exist');
                            });
                        
                            it('login flow', () => {
                                cy.visit('/login');
                                cy.get('input[type="email"]').type('user@test.com');
                                cy.get('input[type="password"]').type('password123');
                                cy.get('button[type="submit"]').click();
                                cy.url().should('include', '/dashboard');
                            });
                        });""", "jsx",
                "Cypress test real browser ។ cy.get() selector ។ .should() assertion ។", 1);

        // ═══════════════════════════════════════════════════════════════════
        // CHAPTER 14 — React Deployment
        // ═══════════════════════════════════════════════════════════════════
        Chapter ch14 = ch(c, "React Deployment", 14);

        Lesson l14_1 = ls(ch14, c, "Build for Production", 1,
                """
                        មុន deploy ត្រូវ build production bundle ។
                        
                        npm run build → creates optimized files ។
                        
                        Vite: dist/ folder
                        CRA: build/ folder
                        
                        Optimizations: minification, tree-shaking, code-splitting ។""");
        sn(l14_1, "Production Build", """
                        # Build for production
                        npm run build
                        
                        # Preview production build locally (Vite)
                        npm run preview
                        
                        # What's in the build output:
                        # dist/
                        #   index.html          ← entry point
                        #   assets/
                        #     index-abc123.js   ← minified JS
                        #     index-def456.css  ← minified CSS
                        #     ...
                        
                        # Analyze bundle size
                        npm install --save-dev rollup-plugin-visualizer""", "bash",
                "dist/ folder deploy ។ index.html ជា entry point ។ hash filenames = cache busting ។", 1);

        Lesson l14_2 = ls(ch14, c, "Deploy to Vercel & Netlify", 2,
                """
                        Vercel — best for React/Next.js ។ Auto deploy from Git ។
                        
                        Netlify — great for static sites ។ CI/CD built-in ។
                        
                        Both: free tier, HTTPS auto, CDN ។""");
        sn(l14_2, "Deploy to Vercel", """
                        # Option 1: Vercel CLI
                        npm install -g vercel
                        vercel login
                        vercel              # deploy from current directory
                        
                        # Option 2: Git Integration (recommended)
                        # 1. Push code to GitHub/GitLab
                        # 2. Connect repo on vercel.com
                        # 3. Auto deploy on every push to main!
                        
                        # vercel.json config (optional)
                        # {
                        #   "rewrites": [
                        #     { "source": "/(.*)", "destination": "/index.html" }
                        #   ]
                        # }""", "bash",
                "SPA ត្រូវ rewrite all paths → index.html ។ vercel.json config ជួយ ។", 1);
        sn(l14_2, "Deploy to Netlify", """
                        # Option 1: Netlify CLI
                        npm install -g netlify-cli
                        netlify login
                        netlify deploy --prod --dir=dist
                        
                        # Option 2: Git Integration
                        # 1. Connect GitHub repo on netlify.com
                        # 2. Build command: npm run build
                        # 3. Publish directory: dist
                        # 4. Auto deploy on push!
                        
                        # _redirects file in public/ folder (required for SPA routing)
                        /* /index.html 200""", "bash",
                "_redirects file ចំបាច់ SPA routing ។ dist ជា publish directory (Vite) ។", 2);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. NEXT.JS
    // ══════════════════════════════════════════════════════════════════════════
    private void seedNextJS(User ins, Category cat) {
        Course c = course("Next.js ជាភាសាខ្មែរ", "nextjs-khmer",
                "រៀន Next.js 14+ App Router, Server Components, API Routes, Data Fetching, " +
                        "Tailwind CSS, Authentication, Deployment ជាភាសាខ្មែរ ។",
                "INTERMEDIATE", false, ins, cat);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 1 - ការណែនាំ & Setup
        // ══════════════════════════════════════════════════════════════
        Chapter ch1 = ch(c, "ការណែនាំ & Setup", 1);

        Lesson l1 = ls(ch1, c, "Next.js គឺជាអ្វី?", 1,
                """
                        Next.js ជា React Framework by Vercel ។
                        
                        ផ្ដល់ SSR (Server Side Rendering), SSG (Static Site Generation), ISR (Incremental Static Regeneration) ។
                        
                        App Router (Next.js 13+): folder-based routing ។
                        
                        ហេតុអ្វីប្រើ Next.js?
                        - SEO-friendly: Server renders HTML → search engines index ល្អ ។
                        - Performance: Automatic code splitting, image optimization ។
                        - Full-stack: API Routes ក្នុង project តែមួយ ។
                        - Developer Experience: Fast Refresh, TypeScript built-in ។""");

        sn(l1, "Create Next.js App", """
                        # Create Next.js project (interactive prompts)
                        npx create-next-app@latest my-app
                        
                        # Prompts:
                        # ✔ TypeScript?          → Yes
                        # ✔ ESLint?              → Yes
                        # ✔ Tailwind CSS?        → Yes
                        # ✔ src/ directory?      → No
                        # ✔ App Router?          → Yes
                        # ✔ Import alias (@/*)?  → Yes
                        
                        cd my-app
                        npm run dev   # http://localhost:3000""", "bash",
                "App Router ជា default ក្នុង Next.js 13+ ។ ប្រើ TypeScript + Tailwind CSS ។", 1);

        sn(l1, "Folder Structure", """
                        my-app/
                        ├── app/                        # App Router root
                        │   ├── layout.tsx              # Root layout (wraps all pages)
                        │   ├── page.tsx                # Home page  →  /
                        │   ├── globals.css             # Global styles
                        │   ├── courses/
                        │   │   ├── page.tsx            # Courses list  →  /courses
                        │   │   └── [slug]/
                        │   │       └── page.tsx        # Course detail  →  /courses/:slug
                        │   ├── dashboard/
                        │   │   ├── layout.tsx          # Dashboard nested layout
                        │   │   └── page.tsx            # Dashboard  →  /dashboard
                        │   └── api/
                        │       └── courses/
                        │           └── route.ts        # API  →  /api/courses
                        ├── components/                 # Reusable UI components
                        ├── lib/                        # Utilities, helpers
                        ├── public/                     # Static assets
                        ├── next.config.js              # Next.js config
                        └── tailwind.config.ts          # Tailwind config""", "bash",
                "folder = URL segment ។ page.tsx ក្នុង folder = route ។ layout.tsx = shared wrapper ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 2 - App Router & Pages
        // ══════════════════════════════════════════════════════════════
        Chapter ch2 = ch(c, "App Router & Pages", 2);

        Lesson l2 = ls(ch2, c, "File-based Routing", 1,
                "Next.js App Router: folder = route segment ។\n\n" +
                        "Special files:\n" +
                        "- page.tsx      → UI of route (publicly accessible)\n" +
                        "- layout.tsx    → Shared UI (persists across navigation)\n" +
                        "- loading.tsx   → Loading UI (Suspense boundary)\n" +
                        "- error.tsx     → Error UI (Error boundary)\n" +
                        "- not-found.tsx → 404 page\n\n" +
                        "Dynamic routes: [slug] folder → params.slug ។\n" +
                        "Catch-all: [...slug] → /a/b/c ។");

        sn(l2, "Root Layout & Pages", """
                        // app/layout.tsx  –  Root Layout (required)
                        import type { Metadata } from "next";
                        import { Inter } from "next/font/google";
                        import "./globals.css";
                        import Navbar from "@/components/Navbar";
                        import Footer from "@/components/Footer";
                        
                        const inter = Inter({ subsets: ["latin"] });
                        
                        export const metadata: Metadata = {
                            title: "Code Khmer Learning",
                            description: "រៀនសរសេរកូដជាភាសាខ្មែរ",
                        };
                        
                        export default function RootLayout({
                            children,
                        }: {
                            children: React.ReactNode;
                        }) {
                            return (
                                <html lang="km">
                                    <body className={inter.className}>
                                        <Navbar />
                                        <main className="min-h-screen">{children}</main>
                                        <Footer />
                                    </body>
                                </html>
                            );
                        }
                        
                        // app/page.tsx  –  Home page  →  /
                        export default function HomePage() {
                            return (
                                <section className="container mx-auto px-4 py-16">
                                    <h1 className="text-4xl font-bold text-center">
                                        ស្វាគមន៍ Code Khmer Learning
                                    </h1>
                                </section>
                            );
                        }""", "tsx",
                "layout.tsx ត្រូវតែ return <html> + <body> នៅ root ។ metadata export សម្រាប់ SEO ។", 1);

        sn(l2, "Dynamic Route - Course Detail", """
                        // app/courses/[slug]/page.tsx  →  /courses/:slug
                        import { notFound } from "next/navigation";
                        
                        interface Props {
                            params: Promise<{ slug: string }>;
                        }
                        
                        export default async function CourseDetailPage({ params }: Props) {
                            const { slug } = await params;
                        
                            const res = await fetch(
                                `${process.env.API_URL}/api/v1/courses/slug/${slug}/full`,
                                { cache: "no-store" }   // SSR: fresh data every request
                            );
                        
                            if (!res.ok) notFound(); // → renders not-found.tsx
                        
                            const json = await res.json();
                            const course = json.data;
                        
                            return (
                                <div className="container mx-auto px-4 py-8">
                                    <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                                    <p className="text-gray-600 mb-6">{course.description}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {course.chapters?.map((ch: any) => (
                                            <ChapterCard key={ch.id} chapter={ch} />
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        
                        // Generate static params for SSG (optional)
                        export async function generateStaticParams() {
                            const res = await fetch(`${process.env.API_URL}/api/v1/courses`);
                            const json = await res.json();
                            return json.data.content.map((course: any) => ({ slug: course.slug }));
                        }
                        
                        // SEO metadata per page
                        export async function generateMetadata({ params }: Props) {
                            const { slug } = await params;
                            const res = await fetch(
                                `${process.env.API_URL}/api/v1/courses/slug/${slug}/full`
                            );
                            const json = await res.json();
                            return {
                                title: json.data?.title ?? "Course",
                                description: json.data?.description,
                            };
                        }""", "tsx",
                "notFound() trigger 404 ។ generateStaticParams() = SSG ។ generateMetadata() = dynamic SEO ។", 2);

        sn(l2, "Loading & Error UI", """
                        // app/courses/[slug]/loading.tsx  –  shown while page fetches
                        export default function Loading() {
                            return (
                                <div className="container mx-auto px-4 py-8 animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                </div>
                            );
                        }
                        
                        // app/courses/[slug]/error.tsx  –  shown when fetch throws
                        "use client";
                        export default function Error({
                            error,
                            reset,
                        }: {
                            error: Error;
                            reset: () => void;
                        }) {
                            return (
                                <div className="flex flex-col items-center py-20 gap-4">
                                    <p className="text-red-500 text-lg">{error.message}</p>
                                    <button
                                        onClick={reset}
                                        className="px-4 py-2 bg-blue-600 text-white rounded"
                                    >
                                        ព្យាយាមម្ដងទៀត
                                    </button>
                                </div>
                            );
                        }
                        
                        // app/not-found.tsx  –  global 404
                        import Link from "next/link";
                        export default function NotFound() {
                            return (
                                <div className="flex flex-col items-center py-20 gap-4">
                                    <h2 className="text-2xl font-bold">404 – រកមិនឃើញ</h2>
                                    <Link href="/" className="text-blue-600 hover:underline">
                                        ត្រឡប់ទៅដើម
                                    </Link>
                                </div>
                            );
                        }""", "tsx",
                "loading.tsx = automatic Suspense ។ error.tsx ត្រូវ 'use client' ។ reset() retry fetch ។", 3);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 3 - Server vs Client Components
        // ══════════════════════════════════════════════════════════════
        Chapter ch3 = ch(c, "Server vs Client Components", 3);

        Lesson l3 = ls(ch3, c, "Server & Client Components", 1,
                """
                        Server Component (default): render server-side ។ no useState/useEffect ។
                        - ចូល DB/API ផ្ទាល់ ។
                        - Bundle size តូច (code មិន ship ទៅ browser) ។
                        - ល្អ performance + SEO ។
                        
                        'use client': render browser-side ។
                        - ប្រើ useState, useEffect, event handlers ។
                        - ប្រើ browser APIs (window, localStorage) ។
                        
                        Rule: Server Component ជា default ។ add 'use client' តែពេលត្រូវការ interactivity ។""");

        sn(l3, "Server Component", """
                        // app/courses/page.tsx  –  Server Component (default)
                        // ✅ fetch ផ្ទាល់ server-side  |  ✅ no useState  |  ✅ fast SEO
                        import CourseCard from "@/components/CourseCard";
                        
                        interface Course {
                            id: number;
                            title: string;
                            slug: string;
                            description: string;
                            level: string;
                            isFree: boolean;
                            thumbnail: string;
                            totalLessons: number;
                        }
                        
                        export default async function CoursesPage() {
                            const res = await fetch(
                                `${process.env.API_URL}/api/v1/courses`,
                                { next: { revalidate: 60 } }  // ISR: revalidate every 60s
                            );
                            const json = await res.json();
                            const courses: Course[] = json.data.content;
                        
                            return (
                                <div className="container mx-auto px-4 py-8">
                                    <h1 className="text-3xl font-bold mb-8">វគ្គសិក្សាទាំងអស់</h1>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {courses.map(course => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                </div>
                            );
                        }""", "tsx",
                "next: { revalidate: 60 } = ISR (re-fetch every 60s) ។ cache:'no-store' = SSR ។ force-cache = SSG ។", 1);

        sn(l3, "Client Component", """
                        // components/SearchBar.tsx  –  Client Component
                        // ✅ useState, useEffect  |  ✅ event handlers  |  ✅ interactivity
                        "use client";
                        
                        import { useState, useTransition } from "react";
                        import { useRouter, useSearchParams } from "next/navigation";
                        
                        export default function SearchBar() {
                            const router = useRouter();
                            const searchParams = useSearchParams();
                            const [query, setQuery]   = useState(searchParams.get("q") ?? "");
                            const [isPending, startTransition] = useTransition();
                        
                            const handleSearch = (value: string) => {
                                setQuery(value);
                                startTransition(() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (value) params.set("q", value);
                                    else params.delete("q");
                                    router.replace(`/courses?${params.toString()}`);
                                });
                            };
                        
                            return (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={e => handleSearch(e.target.value)}
                                        placeholder="ស្វែងរកវគ្គ..."
                                        className="w-full px-4 py-2 border rounded-lg
                                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {isPending && (
                                        <span className="absolute right-3 top-2.5 text-gray-400">
                                            ⏳
                                        </span>
                                    )}
                                </div>
                            );
                        }""", "tsx",
                "useTransition() = non-blocking UI update ។ useSearchParams() ។ useRouter() Client-only ។", 2);

        sn(l3, "Mixing Server + Client", """
                        // ✅ Pattern: Server parent  →  Client child
                        // app/courses/page.tsx  (Server Component)
                        import SearchBar from "@/components/SearchBar";    // Client
                        import CourseList from "@/components/CourseList";  // Server
                        
                        export default async function CoursesPage({
                            searchParams,
                        }: {
                            searchParams: Promise<{ q?: string }>;
                        }) {
                            const { q = "" } = await searchParams;
                        
                            const res = await fetch(
                                `${process.env.API_URL}/api/v1/courses?keyword=${q}`,
                                { cache: "no-store" }
                            );
                            const json = await res.json();
                            const courses = json.data.content;
                        
                            return (
                                <div className="container mx-auto px-4 py-8">
                                    <SearchBar />               {/* Client Component */}
                                    <CourseList courses={courses} />  {/* Server Component */}
                                </div>
                            );
                        }""", "tsx",
                "Pass data ពី Server → Client via props ។ Client Component មិនអាច import Server Component ទេ ។", 3);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 4 - Data Fetching
        // ══════════════════════════════════════════════════════════════
        Chapter ch4 = ch(c, "Data Fetching Strategies", 4);

        Lesson l4 = ls(ch4, c, "SSR, SSG, ISR", 1,
                "Next.js មាន 3 strategies សម្រាប់ fetch data:\n\n" +
                        "SSR (Server Side Rendering):\n" +
                        "- fetch({ cache: 'no-store' })\n" +
                        "- HTML generate per request ។\n" +
                        "- ល្អ: real-time data, user-specific content ។\n\n" +
                        "SSG (Static Site Generation):\n" +
                        "- fetch({ cache: 'force-cache' }) or no option\n" +
                        "- HTML generate at build time ។\n" +
                        "- ល្អ: blog posts, documentation, marketing pages ។\n\n" +
                        "ISR (Incremental Static Regeneration):\n" +
                        "- fetch({ next: { revalidate: 60 } })\n" +
                        "- Regenerate page in background every N seconds ។\n" +
                        "- ល្អ: courses list, product pages ។");

        sn(l4, "Fetch Options Comparison", """
                        // ① SSR  –  fresh data on EVERY request
                        const res = await fetch(`${API}/courses`, {
                            cache: "no-store",
                        });
                        
                        // ② SSG  –  fetch ONCE at build time (fastest)
                        const res = await fetch(`${API}/courses`, {
                            cache: "force-cache",  // or omit (default)
                        });
                        
                        // ③ ISR  –  re-validate in background every 60s
                        const res = await fetch(`${API}/courses`, {
                            next: { revalidate: 60 },
                        });
                        
                        // ④ On-demand Revalidation  –  revalidate via API route
                        // app/api/revalidate/route.ts
                        import { revalidatePath, revalidateTag } from "next/cache";
                        import { NextRequest } from "next/server";
                        
                        export async function POST(req: NextRequest) {
                            const { path } = await req.json();
                            revalidatePath(path);          // revalidate a page path
                            // revalidateTag("courses");   // revalidate by tag
                            return Response.json({ revalidated: true });
                        }""", "tsx",
                "revalidatePath('/courses') = rebuild /courses page ។ revalidateTag() = tag-based cache invalidation ។", 1);

        sn(l4, "Parallel Data Fetching", """
                        // ✅ Parallel fetch (faster than sequential)
                        export default async function DashboardPage() {
                            // Both fetches start simultaneously
                            const [coursesRes, statsRes, userRes] = await Promise.all([
                                fetch(`${process.env.API_URL}/api/v1/courses`),
                                fetch(`${process.env.API_URL}/api/v1/stats`),
                                fetch(`${process.env.API_URL}/api/v1/profile`, {
                                    headers: { Authorization: `Bearer ${getToken()}` },
                                }),
                            ]);
                        
                            const [coursesJson, statsJson, userJson] = await Promise.all([
                                coursesRes.json(),
                                statsRes.json(),
                                userRes.json(),
                            ]);
                        
                            return (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
                                    <StatsCard stats={statsJson.data} />
                                    <CourseProgress courses={coursesJson.data.content} />
                                    <UserProfile user={userJson.data} />
                                </div>
                            );
                        }""", "tsx",
                "Promise.all() fetch parallel ។ sequential fetch (await 1, await 2) យឺតជាង ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 5 - Tailwind CSS Integration
        // ══════════════════════════════════════════════════════════════
        Chapter ch5 = ch(c, "Tailwind CSS Integration", 5);

        Lesson l5 = ls(ch5, c, "Tailwind CSS ក្នុង Next.js", 1,
                "Tailwind CSS utility-first framework ។ ប្រើ classes ផ្ទាល់ HTML/JSX ។\n\n" +
                        "Built-in Next.js setup ។ Responsive: sm: md: lg: xl: 2xl: ។\n\n" +
                        "Breakpoints:\n" +
                        "- sm  = 640px+\n" +
                        "- md  = 768px+\n" +
                        "- lg  = 1024px+\n" +
                        "- xl  = 1280px+\n" +
                        "- 2xl = 1536px+");

        sn(l5, "Course Card ជាមួយ Tailwind", """
                        // components/CourseCard.tsx
                        import Image from "next/image";
                        import Link from "next/link";
                        
                        interface Course {
                            id: number; title: string; slug: string;
                            description: string; level: string;
                            isFree: boolean; thumbnail: string; totalLessons: number;
                        }
                        
                        export default function CourseCard({ course }: { course: Course }) {
                            return (
                                <div className="bg-white rounded-xl shadow-md overflow-hidden
                                                hover:shadow-xl transition-all duration-300
                                                border border-gray-100 flex flex-col">
                        
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={course.thumbnail || "/placeholder.jpg"}
                                            alt={course.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width:768px) 100vw, 33vw"
                                        />
                                    </div>
                        
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-semibold px-2 py-1
                                                             bg-blue-100 text-blue-700 rounded-full">
                                                {course.level}
                                            </span>
                                            {course.isFree && (
                                                <span className="text-xs font-semibold px-2 py-1
                                                                 bg-green-100 text-green-700 rounded-full">
                                                    FREE
                                                </span>
                                            )}
                                        </div>
                        
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2
                                                       line-clamp-2 flex-1">
                                            {course.title}
                                        </h3>
                        
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                            {course.description}
                                        </p>
                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-sm text-gray-500">
                                                📚 {course.totalLessons} មេរៀន
                                            </span>
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="text-sm font-medium text-blue-600
                                                           hover:text-blue-800 transition-colors"
                                            >
                                                ចូលរៀន →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }""", "tsx",
                "next/image: fill + sizes = responsive + optimized ។ line-clamp-2 truncate long text ។", 1);

        sn(l5, "Navbar ជាមួយ Tailwind", """
                        // components/Navbar.tsx
                        "use client";
                        import Link from "next/link";
                        import { usePathname } from "next/navigation";
                        import { useState } from "react";
                        
                        const links = [
                            { href: "/",        label: "ដើម" },
                            { href: "/courses", label: "វគ្គសិក្សា" },
                            { href: "/about",   label: "អំពីយើង" },
                        ];
                        
                        export default function Navbar() {
                            const pathname = usePathname();
                            const [open, setOpen] = useState(false);
                        
                            return (
                                <nav className="bg-white shadow-sm sticky top-0 z-50">
                                    <div className="container mx-auto px-4 flex items-center
                                                    justify-between h-16">
                                        <Link href="/"
                                              className="text-xl font-bold text-blue-700">
                                            CodeKhmer
                                        </Link>
                        
                                        {/* Desktop links */}
                                        <ul className="hidden md:flex gap-6">
                                            {links.map(link => (
                                                <li key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        className={`text-sm font-medium transition-colors
                                                            ${pathname === link.href
                                                                ? "text-blue-600 border-b-2 border-blue-600"
                                                                : "text-gray-600 hover:text-blue-600"}`}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                        
                                        {/* Mobile hamburger */}
                                        <button
                                            className="md:hidden p-2"
                                            onClick={() => setOpen(!open)}
                                            aria-label="toggle menu"
                                        >
                                            <span className="block w-6 h-0.5 bg-gray-700 mb-1" />
                                            <span className="block w-6 h-0.5 bg-gray-700 mb-1" />
                                            <span className="block w-6 h-0.5 bg-gray-700" />
                                        </button>
                                    </div>
                        
                                    {/* Mobile menu */}
                                    {open && (
                                        <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
                                            {links.map(link => (
                                                <Link key={link.href} href={link.href}
                                                      onClick={() => setOpen(false)}
                                                      className="text-gray-700 hover:text-blue-600">
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </nav>
                            );
                        }""", "tsx",
                "usePathname() active link highlight ។ sticky top-0 z-50 = fixed navbar ។ responsive mobile menu ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 6 - API Routes
        // ══════════════════════════════════════════════════════════════
        Chapter ch6 = ch(c, "API Routes", 6);

        Lesson l6 = ls(ch6, c, "Route Handlers", 1,
                "Next.js API Routes = backend endpoints ក្នុង project តែមួយ ។\n\n" +
                        "App Router: app/api/**/route.ts\n\n" +
                        "Export functions ដោយ HTTP method name:\n" +
                        "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS ។\n\n" +
                        "ប្រើ NextRequest / NextResponse ។");

        sn(l6, "GET & POST Route Handler", """
                        // app/api/courses/route.ts
                        import { NextRequest, NextResponse } from "next/server";
                        
                        // GET /api/courses?page=1&size=9
                        export async function GET(req: NextRequest) {
                            const { searchParams } = req.nextUrl;
                            const page = searchParams.get("page") ?? "1";
                            const size = searchParams.get("size") ?? "9";
                        
                            try {
                                const res = await fetch(
                                    `${process.env.API_URL}/api/v1/courses?page=${page}&size=${size}`,
                                    { next: { revalidate: 60 } }
                                );
                                const data = await res.json();
                                return NextResponse.json(data);
                            } catch {
                                return NextResponse.json(
                                    { message: "Server error" },
                                    { status: 500 }
                                );
                            }
                        }
                        
                        // POST /api/courses  –  create course
                        export async function POST(req: NextRequest) {
                            const body = await req.json();
                        
                            const res = await fetch(`${process.env.API_URL}/api/v1/courses`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(body),
                            });
                        
                            const data = await res.json();
                            return NextResponse.json(data, { status: res.status });
                        }""", "tsx",
                "Route Handlers replace pages/api/ ។ export GET / POST / PUT / DELETE functions ។", 1);

        sn(l6, "Dynamic Route Handler", """
                        // app/api/courses/[slug]/route.ts
                        import { NextRequest, NextResponse } from "next/server";
                        
                        interface Params { params: Promise<{ slug: string }> }
                        
                        // GET /api/courses/:slug
                        export async function GET(req: NextRequest, { params }: Params) {
                            const { slug } = await params;
                        
                            const res = await fetch(
                                `${process.env.API_URL}/api/v1/courses/slug/${slug}/full`,
                                { cache: "no-store" }
                            );
                        
                            if (!res.ok) {
                                return NextResponse.json(
                                    { message: "Course not found" },
                                    { status: 404 }
                                );
                            }
                        
                            const data = await res.json();
                            return NextResponse.json(data);
                        }
                        
                        // DELETE /api/courses/:slug
                        export async function DELETE(req: NextRequest, { params }: Params) {
                            const { slug } = await params;
                        
                            const res = await fetch(
                                `${process.env.API_URL}/api/v1/courses/slug/${slug}`,
                                { method: "DELETE" }
                            );
                        
                            return NextResponse.json({ deleted: res.ok }, { status: res.status });
                        }""", "tsx",
                "params ជា Promise ក្នុង Next.js 15 ។ await params ជានិច្ច ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 7 - Authentication (NextAuth.js)
        // ══════════════════════════════════════════════════════════════
        Chapter ch7 = ch(c, "Authentication ជាមួយ NextAuth.js", 7);

        Lesson l7 = ls(ch7, c, "NextAuth.js Setup", 1,
                "NextAuth.js (Auth.js) គឺ authentication library ល្អបំផុតសម្រាប់ Next.js ។\n\n" +
                        "Providers: Google, GitHub, Facebook, Credentials (email/password) ។\n\n" +
                        "Session management built-in ។\n\n" +
                        "JWT + Database sessions ។");

        sn(l7, "NextAuth Setup", """
                        // 1. Install
                        // npm install next-auth
                        
                        // 2. app/api/auth/[...nextauth]/route.ts
                        import NextAuth from "next-auth";
                        import GoogleProvider from "next-auth/providers/google";
                        import CredentialsProvider from "next-auth/providers/credentials";
                        
                        const handler = NextAuth({
                            providers: [
                                GoogleProvider({
                                    clientId:     process.env.GOOGLE_CLIENT_ID!,
                                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                                }),
                                CredentialsProvider({
                                    name: "Credentials",
                                    credentials: {
                                        email:    { label: "Email",    type: "email" },
                                        password: { label: "Password", type: "password" },
                                    },
                                    async authorize(credentials) {
                                        const res = await fetch(
                                            `${process.env.API_URL}/api/v1/auth/login`,
                                            {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify(credentials),
                                            }
                                        );
                                        const user = await res.json();
                                        if (res.ok && user) return user;
                                        return null; // login fail
                                    },
                                }),
                            ],
                            pages: {
                                signIn: "/login",   // custom login page
                            },
                            callbacks: {
                                async jwt({ token, user }) {
                                    if (user) token.accessToken = (user as any).token;
                                    return token;
                                },
                                async session({ session, token }) {
                                    (session as any).accessToken = token.accessToken;
                                    return session;
                                },
                            },
                        });
                        
                        export { handler as GET, handler as POST };""", "tsx",
                "authorize() return user object = login success ។ return null = login fail ។ JWT callback store token ។", 1);

        sn(l7, "useSession & Protect Pages", """
                        // components/LoginButton.tsx  –  Client Component
                        "use client";
                        import { useSession, signIn, signOut } from "next-auth/react";
                        
                        export default function LoginButton() {
                            const { data: session, status } = useSession();
                        
                            if (status === "loading") return <p>Loading...</p>;
                        
                            if (session) {
                                return (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm">{session.user?.name}</span>
                                        <button
                                            onClick={() => signOut()}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded"
                                        >
                                            ចេញ
                                        </button>
                                    </div>
                                );
                            }
                        
                            return (
                                <button
                                    onClick={() => signIn("google")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    ចូលប្រើ
                                </button>
                            );
                        }
                        
                        // middleware.ts  –  protect routes at edge
                        import { withAuth } from "next-auth/middleware";
                        export default withAuth({
                            pages: { signIn: "/login" },
                        });
                        export const config = {
                            matcher: ["/dashboard/:path*", "/profile/:path*"],
                        };""", "tsx",
                "middleware.ts protect routes BEFORE page renders ។ matcher = routes ដែលត្រូវ protect ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 8 - next/image & next/font
        // ══════════════════════════════════════════════════════════════
        Chapter ch8 = ch(c, "Optimization: Image & Font", 8);

        Lesson l8 = ls(ch8, c, "next/image & next/font", 1,
                "next/image: automatic image optimization ។\n" +
                        "- WebP conversion, lazy loading, responsive sizes ។\n" +
                        "- ចាំបាច់ declare remote domains ក្នុង next.config.js ។\n\n" +
                        "next/font: zero layout shift font loading ។\n" +
                        "- Google Fonts built-in ។\n" +
                        "- Self-hosted fonts ។");

        sn(l8, "next/image Usage", """
                        // next.config.js  –  allow remote images
                        /** @type {import('next').NextConfig} */
                        const nextConfig = {
                            images: {
                                remotePatterns: [
                                    {
                                        protocol: "https",
                                        hostname:  "res.cloudinary.com",
                                    },
                                    {
                                        protocol: "https",
                                        hostname:  "lh3.googleusercontent.com", // Google avatars
                                    },
                                ],
                            },
                        };
                        module.exports = nextConfig;
                        
                        // components/CourseCard.tsx  –  next/image examples
                        import Image from "next/image";
                        
                        // ① Fixed size image
                        <Image src="/logo.png" alt="Logo" width={120} height={40} />
                        
                        // ② Fill parent container (responsive)
                        <div className="relative h-48 w-full">
                            <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw,
                                       (max-width: 1024px) 50vw,
                                       33vw"
                                priority={false}   // true for above-the-fold images
                            />
                        </div>
                        
                        // ③ Avatar / round image
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                src={user.avatar ?? "/default-avatar.png"}
                                alt={user.name}
                                fill
                                className="object-cover"
                            />
                        </div>""", "tsx",
                "sizes prop ជួយ browser ជ្រើសរើស image size ត្រឹមត្រូ វ ។ priority=true for LCP images ។", 1);

        sn(l8, "next/font Usage", """
                        // app/layout.tsx  –  Google Fonts (zero layout shift)
                        import { Inter, Battambang } from "next/font/google";
                        
                        const inter = Inter({
                            subsets: ["latin"],
                            variable: "--font-inter",
                            display: "swap",
                        });
                        
                        const battambang = Battambang({
                            weight: ["400", "700"],
                            subsets: ["khmer"],
                            variable: "--font-battambang",
                            display: "swap",
                        });
                        
                        export default function RootLayout({ children }) {
                            return (
                                <html lang="km"
                                      className={`${inter.variable} ${battambang.variable}`}>
                                    <body className="font-battambang">
                                        {children}
                                    </body>
                                </html>
                            );
                        }
                        
                        // tailwind.config.ts  –  register custom font variables
                        const config = {
                            theme: {
                                extend: {
                                    fontFamily: {
                                        inter:      ["var(--font-inter)", "sans-serif"],
                                        battambang: ["var(--font-battambang)", "sans-serif"],
                                    },
                                },
                            },
                        };""", "tsx",
                "Battambang / Khmer font ប្រើ subsets: ['khmer'] ។ variable CSS custom property = Tailwind integration ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 9 - Environment Variables & Deployment
        // ══════════════════════════════════════════════════════════════
        Chapter ch9 = ch(c, "Environment Variables & Deployment", 9);

        Lesson l9 = ls(ch9, c, "Env Vars & Deploy to Vercel", 1,
                """
                        Environment Variables:
                        - .env.local     = local dev (git ignored)
                        - .env.production = production
                        - NEXT_PUBLIC_*  = exposed to browser
                        - Without prefix = server-only (secure)
                        
                        Deploy to Vercel:
                        - Push to GitHub → Vercel auto-deploy ។
                        - Set env vars in Vercel dashboard ។
                        - Preview deployments for every PR ។""");

        sn(l9, "Environment Variables", """
                        # .env.local  –  local development
                        API_URL=http://localhost:8080
                        NEXTAUTH_SECRET=your-random-secret-here
                        NEXTAUTH_URL=http://localhost:3000
                        GOOGLE_CLIENT_ID=your-google-client-id
                        GOOGLE_CLIENT_SECRET=your-google-client-secret
                        
                        # NEXT_PUBLIC_* = accessible in browser
                        NEXT_PUBLIC_APP_NAME=CodeKhmerLearning
                        NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
                        
                        // Usage in code
                        // Server-side (secure)
                        const apiUrl = process.env.API_URL;
                        
                        // Client-side (public)
                        const appName = process.env.NEXT_PUBLIC_APP_NAME;
                        
                        // lib/config.ts  –  typed config helper
                        export const config = {
                            apiUrl:  process.env.API_URL!,
                            appName: process.env.NEXT_PUBLIC_APP_NAME!,
                        } as const;""", "bash",
                "NEXT_PUBLIC_ prefix = ត្រូ វបាន bundle ទៅ browser ។ ដាក់ secrets server-only (no prefix) ។", 1);

        sn(l9, "Deploy to Vercel", """
                        # ① Push code to GitHub
                        git add .
                        git commit -m "feat: initial Next.js app"
                        git push origin main
                        
                        # ② Import project at vercel.com
                        #    → connect GitHub repo
                        #    → Vercel auto-detects Next.js
                        
                        # ③ Add Environment Variables in Vercel dashboard:
                        #    API_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ...
                        
                        # ④ Deploy  →  Vercel gives you:
                        #    https://your-app.vercel.app
                        
                        # ⑤ Custom domain (optional)
                        #    Vercel Dashboard → Domains → Add domain
                        
                        # ──────────────────────────────────────
                        # Vercel CLI (optional local deploy)
                        npm i -g vercel
                        vercel login
                        vercel          # preview deploy
                        vercel --prod   # production deploy""", "bash",
                "Vercel = best platform for Next.js (same company) ។ Free tier generous ។ Preview URL per branch ។", 2);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. JAVA
    // ══════════════════════════════════════════════════════════════════════════
    // ══════════════════════════════════════════════════════════════════════════
    // 6. JAVA
    // ══════════════════════════════════════════════════════════════════════════
    private void seedJava(User ins, Category cat) {
        Course c = course("Java ជាភាសាខ្មែរ", "java-for-beginners-ជាភាសាខ្មែរ",
                "រៀន Java OOP, Collections, Exception Handling, Generics, " +
                        "Interfaces, Lambdas, Stream API ជាភាសាខ្មែរ ។",
                "BEGINNER", true, ins, cat);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 1 - ការណែនាំ & Data Types
        // ══════════════════════════════════════════════════════════════
        Chapter ch1 = ch(c, "ការណែនាំ & Data Types", 1);

        Lesson l1 = ls(ch1, c, "Java គឺជាអ្វី?", 1,
                "Java ជា OOP language by Sun Microsystems (1995) ។\n\n" +
                        "Write Once Run Anywhere (WORA) ។ JVM run Java bytecode ។\n\n" +
                        "ប្រើក្នុង: Android apps, Web (Spring Boot), Enterprise, Big Data ។\n\n" +
                        "Java ដំណើរការ:\n" +
                        "① Source code (.java) → compile → Bytecode (.class)\n" +
                        "② JVM (Java Virtual Machine) run bytecode\n" +
                        "③ Output ចេញលទ្ធផល ។\n\n" +
                        "JDK vs JRE vs JVM:\n" +
                        "- JDK = Java Development Kit (compile + run)\n" +
                        "- JRE = Java Runtime Environment (run only)\n" +
                        "- JVM = Java Virtual Machine (execute bytecode)");

        sn(l1, "Hello World", """
                        // HelloWorld.java
                        public class HelloWorld {
                            public static void main(String[] args) {
                                System.out.println("សួស្តី ពិភពលោក!");
                                System.out.println("Welcome to Java");
                        
                                // Variables
                                String name = "ដារ៉ា";
                                int    age  = 22;
                                System.out.printf("ឈ្មោះ: %s, អាយុ: %d%n", name, age);
                            }
                        }""", "java",
                "class name ត្រូវ match filename ។ main() ជា entry point ។ System.out.println() print + newline ។", 1);

        sn(l1, "Java Setup", """
                        # ① Download & install JDK 21 (LTS)
                        # https://adoptium.net
                        
                        # ② Verify installation
                        java  -version   # java 21.0.x
                        javac -version   # javac 21.0.x
                        
                        # ③ Compile & run manually
                        javac HelloWorld.java   # → HelloWorld.class
                        java  HelloWorld        # run
                        
                        # ④ Or use IDE: IntelliJ IDEA (recommended)
                        #   File → New Project → Java
                        #   SDK: Java 21""", "bash",
                "ប្រើ JDK 21 LTS ។ IntelliJ IDEA ជា IDE ល្អបំផុតសម្រាប់ Java ។", 2);

        Lesson l2 = ls(ch1, c, "Data Types & Variables", 2,
                "Java strongly typed: ត្រូវ declare type ។\n\n" +
                        "Primitive types (8 ប្រភេទ):\n" +
                        "- byte   (8-bit):   -128 to 127\n" +
                        "- short  (16-bit):  -32,768 to 32,767\n" +
                        "- int    (32-bit):  -2B to 2B\n" +
                        "- long   (64-bit):  -9Q to 9Q  (suffix L)\n" +
                        "- float  (32-bit):  decimal    (suffix f)\n" +
                        "- double (64-bit):  decimal\n" +
                        "- boolean:          true/false\n" +
                        "- char   (16-bit):  single character\n\n" +
                        "Reference types: String, Array, Object ។\n\n" +
                        "var keyword (Java 10+): local type inference ។");

        sn(l2, "Java Data Types", """
                        public class DataTypes {
                            public static void main(String[] args) {
                                // Primitives
                                int     age     = 22;
                                long    bigNum  = 9_000_000_000L;   // L suffix
                                double  price   = 9.99;
                                float   rating  = 4.8f;             // f suffix
                                boolean active  = true;
                                char    grade   = 'A';
                        
                                // Type casting
                                int    x = (int) 9.99;   // explicit: 9
                                double y = age;           // implicit (widening)
                        
                                // String (Reference type)
                                String name    = "ដារ៉ា";
                                String message = "ឈ្មោះ: " + name;
                        
                                // String methods
                                System.out.println(name.length());          // 3
                                System.out.println(name.toUpperCase());
                                System.out.println("  hello  ".trim());     // "hello"
                                System.out.println(name.contains("ារ"));    // true
                                System.out.println(name.substring(0, 2));   // "ដារ"
                                System.out.println(name.replace("ដារ", "ស្រ")); // ស្រ៉ា
                        
                                // String.format / formatted (Java 15+)
                                String info = "ឈ្មោះ: %s, អាយុ: %d".formatted(name, age);
                        
                                // var (Java 10+) — type inference (local only)
                                var courses = "HTML, CSS, Java";
                                var count   = 42;
                        
                                // Constants
                                final double PI    = 3.14159;
                                final int    LIMIT = 100;
                            }
                        }""", "java",
                "String ជា immutable Object ។ var (Java 10+) infer type ។ final = constant ។", 1);

        sn(l2, "String Methods Deep Dive", """
                        public class StringMethods {
                            public static void main(String[] args) {
                                String s = "Code Khmer Learning Java";
                        
                                // Inspection
                                System.out.println(s.length());            // 24
                                System.out.println(s.isEmpty());           // false
                                System.out.println(s.isBlank());           // false
                                System.out.println(s.startsWith("Code"));  // true
                                System.out.println(s.endsWith("Java"));    // true
                                System.out.println(s.indexOf("Khmer"));    // 5
                        
                                // Transform
                                System.out.println(s.toLowerCase());
                                System.out.println(s.toUpperCase());
                                System.out.println(s.replace("Java", "Spring"));
                                System.out.println(s.trim());
                        
                                // Split & Join
                                String[] words = s.split(" ");   // ["Code","Khmer","Learning","Java"]
                                String joined = String.join("-", words); // Code-Khmer-Learning-Java
                        
                                // StringBuilder (mutable string)
                                StringBuilder sb = new StringBuilder();
                                sb.append("Hello");
                                sb.append(" ");
                                sb.append("ពិភពលោក");
                                sb.insert(5, ",");          // "Hello, ពិភពលោក"
                                System.out.println(sb.toString());
                        
                                // JSON format
                                String json = "{\\n" +
                                              "  \\"name\\": \\"ដារ៉ា\\",\\n" +
                                              "  \\"age\\": 22\\n" +
                                              "}";
                                System.out.println(json);
                            }
                        }""", "java",
                "StringBuilder ល្អជាង String concatenation (+) ក្នុង loop ។ Text Block Java 15+ ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 2 - Control Flow & Loops
        // ══════════════════════════════════════════════════════════════
        Chapter ch2 = ch(c, "Control Flow & Loops", 2);

        Lesson l3 = ls(ch2, c, "if/else, switch & Loops", 1,
                "if/else, switch expression (Java 14+) ។\n\n" +
                        "for, while, do-while, for-each loop ។\n\n" +
                        "break, continue, labeled break ។");

        sn(l3, "Control Flow", """
                        public class ControlFlow {
                            public static void main(String[] args) {
                        
                                // if-else
                                int score = 85;
                                if      (score >= 90) System.out.println("A - ឆ្នើម");
                                else if (score >= 80) System.out.println("B - ល្អ");
                                else if (score >= 70) System.out.println("C - មធ្យម");
                                else                  System.out.println("F - ធ្លាក់");
                        
                                // Ternary operator
                                String result = score >= 50 ? "✅ បាន" : "❌ ធ្លាក់";
                        
                                // Switch Expression (Java 14+)
                                String day = "MONDAY";
                                String period = switch (day) {
                                    case "MONDAY", "TUESDAY", "WEDNESDAY" -> "ដើមសប្ដាហ៍";
                                    case "THURSDAY", "FRIDAY"             -> "ចុងសប្ដាហ៍";
                                    case "SATURDAY", "SUNDAY"             -> "ថ្ងៃឈប់";
                                    default -> "?";
                                };
                                System.out.println(day + " = " + period);
                        
                                // Switch with yield (return value inside block)
                                int numDay = 3;
                                String label = switch (numDay) {
                                    case 1 -> "ច័ន្ទ";
                                    case 2 -> "អង្គារ";
                                    case 3 -> {
                                        String s = "ពុធ";
                                        yield s.toUpperCase(); // yield ជំនួស return
                                    }
                                    default -> "ថ្ងៃផ្សេង";
                                };
                            }
                        }""", "java",
                "Switch expression Java 14+ ។ yield ប្រើក្នុង switch block ។ Ternary សម្រប់ simple conditions ។", 1);

        sn(l3, "Loops", """
                        public class Loops {
                            public static void main(String[] args) {
                        
                                // for loop
                                for (int i = 1; i <= 5; i++) {
                                    System.out.println("i = " + i);
                                }
                        
                                // for-each (enhanced for)
                                String[] langs = {"HTML", "CSS", "Java", "Spring"};
                                for (String lang : langs) {
                                    System.out.println("📚 " + lang);
                                }
                        
                                // while loop
                                int n = 10;
                                while (n > 0) {
                                    System.out.print(n + " ");
                                    n -= 2;
                                }
                        
                                // do-while (execute at least once)
                                int count = 0;
                                do {
                                    System.out.println("count = " + count);
                                    count++;
                                } while (count < 3);
                        
                                // break & continue
                                for (int i = 0; i < 10; i++) {
                                    if (i == 3) continue;  // skip 3
                                    if (i == 7) break;     // stop at 7
                                    System.out.print(i + " "); // 0 1 2 4 5 6
                                }
                        
                                // Nested loop with labeled break
                                outer:
                                for (int i = 0; i < 3; i++) {
                                    for (int j = 0; j < 3; j++) {
                                        if (i == 1 && j == 1) break outer; // exit both loops
                                        System.out.println(i + "," + j);
                                    }
                                }
                            }
                        }""", "java",
                "do-while ដំណើរការ loop យ៉ាងហោចណាស់ 1 ដង ។ labeled break exit nested loops ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 3 - Methods & Arrays
        // ══════════════════════════════════════════════════════════════
        Chapter ch3 = ch(c, "Methods & Arrays", 3);

        Lesson l4 = ls(ch3, c, "Methods", 1,
                "Method = reusable block of code ។\n\n" +
                        "Signature: returnType methodName(params) ។\n\n" +
                        "Overloading: same name, different params ។\n\n" +
                        "Varargs: variable number of arguments ។\n\n" +
                        "Static vs Instance methods ។");

        sn(l4, "Methods Deep Dive", """
                        public class MethodsDemo {
                        
                            // Static method (no object needed)
                            public static int add(int a, int b) {
                                return a + b;
                            }
                        
                            // Overloading (same name, different params)
                            public static double add(double a, double b) { return a + b; }
                            public static int    add(int a, int b, int c) { return a + b + c; }
                        
                            // Varargs (variable arguments)
                            public static int sum(int... numbers) {
                                int total = 0;
                                for (int n : numbers) total += n;
                                return total;
                            }
                        
                            // Return multiple values via array
                            public static int[] minMax(int[] arr) {
                                int min = arr[0], max = arr[0];
                                for (int n : arr) {
                                    if (n < min) min = n;
                                    if (n > max) max = n;
                                }
                                return new int[]{min, max};
                            }
                        
                            // Recursive method
                            public static int factorial(int n) {
                                if (n <= 1) return 1;
                                return n * factorial(n - 1); // recursive call
                            }
                        
                            // Recursive: Fibonacci
                            public static int fib(int n) {
                                if (n <= 1) return n;
                                return fib(n - 1) + fib(n - 2);
                            }
                        
                            public static void main(String[] args) {
                                System.out.println(add(3, 4));           // 7
                                System.out.println(add(1.5, 2.5));       // 4.0
                                System.out.println(sum(1, 2, 3, 4, 5));  // 15
                                System.out.println(factorial(5));         // 120
                                System.out.println(fib(10));              // 55
                        
                                int[] result = minMax(new int[]{5, 3, 8, 1, 9});
                                System.out.println("Min=" + result[0] + " Max=" + result[1]);
                            }
                        }""", "java",
                "Overloading = same name, different signatures ។ Varargs int... = flexible params ។", 1);

        Lesson l5 = ls(ch3, c, "Arrays", 2,
                "Array = fixed-size collection ។\n\n" +
                        "1D Array: int[] arr = new int[5] ។\n" +
                        "2D Array (Matrix): int[][] matrix ។\n\n" +
                        "Arrays utility class: sort, binarySearch, copyOf, fill ។");

        sn(l5, "Arrays", """
                        import java.util.Arrays;
                        
                        public class ArraysDemo {
                            public static void main(String[] args) {
                        
                                // 1D Array
                                int[] scores = {95, 78, 88, 92, 65};
                        
                                // Access & modify
                                System.out.println(scores[0]);       // 95
                                scores[4] = 70;
                                System.out.println(scores.length);   // 5
                        
                                // Iterate
                                for (int s : scores) System.out.print(s + " ");
                        
                                // Arrays utility
                                Arrays.sort(scores);                          // [65,70,78,88,92,95]
                                System.out.println(Arrays.toString(scores));
                                int idx = Arrays.binarySearch(scores, 88);   // index after sort
                                int[] copy = Arrays.copyOf(scores, 3);       // [65,70,78]
                                int[] range = Arrays.copyOfRange(scores, 1, 4); // [70,78,88]
                                int[] filled = new int[5];
                                Arrays.fill(filled, 0);                      // [0,0,0,0,0]
                        
                                // 2D Array (Matrix)
                                int[][] matrix = {
                                    {1, 2, 3},
                                    {4, 5, 6},
                                    {7, 8, 9}
                                };
                        
                                // Iterate 2D
                                for (int i = 0; i < matrix.length; i++) {
                                    for (int j = 0; j < matrix[i].length; j++) {
                                        System.out.printf("%3d", matrix[i][j]);
                                    }
                                    System.out.println();
                                }
                        
                                // String array
                                String[] names = {"ដារ៉ា", "សុភាព", "វណ្ណា"};
                                Arrays.sort(names); // alphabetical
                                System.out.println(Arrays.toString(names));
                            }
                        }""", "java",
                "Arrays.sort() in-place sort ។ Arrays.toString() print array ។ 2D array ជា array of arrays ។", 1);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 4 - OOP: Classes & Objects
        // ══════════════════════════════════════════════════════════════
        Chapter ch4 = ch(c, "OOP - Classes & Objects", 4);

        Lesson l6 = ls(ch4, c, "Classes, Objects & Encapsulation", 1,
                "Class ជា blueprint ។ Object ជា instance ។\n\n" +
                        "Encapsulation: private fields + public getters/setters ។\n\n" +
                        "Constructor: initialize object ។\n\n" +
                        "this keyword: reference current object ។\n\n" +
                        "Record (Java 16+): immutable data class shorthand ។");

        sn(l6, "Class & Object", """
                        // Course.java
                        public class Course {
                            private Long    id;
                            private String  title;
                            private String  level;
                            private boolean isFree;
                        
                            // No-arg constructor
                            public Course() {}
                        
                            // All-args constructor
                            public Course(Long id, String title, String level, boolean isFree) {
                                this.id     = id;
                                this.title  = title;
                                this.level  = level;
                                this.isFree = isFree;
                            }
                        
                            // Getters
                            public Long    getId()    { return id; }
                            public String  getTitle() { return title; }
                            public String  getLevel() { return level; }
                            public boolean isFree()   { return isFree; }
                        
                            // Setter with validation
                            public void setTitle(String title) {
                                if (title == null || title.isBlank())
                                    throw new IllegalArgumentException("Title cannot be blank");
                                this.title = title;
                            }
                        
                            // Business method
                            public String getInfo() {
                                return "[%s] %s (%s)".formatted(level, title, isFree ? "FREE" : "PAID");
                            }
                        
                            @Override
                            public String toString() {
                                return "Course{id=%d, title='%s', level='%s'}".formatted(id, title, level);
                            }
                        }
                        
                        // Main.java
                        public class Main {
                            public static void main(String[] args) {
                                Course html  = new Course(1L, "HTML for Beginners", "BEGINNER",     true);
                                Course react = new Course(2L, "React.js",           "INTERMEDIATE", false);
                        
                                System.out.println(html.getInfo());   // [BEGINNER] HTML for Beginners (FREE)
                                System.out.println(react);            // Course{id=2, title='React.js'...}
                        
                                html.setTitle("HTML & CSS Basics");
                                System.out.println(html.getTitle());
                            }
                        }""", "java",
                "private fields = Encapsulation ។ setter validation ការពារ bad data ។ toString() override for readability ។", 1);

        sn(l6, "Record (Java 16+)", """
                        // Record = immutable data class (auto: constructor, getters, equals, hashCode, toString)
                        public record CourseRecord(Long id, String title, String level, boolean isFree) {
                        
                            // Compact canonical constructor (validation)
                            public CourseRecord {
                                if (title == null || title.isBlank())
                                    throw new IllegalArgumentException("Title required");
                            }
                        
                            // Custom method
                            public String badge() {
                                return isFree ? "FREE" : "PAID";
                            }
                        }
                        
                        // Usage
                        CourseRecord r = new CourseRecord(1L, "Java", "BEGINNER", true);
                        System.out.println(r.title());   // accessor (no get prefix)
                        System.out.println(r.badge());   // FREE
                        System.out.println(r);           // CourseRecord[id=1, title=Java, ...]
                        
                        // Records are immutable (no setters)
                        // Create modified copy using withers (manual):
                        CourseRecord updated = new CourseRecord(r.id(), "Java Advanced", r.level(), false);""", "java",
                "Record (Java 16+) ជំនួស POJO class ។ compact, immutable, ល្អសម្រាប់ DTOs ។", 2);

        Lesson l7 = ls(ch4, c, "Inheritance & Polymorphism", 2,
                "extends: inherit from parent class ។ @Override: override parent method ។\n\n" +
                        "Polymorphism: same method name, different behavior by object type ។\n\n" +
                        "super(): call parent constructor/method ។\n\n" +
                        "final class: cannot be extended ។ abstract class: cannot be instantiated ។");

        sn(l7, "Inheritance", """
                        // Animal.java (parent)
                        public class Animal {
                            protected String name;
                            protected int    age;
                        
                            public Animal(String name, int age) {
                                this.name = name;
                                this.age  = age;
                            }
                        
                            public void sound() {
                                System.out.println(name + " ធ្វើសំឡេង...");
                            }
                        
                            public String getInfo() { return name + " (អាយុ " + age + ")"; }
                        }
                        
                        // Dog.java (child)
                        public class Dog extends Animal {
                            private String breed;
                        
                            public Dog(String name, int age, String breed) {
                                super(name, age); // ① call parent constructor first
                                this.breed = breed;
                            }
                        
                            @Override
                            public void sound() {
                                System.out.println(name + ": ប! ប! ប!");
                            }
                        
                            @Override
                            public String getInfo() {
                                return super.getInfo() + " [" + breed + "]"; // ② call parent method
                            }
                        
                            // Dog-specific method
                            public void fetch() {
                                System.out.println(name + " ចាប់បាល់!");
                            }
                        }
                        
                        // Cat.java (child)
                        public class Cat extends Animal {
                            public Cat(String name, int age) { super(name, age); }
                        
                            @Override
                            public void sound() { System.out.println(name + ": ម៉ូ! ម៉ូ!"); }
                        }
                        
                        // Polymorphism
                        Animal[] animals = {
                            new Dog("ប៊ូប៊ូ", 2, "Golden"),
                            new Cat("មីមី", 1),
                            new Dog("ម៉ាក្ស", 3, "Husky"),
                        };
                        
                        for (Animal a : animals) {
                            a.sound();              // calls Dog.sound() or Cat.sound()
                            System.out.println(a.getInfo());
                            if (a instanceof Dog d) {  // Pattern matching (Java 16+)
                                d.fetch();
                            }
                        }""", "java",
                "super() ត្រូវវាង line ដំបូង constructor ។ instanceof pattern matching Java 16+ ។", 1);

        sn(l7, "Abstract Class", """
                        // Abstract class: cannot instantiate, defines template
                        public abstract class Shape {
                            protected String color;
                        
                            public Shape(String color) { this.color = color; }
                        
                            // Abstract method: subclass MUST implement
                            public abstract double area();
                            public abstract double perimeter();
                        
                            // Concrete method: shared behavior
                            public void printInfo() {
                                System.out.printf("Shape: %s | Color: %s | Area: %.2f%n",
                                    getClass().getSimpleName(), color, area());
                            }
                        }
                        
                        public class Circle extends Shape {
                            private double radius;
                        
                            public Circle(String color, double radius) {
                                super(color);
                                this.radius = radius;
                            }
                        
                            @Override public double area()      { return Math.PI * radius * radius; }
                            @Override public double perimeter() { return 2 * Math.PI * radius; }
                        }
                        
                        public class Rectangle extends Shape {
                            private double width, height;
                        
                            public Rectangle(String color, double width, double height) {
                                super(color);
                                this.width = width; this.height = height;
                            }
                        
                            @Override public double area()      { return width * height; }
                            @Override public double perimeter() { return 2 * (width + height); }
                        }
                        
                        // Usage
                        Shape[] shapes = {
                            new Circle("ក្រហម", 5),
                            new Rectangle("ខៀវ", 4, 6),
                        };
                        for (Shape s : shapes) s.printInfo();""", "java",
                "abstract class = partial implementation ។ subclass MUST implement all abstract methods ។", 2);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 5 - Interface & Generics
        // ══════════════════════════════════════════════════════════════
        Chapter ch5 = ch(c, "Interface & Generics", 5);

        Lesson l8 = ls(ch5, c, "Interfaces", 1,
                "Interface: contract ។ class implements interface ។\n\n" +
                        "Java supports multiple interface implementation ។\n\n" +
                        "Default method (Java 8+): interface method with body ។\n\n" +
                        "Functional Interface: 1 abstract method → Lambda ។");

        sn(l8, "Interface", """
                        // Printable.java
                        public interface Printable {
                            void print(); // abstract by default
                        }
                        
                        // Saveable.java
                        public interface Saveable {
                            void save();
                        
                            // Default method (Java 8+)
                            default void saveAndPrint() {
                                save();
                                System.out.println("✅ Saved!");
                            }
                        }
                        
                        // Document implements multiple interfaces
                        public class Document implements Printable, Saveable {
                            private String content;
                        
                            public Document(String content) { this.content = content; }
                        
                            @Override public void print() { System.out.println("📄 " + content); }
                            @Override public void save()  { System.out.println("💾 Saving: " + content); }
                        }
                        
                        // ── Comparable interface (sorting) ──
                        public class Student implements Comparable<Student> {
                            String name;
                            double gpa;
                        
                            public Student(String name, double gpa) {
                                this.name = name; this.gpa = gpa;
                            }
                        
                            @Override
                            public int compareTo(Student other) {
                                return Double.compare(other.gpa, this.gpa); // desc by GPA
                            }
                        
                            @Override
                            public String toString() { return name + " (" + gpa + ")"; }
                        }
                        
                        // Usage
                        List<Student> students = new ArrayList<>(List.of(
                            new Student("ដារ៉ា",  3.9),
                            new Student("សុភាព", 3.7),
                            new Student("វណ្ណា", 4.0)
                        ));
                        Collections.sort(students);
                        System.out.println(students); // [វណ្ណា (4.0), ដារ៉ា (3.9), សុភាព (3.7)]""", "java",
                "Multiple interfaces implementation ។ Comparable ប្រើ Collections.sort() ។", 1);

        Lesson l9 = ls(ch5, c, "Generics", 2,
                "Generics <T>: write code that works with any type ។\n\n" +
                        "Type safety: catch errors at compile time ។\n\n" +
                        "Generic class, Generic method, Bounded type parameter ។\n\n" +
                        "Wildcard: <?>, <? extends T>, <? super T> ។");

        sn(l9, "Generics", """
                        // Generic class
                        public class ApiResponse<T> {
                            private boolean success;
                            private String  message;
                            private T       data;
                        
                            public ApiResponse(boolean success, String message, T data) {
                                this.success = success;
                                this.message = message;
                                this.data    = data;
                            }
                        
                            public static <T> ApiResponse<T> ok(T data) {
                                return new ApiResponse<>(true, "Success", data);
                            }
                        
                            public static <T> ApiResponse<T> error(String message) {
                                return new ApiResponse<>(false, message, null);
                            }
                        
                            // Getters
                            public boolean isSuccess() { return success; }
                            public String  getMessage(){ return message; }
                            public T       getData()   { return data; }
                        
                            @Override
                            public String toString() {
                                return "ApiResponse{success=%b, message='%s', data=%s}"
                                    .formatted(success, message, data);
                            }
                        }
                        
                        // Generic method
                        public static <T extends Comparable<T>> T max(T a, T b) {
                            return a.compareTo(b) >= 0 ? a : b;
                        }
                        
                        // Generic Stack
                        public class Stack<T> {
                            private List<T> items = new ArrayList<>();
                        
                            public void   push(T item)   { items.add(item); }
                            public T      pop()          { return items.remove(items.size() - 1); }
                            public T      peek()         { return items.get(items.size() - 1); }
                            public boolean isEmpty()     { return items.isEmpty(); }
                            public int     size()        { return items.size(); }
                        }
                        
                        // Usage
                        ApiResponse<Course> res = ApiResponse.ok(new Course(1L, "Java", "BEGINNER", true));
                        System.out.println(res);
                        
                        System.out.println(max(10, 20));          // 20
                        System.out.println(max("Apple", "Mango")); // Mango
                        
                        Stack<Integer> stack = new Stack<>();
                        stack.push(1); stack.push(2); stack.push(3);
                        System.out.println(stack.pop()); // 3""", "java",
                "Generic class <T> = reusable type-safe container ។ Bounded <T extends Comparable<T>> ។", 1);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 6 - Collections & Stream API
        // ══════════════════════════════════════════════════════════════
        Chapter ch6 = ch(c, "Collections & Stream API", 6);

        Lesson l10 = ls(ch6, c, "List, Map & Set", 1,
                "Collections Framework:\n" +
                        "- List: ordered, duplicates allowed (ArrayList, LinkedList)\n" +
                        "- Set: no duplicates (HashSet, TreeSet, LinkedHashSet)\n" +
                        "- Map: key-value pairs (HashMap, TreeMap, LinkedHashMap)\n" +
                        "- Queue / Deque: FIFO/LIFO structures\n\n" +
                        "Collections utility class: sort, reverse, shuffle, frequency ។\n\n" +
                        "Immutable collections: List.of(), Map.of() (Java 9+) ។");

        sn(l10, "List & Set", """
                        import java.util.*;
                        
                        public class CollectionsDemo {
                            public static void main(String[] args) {
                        
                                // ArrayList (resizable array)
                                List<String> courses = new ArrayList<>(
                                    List.of("HTML", "CSS", "JavaScript", "React", "Java", "Spring Boot"));
                        
                                courses.add("Next.js");          // append
                                courses.add(0, "Git");           // insert at index
                                courses.remove("CSS");           // by value
                                courses.remove(0);               // by index
                                System.out.println(courses.size());        // size
                                System.out.println(courses.contains("Java")); // true
                                System.out.println(courses.get(2));        // get by index
                        
                                // Sorting
                                Collections.sort(courses);
                                Collections.sort(courses, Comparator.comparingInt(String::length)); // by length
                        
                                // LinkedList as Queue (FIFO)
                                Queue<String> queue = new LinkedList<>();
                                queue.offer("task1"); queue.offer("task2");
                                System.out.println(queue.poll());  // task1 (remove head)
                                System.out.println(queue.peek());  // task2 (peek head)
                        
                                // ── Set ──
                                Set<String> skills = new HashSet<>();
                                skills.add("Java"); skills.add("React"); skills.add("Java"); // dup ignored
                                System.out.println(skills.size()); // 2
                        
                                // LinkedHashSet maintains insertion order
                                Set<String> ordered = new LinkedHashSet<>(List.of("C", "A", "B"));
                                System.out.println(ordered); // [C, A, B]
                        
                                // TreeSet sorts automatically
                                Set<Integer> sorted = new TreeSet<>(Set.of(5, 1, 3, 2, 4));
                                System.out.println(sorted); // [1, 2, 3, 4, 5]
                            }
                        }""", "java",
                "ArrayList ល្អ random access ។ LinkedList ល្អ insert/remove ។ TreeSet auto-sort ។", 1);

        sn(l10, "HashMap & TreeMap", """
                        import java.util.*;
                        import java.util.stream.*;
                        
                        public class MapDemo {
                            public static void main(String[] args) {
                        
                                // HashMap (key-value, unordered)
                                Map<String, Integer> scores = new HashMap<>();
                                scores.put("ដារ៉ា",  95);
                                scores.put("សុភាព", 88);
                                scores.put("វណ្ណា", 92);
                        
                                // Access
                                System.out.println(scores.get("ដារ៉ា")); // 95
                                System.out.println(scores.getOrDefault("ចន្ទ", 0)); // 0
                                System.out.println(scores.containsKey("សុភាព")); // true
                        
                                // Iterate
                                for (Map.Entry<String, Integer> e : scores.entrySet()) {
                                    System.out.println(e.getKey() + ": " + e.getValue());
                                }
                        
                                // computeIfAbsent, merge
                                scores.computeIfAbsent("ចន្ទ", k -> 75);     // add if absent
                                scores.merge("ដារ៉ា", 5, Integer::sum);      // 95 + 5 = 100
                        
                                // Sort by value descending
                                scores.entrySet().stream()
                                    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                                    .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));
                        
                                // TreeMap (sorted by key)
                                Map<String, String> tm = new TreeMap<>(scores.entrySet().stream()
                                    .collect(Collectors.toMap(Map.Entry::getKey,
                                                              e -> e.getValue() + " points")));
                                System.out.println(tm); // alphabetical keys
                            }
                        }""", "java",
                "getOrDefault() ការពារ NullPointerException ។ merge() update or insert ។", 2);

        Lesson l11 = ls(ch6, c, "Stream API", 2,
                "Stream API (Java 8+): functional operations on collections ។\n\n" +
                        "Intermediate: filter, map, flatMap, sorted, distinct, limit, skip ។\n" +
                        "Terminal: collect, forEach, count, reduce, findFirst, anyMatch ។\n\n" +
                        "Parallel Stream: parallelStream() for large data ។");

        sn(l11, "Stream API", """
                        import java.util.*;
                        import java.util.stream.*;
                        
                        public class StreamDemo {
                            record Student(String name, String level, double gpa) {}
                        
                            public static void main(String[] args) {
                                List<Student> students = List.of(
                                    new Student("ដារ៉ា",  "BEGINNER",     3.9),
                                    new Student("សុភាព", "INTERMEDIATE", 3.7),
                                    new Student("វណ្ណា", "ADVANCED",     4.0),
                                    new Student("ចន្ទ",   "BEGINNER",     3.5),
                                    new Student("ស្រី",   "INTERMEDIATE", 3.8)
                                );
                        
                                // filter + map + collect
                                List<String> beginners = students.stream()
                                    .filter(s -> s.level().equals("BEGINNER"))
                                    .map(Student::name)
                                    .sorted()
                                    .collect(Collectors.toList());
                                System.out.println("Beginners: " + beginners);
                        
                                // count
                                long highGpa = students.stream()
                                    .filter(s -> s.gpa() >= 3.8)
                                    .count();
                                System.out.println("GPA ≥ 3.8: " + highGpa); // 3
                        
                                // reduce
                                double totalGpa = students.stream()
                                    .mapToDouble(Student::gpa)
                                    .sum();
                                OptionalDouble avgGpa = students.stream()
                                    .mapToDouble(Student::gpa)
                                    .average();
                                System.out.printf("Avg GPA: %.2f%n", avgGpa.orElse(0));
                        
                                // groupingBy
                                Map<String, List<Student>> byLevel = students.stream()
                                    .collect(Collectors.groupingBy(Student::level));
                                byLevel.forEach((level, list) ->
                                    System.out.println(level + ": " + list.size() + " students"));
                        
                                // findFirst & anyMatch
                                Optional<Student> top = students.stream()
                                    .max(Comparator.comparingDouble(Student::gpa));
                                top.ifPresent(s -> System.out.println("Top: " + s.name()));
                        
                                boolean hasAdvanced = students.stream()
                                    .anyMatch(s -> s.level().equals("ADVANCED"));
                            }
                        }""", "java",
                "Stream lazy: intermediate ops don't run until terminal op ។ groupingBy = powerful aggregation ។", 1);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 7 - Lambda & Functional Interface
        // ══════════════════════════════════════════════════════════════
        Chapter ch7 = ch(c, "Lambda & Functional Interface", 7);

        Lesson l12 = ls(ch7, c, "Lambda Expressions", 1,
                "Lambda (Java 8+): anonymous function ។\n\n" +
                        "Syntax: (params) -> expression  OR  (params) -> { block }\n\n" +
                        "Functional Interface: @FunctionalInterface, 1 abstract method ។\n\n" +
                        "Built-in: Function<T,R>, Predicate<T>, Consumer<T>, Supplier<T>, BiFunction<T,U,R> ។\n\n" +
                        "Method Reference: ClassName::method ។");

        sn(l12, "Lambda Expressions", """
                        import java.util.*;
                        import java.util.function.*;
                        
                        public class LambdaDemo {
                        
                            @FunctionalInterface
                            interface MathOperation {
                                int operate(int a, int b);
                            }
                        
                            @FunctionalInterface
                            interface Greeting {
                                String greet(String name);
                            }
                        
                            public static void main(String[] args) {
                        
                                // Lambda as functional interface
                                MathOperation add  = (a, b) -> a + b;
                                MathOperation mult = (a, b) -> a * b;
                                System.out.println(add.operate(5, 3));   // 8
                                System.out.println(mult.operate(4, 3));  // 12
                        
                                Greeting hello = name -> "សួស្តី " + name + "!";
                                System.out.println(hello.greet("ដារ៉ា")); // សួស្តី ដារ៉ា!
                        
                                // ── Built-in Functional Interfaces ──
                        
                                // Predicate<T>: T → boolean
                                Predicate<String> isLong    = s -> s.length() > 5;
                                Predicate<Integer> isEven   = n -> n % 2 == 0;
                                Predicate<Integer> isPositive = n -> n > 0;
                                System.out.println(isEven.and(isPositive).test(4)); // true
                        
                                // Function<T, R>: T → R
                                Function<String, Integer> strLen = String::length;
                                Function<Integer, String> intToStr = i -> "Number: " + i;
                                Function<String, String> combined = strLen.andThen(intToStr);
                                System.out.println(combined.apply("Hello")); // Number: 5
                        
                                // Consumer<T>: T → void
                                Consumer<String> print = System.out::println;
                                Consumer<String> upper = s -> System.out.println(s.toUpperCase());
                                Consumer<String> both  = print.andThen(upper);
                                both.accept("java");
                        
                                // Supplier<T>: () → T
                                Supplier<List<String>> listFactory = ArrayList::new;
                                List<String> list = listFactory.get();
                        
                                // BiFunction<T, U, R>: T, U → R
                                BiFunction<String, Integer, String> repeat =
                                    (s, n) -> s.repeat(n);
                                System.out.println(repeat.apply("Ha", 3)); // HaHaHa
                        
                                // Method references
                                List<String> names = List.of("ដារ៉ា", "វណ្ណា", "សុភាព");
                                names.stream()
                                    .map(String::toUpperCase)    // instance method ref
                                    .forEach(System.out::println); // static method ref
                            }
                        }""", "java",
                "Method Reference :: ជំនួស lambda ។ Predicate.and() / .or() chain conditions ។", 1);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 8 - Exception Handling
        // ══════════════════════════════════════════════════════════════
        Chapter ch8 = ch(c, "Exception Handling", 8);

        Lesson l13 = ls(ch8, c, "try/catch/finally & Custom Exceptions", 1,
                "Exception hierarchy: Throwable → Error | Exception ។\n\n" +
                        "Checked Exception: ត្រូវ handle (IOException, SQLException) ។\n" +
                        "Unchecked Exception: RuntimeException (NPE, ArrayIndexOutOfBounds) ។\n\n" +
                        "try-with-resources: auto-close Closeable resources ។\n\n" +
                        "Multi-catch: catch (A | B e) ។");

        sn(l13, "Exception Handling", """
                        public class ExceptionDemo {
                        
                            // Custom checked exception
                            static class CourseNotFoundException extends Exception {
                                public CourseNotFoundException(String slug) {
                                    super("Course not found: " + slug);
                                }
                            }
                        
                            // Custom unchecked exception
                            static class InsufficientCreditException extends RuntimeException {
                                private final int required;
                                private final int available;
                        
                                public InsufficientCreditException(int required, int available) {
                                    super("Need %d credits, but only %d available"
                                        .formatted(required, available));
                                    this.required  = required;
                                    this.available = available;
                                }
                        
                                public int getRequired()  { return required; }
                                public int getAvailable() { return available; }
                            }
                        
                            static String findCourse(String slug) throws CourseNotFoundException {
                                Map<String, String> db = Map.of("html", "HTML Course", "react", "React.js");
                                String course = db.get(slug);
                                if (course == null) throw new CourseNotFoundException(slug);
                                return course;
                            }
                        
                            static void enroll(int credit) {
                                if (credit < 50) throw new InsufficientCreditException(50, credit);
                                System.out.println("✅ Enrolled!");
                            }
                        
                            public static void main(String[] args) {
                        
                                // Basic try-catch-finally
                                try {
                                    String title = findCourse("python");
                                    System.out.println(title);
                                } catch (CourseNotFoundException e) {
                                    System.out.println("❌ " + e.getMessage());
                                } finally {
                                    System.out.println("finally ដំណើរការជានិច្ច");
                                }
                        
                                // Multi-catch
                                try {
                                    int[] arr = new int[3];
                                    arr[5] = 10; // ArrayIndexOutOfBoundsException
                                } catch (ArrayIndexOutOfBoundsException | NullPointerException e) {
                                    System.out.println("Array/Null error: " + e.getMessage());
                                }
                        
                                // try-with-resources (auto-close)
                                try (var scanner = new java.util.Scanner(System.in)) {
                                    System.out.print("Enter slug: ");
                                    String input = scanner.nextLine();
                                    System.out.println(findCourse(input));
                                } catch (CourseNotFoundException e) {
                                    System.out.println(e.getMessage());
                                }
                        
                                // Catching custom runtime exception
                                try {
                                    enroll(30);
                                } catch (InsufficientCreditException e) {
                                    System.out.printf("ខ្វះ %d credits%n",
                                        e.getRequired() - e.getAvailable());
                                }
                            }
                        }""", "java",
                "Checked Exception: ត្រូវ declare throws ។ RuntimeException: no declaration needed ។", 1);

        // ══════════════════════════════════════════════════════════════
        // CHAPTER 9 - File I/O & Modern Java
        // ══════════════════════════════════════════════════════════════
        Chapter ch9 = ch(c, "File I/O & Modern Java", 9);

        Lesson l14 = ls(ch9, c, "File I/O", 1,
                "Java NIO.2 (java.nio.file): modern file API ។\n\n" +
                        "Path, Files, Paths utility classes ។\n\n" +
                        "Read/Write text files ។ Walk directory tree ។");

        sn(l14, "File I/O ជាមួយ NIO.2", """
                        import java.nio.file.*;
                        import java.io.*;
                        import java.util.*;
                        
                        public class FileIODemo {
                            public static void main(String[] args) throws IOException {
                        
                                Path filePath = Path.of("courses.txt");
                        
                                // ── Write ──
                                List<String> lines = List.of(
                                    "HTML for Beginners",
                                    "CSS Flexbox & Grid",
                                    "JavaScript ES6+",
                                    "React.js",
                                    "Java Programming"
                                );
                                Files.write(filePath, lines); // write all lines
                        
                                // Append to file
                                Files.writeString(filePath, "\\nSpring Boot", StandardOpenOption.APPEND);
                        
                                // ── Read ──
                                String content  = Files.readString(filePath);  // all as string
                                List<String> readLines = Files.readAllLines(filePath); // as list
                                System.out.println("Lines: " + readLines.size());
                        
                                // Stream lines (lazy, good for large files)
                                Files.lines(filePath)
                                    .filter(line -> line.contains("Java"))
                                    .forEach(System.out::println);
                        
                                // ── File operations ──
                                Path dest = Path.of("backup.txt");
                                Files.copy(filePath, dest, StandardCopyOption.REPLACE_EXISTING);
                                Files.move(dest, Path.of("archive/backup.txt"),
                                           StandardCopyOption.REPLACE_EXISTING);
                                Files.delete(filePath);
                        
                                // File info
                                System.out.println(Files.exists(filePath));    // false
                                System.out.println(Files.size(filePath));      // bytes
                                System.out.println(Files.isDirectory(filePath));
                        
                                // Walk directory
                                Files.walk(Path.of("."))
                                    .filter(p -> p.toString().endsWith(".java"))
                                    .forEach(System.out::println);
                            }
                        }""", "java",
                "Files.readAllLines() ល្អ small files ។ Files.lines() lazy stream ល្អ large files ។", 1);

        Lesson l15 = ls(ch9, c, "Optional & Modern Java Features", 2,
                "Optional<T> (Java 8+): handle null safely ។\n\n" +
                        "Pattern Matching instanceof (Java 16+) ។\n\n" +
                        "Sealed classes (Java 17+) ។\n\n" +
                        "Text Blocks (Java 15+) ។\n\n" +
                        "Enhanced switch ។");

        sn(l15, "Optional", """
                        import java.util.*;
                        
                        public class OptionalDemo {
                        
                            record User(Long id, String name, String email) {}
                        
                            static Optional<User> findUserById(Long id) {
                                Map<Long, User> db = Map.of(
                                    1L, new User(1L, "ដារ៉ា", "dara@gmail.com"),
                                    2L, new User(2L, "វណ្ណា", null) // no email
                                );
                                return Optional.ofNullable(db.get(id));
                            }
                        
                            public static void main(String[] args) {
                        
                                // ── Optional usage ──
                                Optional<User> opt = findUserById(1L);
                        
                                // isPresent / isEmpty
                                System.out.println(opt.isPresent()); // true
                        
                                // get (unsafe — throws if empty)
                                User user = opt.get();
                        
                                // orElse (default value)
                                User u = findUserById(99L).orElse(new User(0L, "Guest", ""));
                        
                                // orElseGet (lazy default)
                                User u2 = findUserById(99L).orElseGet(() -> new User(0L, "Guest", ""));
                        
                                // orElseThrow
                                User u3 = findUserById(1L)
                                    .orElseThrow(() -> new RuntimeException("User not found"));
                        
                                // map (transform value)
                                Optional<String> email = findUserById(1L)
                                    .map(User::email)
                                    .filter(e -> e != null && !e.isBlank());
                                email.ifPresent(e -> System.out.println("Email: " + e));
                        
                                // ifPresentOrElse
                                findUserById(99L).ifPresentOrElse(
                                    u4 -> System.out.println("Found: " + u4.name()),
                                    ()  -> System.out.println("User not found")
                                );
                            }
                        }""", "java",
                "Optional ដោះស្រាយ NullPointerException ។ map().filter() chain transformations ។", 1);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 7. SPRING BOOT
    // ══════════════════════════════════════════════════════════════════════════
    private void seedSpringBoot(User ins, Category cat) {
        Course c = course(
                "Spring Boot ជាភាសាខ្មែរ",
                "spring-boot-khmer",
                "វគ្គ Spring Boot សម្រាប់អ្នកដែលមានចំណេះដឹង Java មូលដ្ឋានហើយ ចង់ក្លាយជា " +
                        "Backend Developer ពិតប្រាកដ។ អ្នករៀននឹងបង្កើត REST API ពេញលេញ " +
                        "ជាមួយ Spring Boot 3.x, Spring Data JPA, PostgreSQL, Spring Security " +
                        "ជាមួយ JWT Authentication, Global Exception Handling, File Upload " +
                        "ទៅ Cloudinary, Bean Validation, MapStruct, Pagination, Unit Testing " +
                        "ជាមួយ JUnit ",
                "INTERMEDIATE", false, ins, cat);

        // ══════════════════════════════════════════════════════════════════
        //  CHAPTER 1 – ការណែនាំ & Project Setup
        // ══════════════════════════════════════════════════════════════════
        Chapter ch1 = ch(c, "ការណែនាំ & Project Setup", 1);



        Lesson l1_1 = ls(ch1, c, "Spring Boot គឺជាអ្វី?", 1,
                "Spring Boot ជា Java framework ដែល built on top of Spring Framework ។\n\n" +
                        "Auto-configuration: Spring Boot កំណត់ configuration ដោយស្វ័យប្រវត្តិ ។\n\n" +
                        "Embedded Server: Tomcat/Jetty built-in, មិនចាំបាច់ deploy war file ។\n\n" +
                        "Production-ready: Actuator, Metrics, Health checks ។\n\n" +
                        "Spring Initializr: https://start.spring.io ជ្រើស dependencies ងាយស្រួល ។");

        sn(l1_1, "pom.xml – Full Dependencies", """
                        <?xml version="1.0" encoding="UTF-8"?>
                        <project xmlns="http://maven.apache.org/POM/4.0.0">
                            <modelVersion>4.0.0</modelVersion>
                            <parent>
                                <groupId>org.springframework.boot</groupId>
                                <artifactId>spring-boot-starter-parent</artifactId>
                                <version>3.2.5</version>
                            </parent>
                        
                            <groupId>com.kshrd</groupId>
                            <artifactId>elearning-api</artifactId>
                            <version>0.0.1-SNAPSHOT</version>
                        
                            <properties>
                                <java.version>21</java.version>
                                <jjwt.version>0.12.5</jjwt.version>
                            </properties>
                        
                            <dependencies>
                                <dependency>
                                    <groupId>org.springframework.boot</groupId>
                                    <artifactId>spring-boot-starter-web</artifactId>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.springframework.boot</groupId>
                                    <artifactId>spring-boot-starter-data-jpa</artifactId>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.postgresql</groupId>
                                    <artifactId>postgresql</artifactId>
                                    <scope>runtime</scope>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.springframework.boot</groupId>
                                    <artifactId>spring-boot-starter-security</artifactId>
                                </dependency>
                        
                                <dependency>
                                    <groupId>io.jsonwebtoken</groupId>
                                    <artifactId>jjwt-api</artifactId>
                                    <version>${jjwt.version}</version>
                                </dependency>
                                <dependency>
                                    <groupId>io.jsonwebtoken</groupId>
                                    <artifactId>jjwt-impl</artifactId>
                                    <version>${jjwt.version}</version>
                                    <scope>runtime</scope>
                                </dependency>
                                <dependency>
                                    <groupId>io.jsonwebtoken</groupId>
                                    <artifactId>jjwt-jackson</artifactId>
                                    <version>${jjwt.version}</version>
                                    <scope>runtime</scope>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.springframework.boot</groupId>
                                    <artifactId>spring-boot-starter-validation</artifactId>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.projectlombok</groupId>
                                    <artifactId>lombok</artifactId>
                                    <optional>true</optional>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.mapstruct</groupId>
                                    <artifactId>mapstruct</artifactId>
                                    <version>1.5.5.Final</version>
                                </dependency>
                        
                                <dependency>
                                    <groupId>com.cloudinary</groupId>
                                    <artifactId>cloudinary-http44</artifactId>
                                    <version>1.38.0</version>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.springframework.boot</groupId>
                                    <artifactId>spring-boot-starter-actuator</artifactId>
                                </dependency>
                        
                                <dependency>
                                    <groupId>org.springframework.boot</groupId>
                                    <artifactId>spring-boot-starter-test</artifactId>
                                    <scope>test</scope>
                                </dependency>
                                <dependency>
                                    <groupId>org.springframework.security</groupId>
                                    <artifactId>spring-security-test</artifactId>
                                    <scope>test</scope>
                                </dependency>
                            </dependencies>
                        </project>""", "xml",
                "Spring Boot 3.x ប្រើ Java 21 ។ JJWT 0.12.x API ខុសពី 0.11.x ។", 1);

        sn(l1_1, "application.yml – Full Configuration", """
                        server:
                          port: 8080
                          servlet:
                            context-path: /api
                        
                        spring:
                          application:
                            name: elearning-api
                        
                          # Database
                          datasource:
                            url: jdbc:postgresql://localhost:5432/elearning_db
                            username: ${DB_USERNAME:postgres}
                            password: ${DB_PASSWORD:postgres}
                            hikari:
                              maximum-pool-size: 10
                              minimum-idle: 5
                        
                          # JPA / Hibernate
                          jpa:
                            hibernate:
                              ddl-auto: update          # dev ប្រើ update, prod ប្រើ validate
                            show-sql: true
                            properties:
                              hibernate:
                                format_sql: true
                                dialect: org.hibernate.dialect.PostgreSQLDialect
                                default_batch_fetch_size: 20  # ជួយ N+1
                        
                          # Mail (OTP)
                          mail:
                            host: smtp.gmail.com
                            port: 587
                            username: ${MAIL_USERNAME}
                            password: ${MAIL_PASSWORD}
                            properties:
                              mail.smtp.auth: true
                              mail.smtp.starttls.enable: true
                        
                        # JWT
                        application:
                          security:
                            jwt:
                              secret-key: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
                              access-token-expiration: 86400000   # 1 day
                              refresh-token-expiration: 604800000 # 7 days
                        
                        # Cloudinary
                        cloudinary:
                          cloud-name: ${CLOUD_NAME}
                          api-key: ${CLOUD_API_KEY}
                          api-secret: ${CLOUD_API_SECRET}
                        
                        # Actuator
                        management:
                          endpoints:
                            web:
                              exposure:
                                include: health,info,metrics""", "yaml",
                "ប្រើ ${ENV_VAR:default} សម្រាប់ environment variables ។ Production ប្ដូរ ddl-auto=validate ។", 2);

        // ══════════════════════════════════════════════════════════════════
        //  CHAPTER 2 – Project Structure & Base Classes
        // ══════════════════════════════════════════════════════════════════
        Chapter ch2 = ch(c, "Project Structure & Base Classes", 2);

        Lesson l2_1 = ls(ch2, c, "Package Structure & ApiResponse", 1,
                "Clean Architecture ជួយ maintain code បានងាយ ។\n\n" +
                        "ចែក package ដោយ: controller, service, repository, entity, dto, mapper, security, exception ។\n\n" +
                        "ApiResponse<T> ជា standard response wrapper ប្រើ throughout project ។");

        sn(l2_1, "Project Structure", """
                        src/main/java/com/kshrd/elearning/
                        ├── ElearningApplication.java
                        ├── config/
                        │   ├── AppConfig.java          # Beans (PasswordEncoder, etc.)
                        │   ├── CloudinaryConfig.java
                        │   └── OpenApiConfig.java      # Swagger
                        ├── controller/
                        │   ├── AuthController.java
                        │   ├── CourseController.java
                        │   └── UserController.java
                        ├── dto/
                        │   ├── request/
                        │   │   ├── LoginRequest.java
                        │   │   ├── RegisterRequest.java
                        │   │   └── CourseRequest.java
                        │   └── response/
                        │       ├── ApiResponse.java
                        │       ├── AuthResponse.java
                        │       └── CourseResponse.java
                        ├── entity/
                        │   ├── BaseEntity.java
                        │   ├── User.java
                        │   ├── Course.java
                        │   └── RefreshToken.java
                        ├── exception/
                        │   ├── GlobalExceptionHandler.java
                        │   ├── NotFoundException.java
                        │   └── BadRequestException.java
                        ├── mapper/
                        │   └── CourseMapper.java
                        ├── repository/
                        │   ├── UserRepository.java
                        │   └── CourseRepository.java
                        ├── security/
                        │   ├── SecurityConfig.java
                        │   ├── JwtService.java
                        │   └── JwtAuthenticationFilter.java
                        └── service/
                            ├── CourseService.java
                            └── impl/
                                └── CourseServiceImpl.java""", "text",
                "Separation of concerns ។ Controller → Service → Repository ។", 1);

        sn(l2_1, "ApiResponse & PageResponse", """
                        // ApiResponse.java - Standard API Response Wrapper
                        @Data
                        @Builder
                        @NoArgsConstructor
                        @AllArgsConstructor
                        public class ApiResponse<T> {
                            private boolean success;
                            private String  message;
                            private T       payload;
                            private Integer status;
                            private LocalDateTime timestamp;
                        
                            // Success with data
                            public static <T> ApiResponse<T> success(T data, String message) {
                                return ApiResponse.<T>builder()
                                        .success(true)
                                        .message(message)
                                        .payload(data)
                                        .status(200)
                                        .timestamp(LocalDateTime.now())
                                        .build();
                            }
                        
                            // Created (201)
                            public static <T> ApiResponse<T> created(T data) {
                                return ApiResponse.<T>builder()
                                        .success(true)
                                        .message("Created successfully")
                                        .payload(data)
                                        .status(201)
                                        .timestamp(LocalDateTime.now())
                                        .build();
                            }
                        
                            // Error
                            public static <T> ApiResponse<T> error(String message, int status) {
                                return ApiResponse.<T>builder()
                                        .success(false)
                                        .message(message)
                                        .status(status)
                                        .timestamp(LocalDateTime.now())
                                        .build();
                            }
                        }
                        
                        // PageResponse.java - Paginated Response Wrapper
                        @Data @Builder
                        @NoArgsConstructor @AllArgsConstructor
                        public class PageResponse<T> {
                            private List<T>  content;
                            private int      page;
                            private int      size;
                            private long     totalElements;
                            private int      totalPages;
                            private boolean  last;
                        
                            public static <T> PageResponse<T> of(Page<T> page) {
                                return PageResponse.<T>builder()
                                        .content(page.getContent())
                                        .page(page.getNumber())
                                        .size(page.getSize())
                                        .totalElements(page.getTotalElements())
                                        .totalPages(page.getTotalPages())
                                        .last(page.isLast())
                                        .build();
                            }
                        }""", "java",
                "Generic <T> ប្រើជាមួយ type ណាក៏បាន ។ Builder pattern ងាយ readable ។", 2);

        Lesson l2_2 = ls(ch2, c, "Base Entity & Auditing", 2,
                "@MappedSuperclass ជា parent entity ដែល child entities inherit ។\n\n" +
                        "Spring Data Auditing: @CreatedDate, @LastModifiedDate auto-fill ។\n\n" +
                        "Enable ដោយ @EnableJpaAuditing នៅ main class ។");

        sn(l2_2, "BaseEntity with Auditing", """
                        // BaseEntity.java
                        @MappedSuperclass
                        @EntityListeners(AuditingEntityListener.class)
                        @Getter @Setter
                        public abstract class BaseEntity {
                        
                            @CreatedDate
                            @Column(updatable = false)
                            private LocalDateTime createdAt;
                        
                            @LastModifiedDate
                            private LocalDateTime updatedAt;
                        }
                        
                        // ElearningApplication.java - Enable Auditing
                        @SpringBootApplication
                        @EnableJpaAuditing
                        public class ElearningApplication {
                            public static void main(String[] args) {
                                SpringApplication.run(ElearningApplication.class, args);
                            }
                        }
                        
                        // Course Entity extends BaseEntity
                        @Entity
                        @Table(name = "courses")
                        @Getter @Setter @Builder
                        @NoArgsConstructor @AllArgsConstructor
                        public class Course extends BaseEntity {
                        
                            @Id
                            @GeneratedValue(strategy = GenerationType.IDENTITY)
                            private Long id;
                        
                            @Column(nullable = false, unique = true, length = 200)
                            private String title;
                        
                            @Column(nullable = false, unique = true)
                            private String slug;
                        
                            @Column(columnDefinition = "TEXT")
                            private String description;
                        
                            @Enumerated(EnumType.STRING)
                            @Column(nullable = false)
                            private Level level; // BEGINNER, INTERMEDIATE, ADVANCED
                        
                            @Column(nullable = false)
                            private Boolean isPaid = false;
                        
                            private String thumbnailUrl;
                        
                            @ManyToOne(fetch = FetchType.LAZY)
                            @JoinColumn(name = "instructor_id", nullable = false)
                            private User instructor;
                        
                            @ManyToOne(fetch = FetchType.LAZY)
                            @JoinColumn(name = "category_id")
                            private Category category;
                        
                            @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
                            @OrderBy("orderIndex ASC")
                            private List<Chapter> chapters = new ArrayList<>();
                        }""", "java",
                "@EnableJpaAuditing ត្រូវដាក់ ។ FetchType.LAZY ល្អជាង EAGER ។", 1);

        // ══════════════════════════════════════════════════════════════════
        //  CHAPTER 3 – Spring Data JPA (Deep Dive)
        // ══════════════════════════════════════════════════════════════════
        Chapter ch3 = ch(c, "Spring Data JPA – ស៊ីជម្រៅ", 3);

        Lesson l3_1 = ls(ch3, c, "Entity Relationships", 1,
                "JPA Relationships: @OneToOne, @OneToMany, @ManyToOne, @ManyToMany ។\n\n" +
                        "FetchType.LAZY = load data only when accessed (ល្អ) ។\n\n" +
                        "FetchType.EAGER = load immediately (ប្រើអស្រ័យ, អាច느 slow) ។\n\n" +
                        "CascadeType.ALL = operation ផ្សព្វផ្សាយទៅ children ។\n\n" +
                        "orphanRemoval = true: remove child ពេល detach ពី parent ។");

        sn(l3_1, "JPA Relationships – Complete Example", """
                        // ─── User ──────────────────────────────────────────────────
                        @Entity @Table(name = "users")
                        @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
                        public class User extends BaseEntity implements UserDetails {
                        
                            @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
                            private Long id;
                        
                            @Column(nullable = false, unique = true)
                            private String email;
                        
                            @Column(nullable = false)
                            private String password;
                        
                            private String username;
                            private String avatarUrl;
                            private boolean verified = false;
                        
                            @Enumerated(EnumType.STRING)
                            private Role role = Role.STUDENT; // STUDENT, INSTRUCTOR, ADMIN
                        
                            // One user can have many courses (as instructor)
                            @OneToMany(mappedBy = "instructor", fetch = FetchType.LAZY)
                            private List<Course> courses = new ArrayList<>();
                        
                            // Many students enroll in many courses
                            @ManyToMany(fetch = FetchType.LAZY)
                            @JoinTable(
                                name = "enrollments",
                                joinColumns = @JoinColumn(name = "user_id"),
                                inverseJoinColumns = @JoinColumn(name = "course_id")
                            )
                            private List<Course> enrolledCourses = new ArrayList<>();
                        
                            // UserDetails methods
                            @Override public Collection<? extends GrantedAuthority> getAuthorities() {
                                return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
                            }
                            @Override public boolean isAccountNonExpired()  { return true; }
                            @Override public boolean isAccountNonLocked()   { return verified; }
                            @Override public boolean isCredentialsNonExpired() { return true; }
                            @Override public boolean isEnabled()            { return verified; }
                        }
                        
                        // ─── Chapter ───────────────────────────────────────────────
                        @Entity @Table(name = "chapters")
                        @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
                        public class Chapter extends BaseEntity {
                        
                            @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
                            private Long id;
                        
                            @Column(nullable = false)
                            private String title;
                        
                            @Column(nullable = false)
                            private Integer orderIndex;
                        
                            @ManyToOne(fetch = FetchType.LAZY)
                            @JoinColumn(name = "course_id", nullable = false)
                            private Course course;
                        
                            @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL,
                                       orphanRemoval = true)
                            @OrderBy("orderIndex ASC")
                            private List<Lesson> lessons = new ArrayList<>();
                        }
                        
                        // ─── Lesson ────────────────────────────────────────────────
                        @Entity @Table(name = "lessons")
                        @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
                        public class Lesson extends BaseEntity {
                        
                            @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
                            private Long id;
                        
                            @Column(nullable = false)
                            private String title;
                        
                            @Column(columnDefinition = "TEXT")
                            private String content;
                        
                            private Integer orderIndex;
                            private String  videoUrl;
                            private Integer durationMinutes;
                        
                            @ManyToOne(fetch = FetchType.LAZY)
                            @JoinColumn(name = "chapter_id", nullable = false)
                            private Chapter chapter;
                        
                            @ManyToOne(fetch = FetchType.LAZY)
                            @JoinColumn(name = "course_id")
                            private Course course;
                        
                            @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL,
                                       orphanRemoval = true)
                            @OrderBy("orderIndex ASC")
                            private List<CodeSnippet> codeSnippets = new ArrayList<>();
                        }""", "java",
                "@ManyToMany ត្រូវការ @JoinTable ។ orphanRemoval=true delete child auto ។", 1);

        Lesson l3_2 = ls(ch3, c, "Repository – Query Methods & JPQL", 2,
                "Spring Data JPA auto-generates queries ពី method names ។\n\n" +
                        "findByFieldName, existsByField, countByField ។\n\n" +
                        "@Query: ប្រើ JPQL (ជាមួយ class/field names) ឬ nativeQuery=true (SQL) ។\n\n" +
                        "JOIN FETCH ជួយដោះស្រាយ N+1 problem ។\n\n" +
                        "@Modifying + @Transactional: UPDATE/DELETE queries ។");

        sn(l3_2, "CourseRepository – Complete", """
                        @Repository
                        public interface CourseRepository extends JpaRepository<Course, Long> {
                        
                            // ─── Derived Query Methods (auto-generated) ───────────
                            Optional<Course> findBySlug(String slug);
                            boolean existsBySlug(String slug);
                            boolean existsByTitle(String title);
                            long countByInstructor(User instructor);
                            List<Course> findByIsPaidFalse();
                            List<Course> findByLevelOrderByCreatedAtDesc(Level level);
                        
                            // ─── JPQL Queries ─────────────────────────────────────
                            // Search by keyword
                            @Query("SELECT c FROM Course c " +
                                   "WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                                   "   OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
                            Page<Course> searchByKeyword(@Param("keyword") String keyword,
                                                         Pageable pageable);
                        
                            // Fetch full content (avoid N+1)
                            @Query("SELECT DISTINCT c FROM Course c " +
                                   "LEFT JOIN FETCH c.chapters ch " +
                                   "LEFT JOIN FETCH ch.lessons l " +
                                   "LEFT JOIN FETCH l.codeSnippets " +
                                   "WHERE c.slug = :slug " +
                                   "ORDER BY ch.orderIndex ASC")
                            Optional<Course> findBySlugWithFullContent(@Param("slug") String slug);
                        
                            // Courses by instructor with pagination
                            @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId")
                            Page<Course> findByInstructorId(@Param("instructorId") Long instructorId,
                                                            Pageable pageable);
                        
                            // Count enrolled students
                            @Query("SELECT COUNT(u) FROM User u JOIN u.enrolledCourses c " +
                                   "WHERE c.id = :courseId")
                            Long countEnrolledStudents(@Param("courseId") Long courseId);
                        
                            // ─── Native Query ─────────────────────────────────────
                            @Query(value = "SELECT c.*, COUNT(e.user_id) AS enrolled_count " +
                                           "FROM courses c " +
                                           "LEFT JOIN enrollments e ON e.course_id = c.id " +
                                           "GROUP BY c.id " +
                                           "ORDER BY enrolled_count DESC " +
                                           "LIMIT :limit", nativeQuery = true)
                            List<Object[]> findTopEnrolledCourses(@Param("limit") int limit);
                        
                            // ─── Update / Delete ───────────────────────────────────
                            @Modifying
                            @Transactional
                            @Query("UPDATE Course c SET c.thumbnailUrl = :url WHERE c.id = :id")
                            int updateThumbnail(@Param("id") Long id, @Param("url") String url);
                        }""", "java",
                "JPQL ប្រើ class/field names ។ nativeQuery=true ប្រើ SQL ដូចធម្មតា ។", 1);

        Lesson l3_3 = ls(ch3, c, "Service Layer & Transactions", 3,
                "@Service ជា business logic layer ។\n\n" +
                        "@Transactional: operation ទាំងអស់ success ឬ rollback ទាំងអស់ ។\n\n" +
                        "@Transactional(readOnly = true): ប្រើ SELECT queries, performance ល្អជាង ។\n\n" +
                        "Propagation.REQUIRES_NEW: transaction ថ្មីដាច់ពី parent ។");

        sn(l3_3, "CourseService Implementation", """
                        @Service
                        @RequiredArgsConstructor
                        @Transactional  // default: all methods transactional
                        public class CourseServiceImpl implements CourseService {
                        
                            private final CourseRepository  courseRepo;
                            private final UserRepository    userRepo;
                            private final CourseMapper      mapper;
                            private final CloudinaryService cloudinary;
                        
                            // ─── READ (readOnly = true for performance) ───────────
                            @Override
                            @Transactional(readOnly = true)
                            public PageResponse<CourseResponse> getAll(Pageable pageable) {
                                Page<Course> page = courseRepo.findAll(pageable);
                                return PageResponse.of(page.map(mapper::toResponse));
                            }
                        
                            @Override
                            @Transactional(readOnly = true)
                            public ApiResponse<CourseDetailResponse> getBySlugFull(String slug) {
                                Course course = courseRepo.findBySlugWithFullContent(slug)
                                        .orElseThrow(() -> new NotFoundException(
                                                "Course not found with slug: " + slug));
                                return ApiResponse.success(mapper::toDetailResponse(course), "OK");
                            }
                        
                            @Override
                            @Transactional(readOnly = true)
                            public PageResponse<CourseResponse> search(String keyword, Pageable pageable) {
                                return PageResponse.of(
                                        courseRepo.searchByKeyword(keyword, pageable)
                                                  .map(mapper::toResponse));
                            }
                        
                            // ─── CREATE ──────────────────────────────────────────
                            @Override
                            public ApiResponse<CourseResponse> create(CourseRequest req,
                                                                      MultipartFile thumbnail,
                                                                      User currentUser) {
                                // Validate uniqueness
                                if (courseRepo.existsByTitle(req.getTitle()))
                                    throw new BadRequestException("Course title already exists");
                        
                                // Generate slug
                                String slug = generateSlug(req.getTitle());
                                if (courseRepo.existsBySlug(slug))
                                    slug = slug + "-" + System.currentTimeMillis();
                        
                                // Upload thumbnail
                                String thumbnailUrl = null;
                                if (thumbnail != null && !thumbnail.isEmpty()) {
                                    thumbnailUrl = cloudinary.upload(thumbnail, "courses/thumbnails");
                                }
                        
                                // Build entity
                                Course course = Course.builder()
                                        .title(req.getTitle())
                                        .slug(slug)
                                        .description(req.getDescription())
                                        .level(Level.valueOf(req.getLevel()))
                                        .isPaid(req.getIsPaid())
                                        .thumbnailUrl(thumbnailUrl)
                                        .instructor(currentUser)
                                        .build();
                        
                                return ApiResponse.created(mapper.toResponse(courseRepo.save(course)));
                            }
                        
                            // ─── UPDATE ──────────────────────────────────────────
                            @Override
                            public ApiResponse<CourseResponse> update(Long id, CourseRequest req,
                                                                      User currentUser) {
                                Course course = courseRepo.findById(id)
                                        .orElseThrow(() -> new NotFoundException("Course not found"));
                        
                                // Authorization: only instructor or admin can update
                                if (!course.getInstructor().getId().equals(currentUser.getId())
                                        && !currentUser.getRole().equals(Role.ADMIN)) {
                                    throw new ForbiddenException("You don't have permission");
                                }
                        
                                course.setTitle(req.getTitle());
                                course.setDescription(req.getDescription());
                                course.setLevel(Level.valueOf(req.getLevel()));
                                course.setIsPaid(req.getIsPaid());
                        
                                return ApiResponse.success(
                                        mapper.toResponse(courseRepo.save(course)), "Updated");
                            }
                        
                            // ─── DELETE ──────────────────────────────────────────
                            @Override
                            public ApiResponse<Void> delete(Long id, User currentUser) {
                                Course course = courseRepo.findById(id)
                                        .orElseThrow(() -> new NotFoundException("Course not found"));
                                courseRepo.delete(course);
                                return ApiResponse.success(null, "Deleted successfully");
                            }
                        
                            // ─── Helper ──────────────────────────────────────────
                            private String generateSlug(String title) {
                                return title.toLowerCase()
                                            .replaceAll("[^a-z0-9\\s-]", "")
                                            .replaceAll("\\s+", "-")
                                            .replaceAll("-+", "-");
                            }
                        }""", "java",
                "readOnly=true ជួយ performance ។ @Transactional rollback on RuntimeException ។", 1);

        Lesson l3_4 = ls(ch3, c, "Exception Handling", 4,
                "@ControllerAdvice + @ExceptionHandler = Global Exception Handler ។\n\n" +
                        "Custom exceptions: NotFoundException (404), BadRequestException (400) ។\n\n" +
                        "ProblemDetail (Spring 6): standard RFC 9457 error format ។\n\n" +
                        "Validation errors: @Valid + MethodArgumentNotValidException ។");

        sn(l3_4, "GlobalExceptionHandler", """
                        // Custom Exceptions
                        public class NotFoundException extends RuntimeException {
                            public NotFoundException(String message) { super(message); }
                        }
                        
                        public class BadRequestException extends RuntimeException {
                            public BadRequestException(String message) { super(message); }
                        }
                        
                        public class ForbiddenException extends RuntimeException {
                            public ForbiddenException(String message) { super(message); }
                        }
                        
                        // ─── Global Handler ────────────────────────────────────────
                        @RestControllerAdvice
                        @Slf4j
                        public class GlobalExceptionHandler {
                        
                            // 404 Not Found
                            @ExceptionHandler(NotFoundException.class)
                            public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException ex) {
                                log.error("Not found: {}", ex.getMessage());
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ApiResponse.error(ex.getMessage(), 404));
                            }
                        
                            // 400 Bad Request
                            @ExceptionHandler(BadRequestException.class)
                            public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ApiResponse.error(ex.getMessage(), 400));
                            }
                        
                            // 403 Forbidden
                            @ExceptionHandler(ForbiddenException.class)
                            public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
                                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.error(ex.getMessage(), 403));
                            }
                        
                            // Validation errors (@Valid)
                            @ExceptionHandler(MethodArgumentNotValidException.class)
                            public ResponseEntity<ApiResponse<Map<String,String>>> handleValidation(
                                    MethodArgumentNotValidException ex) {
                                Map<String, String> errors = new LinkedHashMap<>();
                                ex.getBindingResult().getFieldErrors()
                                  .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
                                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ApiResponse.<Map<String,String>>builder()
                                                .success(false)
                                                .message("Validation failed")
                                                .payload(errors)
                                                .status(400)
                                                .build());
                            }
                        
                            // Unexpected errors
                            @ExceptionHandler(Exception.class)
                            public ResponseEntity<ApiResponse<Void>> handleAll(Exception ex) {
                                log.error("Unexpected error: ", ex);
                                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("Internal server error", 500));
                            }
                        }""", "java",
                "@RestControllerAdvice = @ControllerAdvice + @ResponseBody ។ log.error() ជំនួស ex.printStackTrace() ។", 1);

        // ══════════════════════════════════════════════════════════════════
        //  CHAPTER 4 – Spring Security & JWT (Deep Dive)
        // ══════════════════════════════════════════════════════════════════
        Chapter ch4 = ch(c, "Spring Security & JWT – ស៊ីជម្រៅ", 4);

        Lesson l4_1 = ls(ch4, c, "Spring Security Architecture", 1,
                "Spring Security ដំណើរការជា Filter Chain ។\n\n" +
                        "SecurityFilterChain: chain of filters ដំណើរការ order ច្បាស់លាស់ ។\n\n" +
                        "Authentication: verify who you are (Login) ។\n\n" +
                        "Authorization: verify what you can do (Roles/Permissions) ។\n\n" +
                        "SecurityContextHolder: stores authenticated user info ។");

        sn(l4_1, "SecurityConfig – Complete Setup", """
                        @Configuration
                        @EnableWebSecurity
                        @EnableMethodSecurity   // enable @PreAuthorize, @PostAuthorize
                        @RequiredArgsConstructor
                        public class SecurityConfig {
                        
                            private final JwtAuthenticationFilter jwtFilter;
                            private final UserDetailsService      userDetailsService;
                        
                            @Bean
                            public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                                return http
                                    // Disable CSRF (stateless REST API)
                                    .csrf(csrf -> csrf.disable())
                        
                                    // CORS
                                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                        
                                    // Stateless session
                                    .sessionManagement(s ->
                                            s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                        
                                    // Authorization rules
                                    .authorizeHttpRequests(auth -> auth
                                        // Public endpoints
                                        .requestMatchers(
                                            "/v1/auth/**",
                                            "/v1/courses", "/v1/courses/**"
                                        ).permitAll()
                        
                                        // Swagger UI
                                        .requestMatchers(
                                            "/swagger-ui/**",
                                            "/v3/api-docs/**"
                                        ).permitAll()
                        
                                        // Admin only
                                        .requestMatchers(HttpMethod.DELETE, "/v1/courses/**").hasRole("ADMIN")
                                        .requestMatchers("/v1/admin/**").hasRole("ADMIN")
                        
                                        // Instructor or Admin
                                        .requestMatchers(HttpMethod.POST, "/v1/courses")
                                            .hasAnyRole("INSTRUCTOR", "ADMIN")
                        
                                        // Any authenticated
                                        .anyRequest().authenticated()
                                    )
                        
                                    // Custom exception handlers
                                    .exceptionHandling(ex -> ex
                                        .authenticationEntryPoint(customAuthEntryPoint())
                                        .accessDeniedHandler(customAccessDeniedHandler())
                                    )
                        
                                    // Add JWT filter before UsernamePasswordAuthenticationFilter
                                    .addFilterBefore(jwtFilter,
                                            UsernamePasswordAuthenticationFilter.class)
                        
                                    .build();
                            }
                        
                            @Bean
                            public AuthenticationManager authenticationManager(
                                    AuthenticationConfiguration config) throws Exception {
                                return config.getAuthenticationManager();
                            }
                        
                            @Bean
                            public PasswordEncoder passwordEncoder() {
                                return new BCryptPasswordEncoder(12);
                            }
                        
                            @Bean
                            public CorsConfigurationSource corsConfigurationSource() {
                                CorsConfiguration config = new CorsConfiguration();
                                config.setAllowedOrigins(List.of("http://localhost:3000",
                                                                 "https://yourdomain.com"));
                                config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH"));
                                config.setAllowedHeaders(List.of("*"));
                                config.setAllowCredentials(true);
                                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                                source.registerCorsConfiguration("/**", config);
                                return source;
                            }
                        
                            @Bean
                            public AuthenticationEntryPoint customAuthEntryPoint() {
                                return (req, res, ex) -> {
                                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                    res.getWriter().write("{\\"success\\":false,\\"message\\":\\"Unauthorized\\",\\"status\\":401}");
                                };
                            }
                        
                            @Bean
                            public AccessDeniedHandler customAccessDeniedHandler() {
                                return (req, res, ex) -> {
                                    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                    res.getWriter().write("{\\"success\\":false,\\"message\\":\\"Access Denied\\",\\"status\\":403}");
                                };
                            }
                        }""", "java",
                "@EnableMethodSecurity ប្រើ @PreAuthorize(\"hasRole('ADMIN')\") នៅ method level ។", 1);

        Lesson l4_2 = ls(ch4, c, "JwtService – Token Create & Validate", 2,
                "JWT មាន 3 ផ្នែក: Header.Payload.Signature ។\n\n" +
                        "Claims: sub (subject=email), iat (issued at), exp (expiration), roles ។\n\n" +
                        "HS256: HMAC-SHA256 signing algorithm ។\n\n" +
                        "Access Token: short-lived (1 day) ។ Refresh Token: long-lived (7 days) ។");

        sn(l4_2, "JwtService – Complete", """
                        @Service
                        @Slf4j
                        public class JwtService {
                        
                            @Value("${application.security.jwt.secret-key}")
                            private String secretKey;
                        
                            @Value("${application.security.jwt.access-token-expiration}")
                            private long accessTokenExpiration;
                        
                            @Value("${application.security.jwt.refresh-token-expiration}")
                            private long refreshTokenExpiration;
                        
                            // ─── Generate Tokens ───────────────────────────────────
                            public String generateAccessToken(UserDetails user) {
                                return buildToken(user, accessTokenExpiration,
                                        Map.of("type", "access",
                                               "role", ((User) user).getRole().name()));
                            }
                        
                            public String generateRefreshToken(UserDetails user) {
                                return buildToken(user, refreshTokenExpiration,
                                        Map.of("type", "refresh"));
                            }
                        
                            private String buildToken(UserDetails user, long expiration,
                                                      Map<String, Object> extraClaims) {
                                return Jwts.builder()
                                        .claims(extraClaims)
                                        .subject(user.getUsername())          // email
                                        .issuedAt(new Date())
                                        .expiration(new Date(System.currentTimeMillis() + expiration))
                                        .signWith(getSigningKey())
                                        .compact();
                            }
                        
                            // ─── Validate Token ────────────────────────────────────
                            public boolean isValid(String token, UserDetails user) {
                                try {
                                    String username = extractUsername(token);
                                    return username.equals(user.getUsername()) && !isExpired(token);
                                } catch (JwtException e) {
                                    log.warn("Invalid JWT: {}", e.getMessage());
                                    return false;
                                }
                            }
                        
                            public boolean isRefreshToken(String token) {
                                return "refresh".equals(extractClaim(token, c -> c.get("type", String.class)));
                            }
                        
                            // ─── Extract Claims ────────────────────────────────────
                            public String extractUsername(String token) {
                                return extractClaim(token, Claims::getSubject);
                            }
                        
                            public Date extractExpiration(String token) {
                                return extractClaim(token, Claims::getExpiration);
                            }
                        
                            public <T> T extractClaim(String token,
                                                      Function<Claims, T> claimsResolver) {
                                return claimsResolver.apply(extractAllClaims(token));
                            }
                        
                            private Claims extractAllClaims(String token) {
                                return Jwts.parser()
                                           .verifyWith(getSigningKey())
                                           .build()
                                           .parseSignedClaims(token)
                                           .getPayload();
                            }
                        
                            private boolean isExpired(String token) {
                                return extractExpiration(token).before(new Date());
                            }
                        
                            private SecretKey getSigningKey() {
                                byte[] keyBytes = Decoders.BASE64.decode(secretKey);
                                return Keys.hmacShaKeyFor(keyBytes);
                            }
                        }""", "java",
                "JJWT 0.12.x: Jwts.parser().verifyWith() ជំនួស parseClaimsJws() ។", 1);

        Lesson l4_3 = ls(ch4, c, "JWT Filter & Auth Controller", 3,
                "JwtAuthenticationFilter ដំណើរការ every request ។\n\n" +
                        "OncePerRequestFilter: guarantee filter runs once per request ។\n\n" +
                        "AuthController: /register, /login, /refresh-token, /logout endpoints ។\n\n" +
                        "Refresh Token: stored in database, revocable ។");

        sn(l4_3, "JwtAuthenticationFilter", """
                        @Component
                        @RequiredArgsConstructor
                        @Slf4j
                        public class JwtAuthenticationFilter extends OncePerRequestFilter {
                        
                            private final JwtService         jwtService;
                            private final UserDetailsService userDetailsService;
                        
                            // Skip filter for public endpoints
                            private static final List<String> PUBLIC_PATHS = List.of(
                                    "/v1/auth/login",
                                    "/v1/auth/register",
                                    "/v1/auth/refresh-token",
                                    "/swagger-ui",
                                    "/v3/api-docs"
                            );
                        
                            @Override
                            protected boolean shouldNotFilter(HttpServletRequest request) {
                                String path = request.getServletPath();
                                return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
                            }
                        
                            @Override
                            protected void doFilterInternal(HttpServletRequest  request,
                                                            HttpServletResponse response,
                                                            FilterChain         chain)
                                    throws ServletException, IOException {
                        
                                String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
                        
                                // No bearer token → continue (Security will handle 401)
                                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                                    chain.doFilter(request, response);
                                    return;
                                }
                        
                                try {
                                    String token    = authHeader.substring(7);
                                    String username = jwtService.extractUsername(token);
                        
                                    // Not yet authenticated
                                    if (username != null &&
                                            SecurityContextHolder.getContext().getAuthentication() == null) {
                        
                                        UserDetails userDetails =
                                                userDetailsService.loadUserByUsername(username);
                        
                                        if (jwtService.isValid(token, userDetails)) {
                                            UsernamePasswordAuthenticationToken auth =
                                                    new UsernamePasswordAuthenticationToken(
                                                            userDetails,
                                                            null,
                                                            userDetails.getAuthorities()
                                                    );
                                            auth.setDetails(new WebAuthenticationDetailsSource()
                                                    .buildDetails(request));
                                            SecurityContextHolder.getContext().setAuthentication(auth);
                                        }
                                    }
                                } catch (JwtException ex) {
                                    log.warn("JWT error: {}", ex.getMessage());
                                }
                        
                                chain.doFilter(request, response);
                            }
                        }""", "java",
                "shouldNotFilter() skip public paths ។ JwtException catch ដើម្បីកុំ crash ។", 1);

        sn(l4_3, "AuthController & AuthService", """
                        // ─── AuthRequest DTOs ──────────────────────────────────────
                        @Data public class RegisterRequest {
                            @NotBlank @Email
                            private String email;
                            @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
                            private String password;
                            @NotBlank private String username;
                        }
                        
                        @Data public class LoginRequest {
                            @NotBlank @Email private String email;
                            @NotBlank        private String password;
                        }
                        
                        @Data @Builder public class AuthResponse {
                            private String      accessToken;
                            private String      refreshToken;
                            private String      tokenType;  // "Bearer"
                            private long        expiresIn;
                            private UserInfo    user;
                        }
                        
                        // ─── AuthController ────────────────────────────────────────
                        @RestController
                        @RequestMapping("/v1/auth")
                        @RequiredArgsConstructor
                        public class AuthController {
                        
                            private final AuthService authService;
                        
                            @PostMapping("/register")
                            public ResponseEntity<ApiResponse<AuthResponse>> register(
                                    @Valid @RequestBody RegisterRequest req) {
                                return ResponseEntity.status(201)
                                        .body(authService.register(req));
                            }
                        
                            @PostMapping("/login")
                            public ResponseEntity<ApiResponse<AuthResponse>> login(
                                    @Valid @RequestBody LoginRequest req) {
                                return ResponseEntity.ok(authService.login(req));
                            }
                        
                            @PostMapping("/refresh-token")
                            public ResponseEntity<ApiResponse<AuthResponse>> refresh(
                                    @RequestHeader("Authorization") String bearerToken) {
                                String refreshToken = bearerToken.substring(7);
                                return ResponseEntity.ok(authService.refreshToken(refreshToken));
                            }
                        
                            @PostMapping("/logout")
                            public ResponseEntity<ApiResponse<Void>> logout(
                                    @RequestHeader("Authorization") String bearerToken) {
                                String accessToken = bearerToken.substring(7);
                                authService.logout(accessToken);
                                return ResponseEntity.ok(ApiResponse.success(null, "Logged out"));
                            }
                        
                            @GetMapping("/me")
                            public ResponseEntity<ApiResponse<UserInfo>> me(
                                    @AuthenticationPrincipal User currentUser) {
                                return ResponseEntity.ok(
                                        ApiResponse.success(UserInfo.from(currentUser), "OK"));
                            }
                        }
                        
                        // ─── AuthService ───────────────────────────────────────────
                        @Service @RequiredArgsConstructor @Transactional
                        public class AuthService {
                        
                            private final UserRepository     userRepo;
                            private final PasswordEncoder    encoder;
                            private final JwtService         jwtService;
                            private final AuthenticationManager authManager;
                        
                            public ApiResponse<AuthResponse> register(RegisterRequest req) {
                                if (userRepo.existsByEmail(req.getEmail()))
                                    throw new BadRequestException("Email already registered");
                        
                                User user = User.builder()
                                        .email(req.getEmail())
                                        .password(encoder.encode(req.getPassword()))
                                        .username(req.getUsername())
                                        .role(Role.STUDENT)
                                        .verified(true)  // or send OTP email
                                        .build();
                                userRepo.save(user);
                        
                                return ApiResponse.created(buildAuthResponse(user));
                            }
                        
                            public ApiResponse<AuthResponse> login(LoginRequest req) {
                                // Authenticate (throws if invalid)
                                authManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                req.getEmail(), req.getPassword()));
                        
                                User user = userRepo.findByEmail(req.getEmail())
                                        .orElseThrow(() -> new NotFoundException("User not found"));
                        
                                return ApiResponse.success(buildAuthResponse(user), "Login successful");
                            }
                        
                            public ApiResponse<AuthResponse> refreshToken(String refreshToken) {
                                if (!jwtService.isRefreshToken(refreshToken))
                                    throw new BadRequestException("Invalid refresh token");
                        
                                String email = jwtService.extractUsername(refreshToken);
                                User user = userRepo.findByEmail(email)
                                        .orElseThrow(() -> new NotFoundException("User not found"));
                        
                                if (!jwtService.isValid(refreshToken, user))
                                    throw new BadRequestException("Refresh token expired");
                        
                                return ApiResponse.success(buildAuthResponse(user), "Token refreshed");
                            }
                        
                            public void logout(String accessToken) {
                                // Optionally: blacklist token in Redis or DB
                                // For stateless: client just deletes token
                                SecurityContextHolder.clearContext();
                            }
                        
                            private AuthResponse buildAuthResponse(User user) {
                                return AuthResponse.builder()
                                        .accessToken(jwtService.generateAccessToken(user))
                                        .refreshToken(jwtService.generateRefreshToken(user))
                                        .tokenType("Bearer")
                                        .expiresIn(86400)
                                        .user(UserInfo.from(user))
                                        .build();
                            }
                        }""", "java",
                "@AuthenticationPrincipal inject current user ។ authManager.authenticate() throws on failure ។", 2);

        Lesson l4_4 = ls(ch4, c, "Method-Level Security & Role Authorization", 4,
                "@PreAuthorize: check permission BEFORE method executes ។\n\n" +
                        "@PostAuthorize: check permission AFTER method executes (ស្រ with return value) ។\n\n" +
                        "@Secured: simpler role check ។\n\n" +
                        "SpEL expressions: hasRole(), hasAnyRole(), #id == authentication.principal.id ។");

        sn(l4_4, "@PreAuthorize Examples", """
                        // ─── Enable in Security Config ─────────────────────────────
                        @EnableMethodSecurity(prePostEnabled = true)
                        
                        // ─── Controller with Method-Level Security ─────────────────
                        @RestController
                        @RequestMapping("/v1/courses")
                        @RequiredArgsConstructor
                        public class CourseController {
                        
                            private final CourseService courseService;
                        
                            // Anyone can view
                            @GetMapping
                            public ResponseEntity<ApiResponse<PageResponse<CourseResponse>>> getAll(
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
                                Pageable pageable = PageRequest.of(page, size,
                                        Sort.by("createdAt").descending());
                                return ResponseEntity.ok(
                                        ApiResponse.success(courseService.getAll(pageable), "OK"));
                            }
                        
                            // Only INSTRUCTOR or ADMIN can create
                            @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
                            @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
                            public ResponseEntity<ApiResponse<CourseResponse>> create(
                                    @Valid CourseRequest request,
                                    @RequestParam(required = false) MultipartFile thumbnail,
                                    @AuthenticationPrincipal User currentUser) {
                                return ResponseEntity.status(201)
                                        .body(courseService.create(request, thumbnail, currentUser));
                            }
                        
                            // Only course owner or ADMIN can update
                            @PutMapping("/{id}")
                            @PreAuthorize("hasRole('ADMIN') or " +
                                          "@courseSecurityService.isOwner(#id, authentication.principal)")
                            public ResponseEntity<ApiResponse<CourseResponse>> update(
                                    @PathVariable Long id,
                                    @Valid @RequestBody CourseRequest request,
                                    @AuthenticationPrincipal User currentUser) {
                                return ResponseEntity.ok(
                                        courseService.update(id, request, currentUser));
                            }
                        
                            // Only ADMIN can delete
                            @DeleteMapping("/{id}")
                            @PreAuthorize("hasRole('ADMIN')")
                            public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
                                return ResponseEntity.ok(courseService.delete(id, null));
                            }
                        }
                        
                        // ─── CourseSecurityService ─────────────────────────────────
                        @Service("courseSecurityService")
                        @RequiredArgsConstructor
                        public class CourseSecurityService {
                            private final CourseRepository courseRepo;
                        
                            public boolean isOwner(Long courseId, User user) {
                                return courseRepo.findById(courseId)
                                        .map(c -> c.getInstructor().getId().equals(user.getId()))
                                        .orElse(false);
                            }
                        }""", "java",
                "@courseSecurityService bean ប្រើ SpEL expression ។ #id inject method parameter ។", 1);

        // ══════════════════════════════════════════════════════════════════
        //  CHAPTER 5 – REST API Controllers
        // ══════════════════════════════════════════════════════════════════
        Chapter ch5 = ch(c, "REST API – Controllers & Validation", 5);

        Lesson l5_1 = ls(ch5, c, "Controller Best Practices & Validation", 1,
                "@Valid ប្រើ Bean Validation annotations: @NotBlank, @Email, @Size, @Min, @Max ។\n\n" +
                        "DTOs (Data Transfer Objects) ជ្រោះ data, security, flexibility ។\n\n" +
                        "@RequestBody (JSON), @ModelAttribute (form-data), @RequestParam (query) ។\n\n" +
                        "ResponseEntity<T> control status code + headers ។");

        sn(l5_1, "Request DTOs with Validation", """
                        // CourseRequest.java
                        @Data
                        public class CourseRequest {
                        
                            @NotBlank(message = "Title is required")
                            @Size(min = 5, max = 200, message = "Title must be 5-200 characters")
                            private String title;
                        
                            @NotBlank(message = "Description is required")
                            @Size(min = 20, message = "Description must be at least 20 characters")
                            private String description;
                        
                            @NotNull(message = "Level is required")
                            @Pattern(regexp = "BEGINNER|INTERMEDIATE|ADVANCED",
                                     message = "Level must be BEGINNER, INTERMEDIATE or ADVANCED")
                            private String level;
                        
                            @NotNull(message = "isPaid is required")
                            private Boolean isPaid;
                        
                            private Long categoryId;
                        }
                        
                        // LessonRequest.java
                        @Data
                        public class LessonRequest {
                        
                            @NotBlank(message = "Title is required")
                            private String title;
                        
                            @NotBlank(message = "Content is required")
                            private String content;
                        
                            @NotNull
                            @Min(value = 1, message = "Order index must be >= 1")
                            private Integer orderIndex;
                        
                            @URL(message = "Video URL must be a valid URL")
                            private String videoUrl;
                        
                            @Min(0) @Max(300)
                            private Integer durationMinutes;
                        }
                        
                        // RegisterRequest.java
                        @Data
                        public class RegisterRequest {
                            @NotBlank @Email(message = "Invalid email format")
                            private String email;
                        
                            @NotBlank
                            @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
                                     message = "Password: min 8 chars, at least 1 letter and 1 number")
                            private String password;
                        
                            @NotBlank
                            @Size(min = 3, max = 50)
                            private String username;
                        }""", "java",
                "@Pattern ប្រើ regex ។ @Valid ដាក់នៅ method parameter ។ Error message custom ។", 1);

        // ══════════════════════════════════════════════════════════════════
        //  CHAPTER 6 – Testing
        // ══════════════════════════════════════════════════════════════════
        Chapter ch6 = ch(c, "Testing – Unit & Integration", 6);

        Lesson l6_1 = ls(ch6, c, "Unit Testing Service Layer", 1,
                "Unit Test: test business logic ដោយ mock dependencies ។\n\n" +
                        "@ExtendWith(MockitoExtension.class): Mockito with JUnit 5 ។\n\n" +
                        "@Mock: create mock object ។ @InjectMocks: inject mocks ។\n\n" +
                        "when(...).thenReturn(...): define mock behavior ។\n\n" +
                        "verify(...): check mock was called ។ assertThrows: test exceptions ។");

        sn(l6_1, "CourseServiceTest", """
                        @ExtendWith(MockitoExtension.class)
                        class CourseServiceTest {
                        
                            @Mock private CourseRepository  courseRepo;
                            @Mock private CourseMapper      mapper;
                            @Mock private CloudinaryService cloudinary;
                            @InjectMocks private CourseServiceImpl courseService;
                        
                            private User mockInstructor;
                            private Course mockCourse;
                        
                            @BeforeEach
                            void setUp() {
                                mockInstructor = User.builder()
                                        .id(1L).email("ins@test.com").role(Role.INSTRUCTOR).build();
                                mockCourse = Course.builder()
                                        .id(1L).title("Spring Boot").slug("spring-boot")
                                        .instructor(mockInstructor).build();
                            }
                        
                            // ─── getBySlugFull ───────────────────────────────────
                            @Test
                            @DisplayName("getBySlugFull: return course when found")
                            void getBySlugFull_found() {
                                // Arrange
                                when(courseRepo.findBySlugWithFullContent("spring-boot"))
                                        .thenReturn(Optional.of(mockCourse));
                                CourseDetailResponse mockResponse = new CourseDetailResponse();
                                when(mapper.toDetailResponse(mockCourse)).thenReturn(mockResponse);
                        
                                // Act
                                ApiResponse<CourseDetailResponse> result =
                                        courseService.getBySlugFull("spring-boot");
                        
                                // Assert
                                assertThat(result.isSuccess()).isTrue();
                                assertThat(result.getPayload()).isEqualTo(mockResponse);
                                verify(courseRepo).findBySlugWithFullContent("spring-boot");
                            }
                        
                            @Test
                            @DisplayName("getBySlugFull: throw NotFoundException when not found")
                            void getBySlugFull_notFound() {
                                when(courseRepo.findBySlugWithFullContent("unknown"))
                                        .thenReturn(Optional.empty());
                        
                                assertThrows(NotFoundException.class,
                                        () -> courseService.getBySlugFull("unknown"));
                            }
                        
                            // ─── create ──────────────────────────────────────────
                            @Test
                            @DisplayName("create: success when title not duplicate")
                            void create_success() {
                                CourseRequest req = new CourseRequest();
                                req.setTitle("New Course"); req.setDescription("Description here....");
                                req.setLevel("BEGINNER"); req.setIsPaid(false);
                        
                                when(courseRepo.existsByTitle("New Course")).thenReturn(false);
                                when(courseRepo.existsBySlug(any())).thenReturn(false);
                                when(courseRepo.save(any(Course.class))).thenReturn(mockCourse);
                                when(mapper.toResponse(mockCourse)).thenReturn(new CourseResponse());
                        
                                ApiResponse<CourseResponse> result =
                                        courseService.create(req, null, mockInstructor);
                        
                                assertThat(result.getStatus()).isEqualTo(201);
                                verify(courseRepo).save(any(Course.class));
                            }
                        
                            @Test
                            @DisplayName("create: throw BadRequestException when title duplicate")
                            void create_duplicateTitle() {
                                CourseRequest req = new CourseRequest();
                                req.setTitle("Spring Boot");
                        
                                when(courseRepo.existsByTitle("Spring Boot")).thenReturn(true);
                        
                                assertThrows(BadRequestException.class,
                                        () -> courseService.create(req, null, mockInstructor));
                                verify(courseRepo, never()).save(any());
                            }
                        }""", "java",
                "@DisplayName ជួយ readable tests ។ verify(repo, never()) ប្រូវ save មិន call ។", 1);

        sn(l6_1, "Integration Test – Controller", """
                        @SpringBootTest
                        @AutoConfigureMockMvc
                        @ActiveProfiles("test")
                        class CourseControllerIntegrationTest {
                        
                            @Autowired private MockMvc mockMvc;
                            @Autowired private ObjectMapper objectMapper;
                            @MockBean  private CourseService courseService;
                        
                            private String adminToken;
                        
                            @BeforeEach
                            void setUp() {
                                // Generate test token
                                adminToken = "Bearer test-jwt-token";
                            }
                        
                            @Test
                            @DisplayName("GET /v1/courses - returns 200 with page")
                            void getAll_success() throws Exception {
                                PageResponse<CourseResponse> page = new PageResponse<>();
                        
                                when(courseService.getAll(any(Pageable.class)))
                                        .thenReturn(page);
                        
                                mockMvc.perform(get("/v1/courses")
                                                .param("page", "0")
                                                .param("size", "10"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.status").value(200));
                            }
                        
                            @Test
                            @DisplayName("POST /v1/courses - returns 401 without token")
                            void create_unauthorized() throws Exception {
                                mockMvc.perform(post("/v1/courses")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("{}"))
                                        .andExpect(status().isUnauthorized());
                            }
                        
                            @Test
                            @WithMockUser(roles = "ADMIN")
                            @DisplayName("DELETE /v1/courses/1 - returns 200 as ADMIN")
                            void delete_asAdmin() throws Exception {
                                when(courseService.delete(1L, null))
                                        .thenReturn(ApiResponse.success(null, "Deleted"));
                        
                                mockMvc.perform(delete("/v1/courses/1"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.message").value("Deleted"));
                            }
                        }""", "java",
                "@WithMockUser simulate authenticated user ។ @MockBean replace real bean in context ។", 2);

        done(c);
    }

    // ══════════════════════════════════════════════════════════════════════════
// HELPERS - short names for clean code above
// ══════════════════════════════════════════════════════════════════════════

    private Category cat(String name, String slug, String desc, int order) {
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            log.info("🗂️ Cat: {}", name);
            return categoryRepository.save(Category.builder()
                    .name(name).slug(slug).description(desc)
                    .isActive(true).orderIndex(order).createdAt(now()).build());
        });
    }

    private Course course(String title, String slug, String desc,
                          String level, boolean featured, User ins, Category cat) {

        CourseLevel parsedLevel;
        try {
            parsedLevel = CourseLevel.valueOf(level);
        } catch (IllegalArgumentException e) {
            if (level.contains("ADVANCED")) parsedLevel = CourseLevel.ADVANCED;
            else if (level.contains("INTERMEDIATE")) parsedLevel = CourseLevel.INTERMEDIATE;
            else parsedLevel = CourseLevel.BEGINNER;
        }
        final CourseLevel finalLevel = parsedLevel;

        return courseRepository.findBySlug(slug)
                .or(() -> courseRepository.findByTitle(title))
                .orElseGet(() -> {
                    log.info("📚 Course: {}", title);
                    return courseRepository.save(Course.builder()
                            .title(title).slug(slug).description(desc)
                            .level(finalLevel).language("Khmer")
                            .status(CourseStatus.PUBLISHED)
                            .isFeatured(featured).isFree(true)
                            .instructor(ins).category(cat)
                            .createdAt(now()).publishedAt(now()).build());
                });
    }

    private Chapter ch(Course course, String title, int order) {
        return chapterRepository.findByCourseIdAndTitle(course.getId(), title)
                .orElseGet(() -> {
                    log.debug("  📂 Chapter: {}", title);
                    return chapterRepository.save(Chapter.builder()
                            .title(title).orderIndex(order)
                            .course(course).createdAt(now()).build());
                });
    }

    private Lesson ls(Chapter chapter, Course course,
                      String title, int order, String content) {
        return lessonRepository.findByChapterIdAndTitle(chapter.getId(), title)
                .orElseGet(() -> {
                    String slug = uniqueLessonSlug(course, title);
                    log.debug("    📖 Lesson: {} → slug: {}", title, slug);
                    return lessonRepository.save(Lesson.builder()
                            .title(title)
                            .slug(slug)
                            .content(content)
                            .orderIndex(order)
                            .chapter(chapter)
                            .course(course)
                            .createdAt(now())
                            .build());
                });
    }

    private void sn(Lesson lesson, String title, String code,
                    String lang, String explanation, int order) {
        if (codeSnippetRepository.existsByTitleAndLessonId(title, lesson.getId())) return;
        log.debug("      💻 Snippet: {}", title);
        codeSnippetRepository.save(CodeSnippet.builder()
                .title(title).code(code).language(lang)
                .explanation(explanation).orderIndex(order)
                .lesson(lesson).createdAt(now()).build());
    }

    private void done(Course course) {
        int total = lessonRepository.countByCourseId(course.getId());
        course.setTotalLessons(total);
        courseRepository.save(course);
        log.info("✅ {} → {} lessons seeded", course.getTitle(), total);
    }

// ── Slug Helpers ──────────────────────────────────────────────────────────

    /**
     * Convert a title to a URL-safe slug.
     * Keeps: latin letters, digits, hyphens, AND Khmer unicode (U+1780–U+17FF, U+19E0–U+19FF).
     * <p>
     * Examples:
     * "Spring Boot គឺជាអ្វី?" → "spring-boot-គឺជាអ្វី"
     * "Variables & Data Types" → "variables-data-types"
     * "HTML គឺជាអ្វី?"        → "html-គឺជាអ្វី"
     */
    private String toSlug(String text) {
        if (text == null || text.isBlank()) return "lesson";
        String slug = text.toLowerCase().trim()
                // Keep latin a-z, 0-9, whitespace, hyphens, Khmer main block, Khmer symbols
                .replaceAll("[^a-z0-9\\s\\-\u1780-\u17FF\u19E0-\u19FF]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
        return slug.isBlank() ? "lesson" : slug;
    }

    /**
     * Ensure slug is unique within a course.
     * If "spring-boot-គឺជាអ្វី" already exists → "spring-boot-គឺជាអ្វី-2", etc.
     */
    private String uniqueLessonSlug(Course course, String title) {
        String base = toSlug(title);
        String candidate = base;
        int suffix = 2;
        while (lessonRepository.existsByCourseIdAndSlug(course.getId(), candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private LocalDateTime now() {
        return LocalDateTime.now();
    }
}
