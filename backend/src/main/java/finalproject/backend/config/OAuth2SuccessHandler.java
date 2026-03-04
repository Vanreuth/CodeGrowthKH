package finalproject.backend.config;

import finalproject.backend.modal.RefreshToken;
import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.repository.RoleRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.service.JwtService;
import finalproject.backend.service.RefreshTokenService;
import finalproject.backend.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
            String email = (String) oauthUser.getAttributes().get("email");

            if (email == null || email.isBlank()) {
                redirectWithError(request, response, "OAuth email is missing");
                return;
            }

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createOAuthUser(email));

            Authentication authToken = new UsernamePasswordAuthenticationToken(
                    user, null, user.getAuthorities());
            String accessToken = jwtService.generateAccessToken(authToken);
            RefreshToken refresh = refreshTokenService.createRefreshToken(user);

            CookieUtil.addCookie(response, CookieUtil.ACCESS_TOKEN, accessToken, 15 * 60 * 1000L);
            CookieUtil.addCookie(response, CookieUtil.REFRESH_TOKEN, refresh.getToken(), 24 * 60 * 60 * 1000L);

            String targetUrl = UriComponentsBuilder
                    .fromUriString(redirectUri)
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception ex) {
            redirectWithError(request, response, ex.getMessage());
        }
    }

    private User createOAuthUser(String email) {
        Role roleUser = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));

        String baseUsername = email.split("@")[0];
        String username = baseUsername + "_" + UUID.randomUUID().toString().substring(0, 6);
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + UUID.randomUUID().toString().substring(0, 6);
        }

        User newUser = User.builder()
                .email(email)
                .username(username)
                .password(null)
                .status("ACTIVE")
                .roles(Set.of(roleUser))
                .build();

        return userRepository.save(newUser);
    }

    private void redirectWithError(HttpServletRequest request,
                                   HttpServletResponse response,
                                   String rawMessage) throws IOException {
        String message = (rawMessage == null || rawMessage.isBlank())
                ? "OAuth login failed"
                : rawMessage;

        String targetUrl = UriComponentsBuilder
                .fromUriString(redirectUri)
                .queryParam("error", message)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
