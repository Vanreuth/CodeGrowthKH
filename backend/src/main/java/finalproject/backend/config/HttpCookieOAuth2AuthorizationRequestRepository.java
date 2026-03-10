package finalproject.backend.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oauth2_auth_request";
    private static final int    MAX_AGE     = 180; // 3 minutes

    // ── Save OAuth2 state into a cookie ──────────────────────────────────────
    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authRequest == null) {
            deleteCookie(request, response);
            return;
        }
        String value = Base64.getUrlEncoder().encodeToString(
                SerializationUtils.serialize(authRequest));

        Cookie cookie = new Cookie(COOKIE_NAME, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(MAX_AGE);
        response.addCookie(cookie);
    }

    // ── Load OAuth2 state from cookie ─────────────────────────────────────────
    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(
            HttpServletRequest request) {
        return findCookie(request)
                .map(Cookie::getValue)
                .map(v -> (OAuth2AuthorizationRequest)
                        SerializationUtils.deserialize(
                                Base64.getUrlDecoder().decode(v)))
                .orElse(null);
    }

    // ── Remove cookie after use ───────────────────────────────────────────────
    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response) {
        OAuth2AuthorizationRequest req = loadAuthorizationRequest(request);
        deleteCookie(request, response);
        return req;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Optional<Cookie> findCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
                .filter(c -> COOKIE_NAME.equals(c.getName()))
                .findFirst();
    }

    private void deleteCookie(HttpServletRequest request,
                              HttpServletResponse response) {
        findCookie(request).ifPresent(c -> {
            c.setValue("");
            c.setPath("/");
            c.setMaxAge(0);
            response.addCookie(c);
        });
    }
}