package finalproject.backend.config;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Creates a single Playwright + Chromium browser instance shared across
 * the entire application lifetime.
 *
 * WHY:  Launching Chromium costs ~1.5 s per request.
 *       As a lazy singleton bean it launches once on the first PDF request
 *       and is reused after that.
 *
 * THREAD SAFETY:
 *       Browser is thread-safe for concurrent page creation.
 *       Each PDF request opens its own BrowserContext + Page and closes
 *       them immediately, so there is no shared mutable state between
 *       concurrent calls.
 */
@Slf4j
@Configuration
public class PlaywrightConfig {

    @Lazy
    @Bean(destroyMethod = "close")
    public Playwright playwright() {
        log.info("🎭 Creating singleton Playwright instance");
        return Playwright.create();
    }

    @Lazy
    @Bean(destroyMethod = "close")
    public Browser browser(Playwright playwright) {
        List<String> args = new ArrayList<>();
        String os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);

        if (os.contains("linux")) {
            // Required for containers / Linux CI environments
            args.add("--no-sandbox");
            args.add("--disable-setuid-sandbox");
            args.add("--disable-dev-shm-usage");
            args.add("--disable-gpu");
        }

        // Extra speed flags — safe for headless PDF generation
        args.add("--disable-extensions");
        args.add("--disable-background-networking");
        args.add("--disable-sync");
        args.add("--disable-translate");
        args.add("--hide-scrollbars");
        args.add("--metrics-recording-only");
        args.add("--mute-audio");
        args.add("--no-first-run");
        args.add("--safebrowsing-disable-auto-update");

        log.info("🚀 Launching singleton Chromium on os='{}' args={}", os, args);

        BrowserType.LaunchOptions opts = new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(args);

        Browser b = playwright.chromium().launch(opts);
        log.info("✅ Singleton Chromium ready");
        return b;
    }
}
