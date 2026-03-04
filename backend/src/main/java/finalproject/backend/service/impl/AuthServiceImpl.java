package finalproject.backend.service.impl;


import finalproject.backend.exception.CustomMessageException;
import finalproject.backend.modal.RefreshToken;
import finalproject.backend.modal.Role;
import finalproject.backend.modal.User;
import finalproject.backend.repository.RoleRepository;
import finalproject.backend.repository.UserRepository;
import finalproject.backend.request.LoginRequest;
import finalproject.backend.request.RegisterRequest;
import finalproject.backend.request.UpdateProfileRequest;
import finalproject.backend.response.ApiResponse;
import finalproject.backend.response.AuthResponse;
import finalproject.backend.response.UserResponse;
import finalproject.backend.service.AuthService;
import finalproject.backend.service.JwtService;
import finalproject.backend.service.R2StorageService;
import finalproject.backend.service.RefreshTokenService;
import finalproject.backend.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final RoleRepository roleRepository;
    private final R2StorageService r2StorageService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    // ─── REGISTER ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<Void> register(RegisterRequest request, MultipartFile profilePicture) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new CustomMessageException("Email already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        if(!request.getPassword().equals(request.getConfirmPassword())){
            throw new CustomMessageException("Passwords do not match",
                    String.valueOf(HttpStatus.BAD_REQUEST.value()));
        }

        if (userRepository.existsByUsername(request.getUsername()))
            throw new CustomMessageException("Username already exists",
                    String.valueOf(HttpStatus.CONFLICT.value()));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("ACTIVE")
                .roles(resolveRoles(request.getRoles()))
                .build();

        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                user.setProfilePicture(r2StorageService.uploadFile(profilePicture, "profile"));
            } catch (IOException e) {
                throw new CustomMessageException("Failed to upload profile picture: " + e.getMessage());
            }
        }

        userRepository.save(user);
        log.info("Registered: {}", user.getUsername());
        return ApiResponse.success("Registration successful — you can now login");
    }

    // ─── LOGIN ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApiResponse<AuthResponse> login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        userRepository.resetLoginAttempt(user.getUsername());

        String accessToken = jwtService.generateAccessToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        CookieUtil.addCookie(response, CookieUtil.ACCESS_TOKEN,
                accessToken, 15 * 60 * 1000L);                  // 15 min

        CookieUtil.addCookie(response, CookieUtil.REFRESH_TOKEN,
                refreshToken.getToken(), 24 * 60 * 60 * 1000L); // 24 hours

        log.info("Logged in: {}", user.getUsername());
        return ApiResponse.success(buildAuthResponse(user), "Login successful");
    }

    @Override
    @Transactional
    public ApiResponse<AuthResponse> refresh(HttpServletRequest request,
                                             HttpServletResponse response) {
        // 1. Read refresh token from cookie via CookieUtil ←────────────────────
        String refreshTokenValue = CookieUtil.getCookieValue(request, CookieUtil.REFRESH_TOKEN);

        if (refreshTokenValue == null)
            throw new CustomMessageException(
                    "Refresh token cookie missing — please login again",
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()));

        // 2. Validate refresh token against DB
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(refreshTokenValue);
        User user = refreshToken.getUser();

        // 3. Generate new access token
        String newAccessToken = jwtService.generateRefreshToken(user.getUsername());

        // 4. Set new access token cookie via CookieUtil ←───────────────────────
        CookieUtil.addCookie(response,
                CookieUtil.ACCESS_TOKEN, newAccessToken,
                15 * 60 * 1000L);                               // 15 min

        log.info("Refreshed token for: {}", user.getUsername());
        return ApiResponse.success(buildAuthResponse(user), "Token refreshed successfully");
    }

    // ─── LOGOUT — revoke DB token + clear cookies ─────────────────────────────

    @Override
    @Transactional
    public ApiResponse<Void> logout(HttpServletRequest request,
                                    HttpServletResponse response) {
        // 1. Read and revoke refresh token from DB
        String refreshTokenValue = CookieUtil.getCookieValue(request, CookieUtil.REFRESH_TOKEN);
        if (refreshTokenValue != null) {
            try {
                refreshTokenService.revokeRefreshToken(refreshTokenValue);
            } catch (Exception e) {
                log.warn("Refresh token not found on logout: {}", e.getMessage());
            }
        }

        // 2. Clear both cookies (Max-Age=0 → browser deletes immediately)
        CookieUtil.clearCookie(response, CookieUtil.ACCESS_TOKEN);
        CookieUtil.clearCookie(response, CookieUtil.REFRESH_TOKEN);

        // 3. Clear Spring Security context
        SecurityContextHolder.clearContext();

        log.info("User logged out");
        return ApiResponse.success("Logged out successfully");
    }

    // ─── ME ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AuthResponse> me(HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomMessageException("User not found",
                        String.valueOf(HttpStatus.NOT_FOUND.value())));
        return ApiResponse.success(buildAuthResponse(user), "Profile fetched successfully");
    }


    @Override
    public ApiResponse<AuthResponse> updateProfile(
            Authentication authentication,
            UpdateProfileRequest request,
            MultipartFile photo) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new CustomMessageException("Authentication required",
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()));
        }

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomMessageException("User not found",
                        String.valueOf(HttpStatus.NOT_FOUND.value())));

        if (request.getUsername() != null && !request.getUsername().isEmpty()
                && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername()))
                throw new CustomMessageException("Username already taken",
                        String.valueOf(HttpStatus.CONFLICT.value()));
            user.setUsername(request.getUsername());
        }
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getBio() != null) user.setBio(request.getBio());

        if (photo != null && !photo.isEmpty()) {
            try {
                String oldPhoto = user.getProfilePicture();
                if (oldPhoto != null && !oldPhoto.isEmpty()) {
                    r2StorageService.deleteFile(oldPhoto);
                }
                String url = r2StorageService.uploadFile(photo, "profile");
                user.setProfilePicture(url);
            } catch (IOException e) {
                throw new CustomMessageException("Failed to upload photo: " + e.getMessage());
            }
        }

        userRepository.save(user);
        return ApiResponse.success(buildAuthResponse(user), "Profile updated successfully");
    }

// ─── Helpers ──────────────────────────────────────────────────────────────

private AuthResponse buildAuthResponse(User user) {
    List<String> roles = user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(r -> r.replace("ROLE_", ""))   // ← strip prefix for display only
            .collect(Collectors.toList());

    return AuthResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .address(user.getAddress())
            .phoneNumber(user.getPhoneNumber())
            .bio(user.getBio())
            .profilePicture(user.getProfilePicture())
            .roles(roles)   // ← ["USER"] instead of ["ROLE_USER"]
            .build();
}


private Set<Role> resolveRoles(Set<String> requested) {
    if (ObjectUtils.isEmpty(requested))
        return Set.of(findOrCreateRole("USER"));  // ← "USER" not "ROLE_USER"
    return requested.stream()
            .map(this::findOrCreateRole)
            .collect(Collectors.toCollection(HashSet::new));
}

private Role findOrCreateRole(String name) {
    return roleRepository.findByName(name)
            .orElseGet(() -> roleRepository.save(
                    Role.builder().name(name).build()));
}
}
