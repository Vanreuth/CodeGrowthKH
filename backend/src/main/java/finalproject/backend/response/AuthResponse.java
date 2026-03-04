package finalproject.backend.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Returned after login/refresh.
 * Token is NOT included here — it lives in the HttpOnly cookie.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private Long         id;
    private String       username;
    private String       email;
    private String phoneNumber;
    private String address;
    private String bio;
    private String profilePicture;
    private List<String> roles;
    // ← no token field — cookie handles it
}
