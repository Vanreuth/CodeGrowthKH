package finalproject.backend.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.util.WebUtils;

public final class CookieUtil {

    private CookieUtil() {}

    public static final String ACCESS_TOKEN  = "access_token";
    public static final String REFRESH_TOKEN = "refresh_token";

    private static boolean isProductionProfile() {
        String activeProfiles = System.getProperty("spring.profiles.active");
        if (activeProfiles == null || activeProfiles.isBlank()) {
            activeProfiles = System.getenv("SPRING_PROFILES_ACTIVE");
        }
        return activeProfiles != null && activeProfiles.toLowerCase().contains("prod");
    }

    private static String cookieAttributes(long maxAgeMs, boolean clear) {
        // Local HTTP cannot use SameSite=None without Secure.
        // Use Lax for local dev; use None+Secure in production/cross-site deployments.
        boolean secure = isProductionProfile();
        String sameSite = secure ? "None" : "Lax";
        long maxAge = clear ? 0 : (maxAgeMs / 1000);

        return "; HttpOnly"
                + (secure ? "; Secure" : "")
                + "; Path=/"
                + "; SameSite=" + sameSite
                + "; Max-Age=" + maxAge;
    }

    public static void addCookie(HttpServletResponse response,
                                 String name, String value, long maxAgeMs) {
        response.addHeader("Set-Cookie", name + "=" + value + cookieAttributes(maxAgeMs, false));
    }

    public static void clearCookie(HttpServletResponse response, String name) {
        response.addHeader("Set-Cookie", name + "=" + cookieAttributes(0, true));
    }

    public static String getCookieValue(HttpServletRequest request, String name) {
        Cookie cookie = WebUtils.getCookie(request, name);
        return (cookie != null) ? cookie.getValue() : null;
    }
}
