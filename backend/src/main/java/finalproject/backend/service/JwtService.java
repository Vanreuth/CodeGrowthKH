package finalproject.backend.service;

import finalproject.backend.modal.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String extractUsername(String token);
    String generateAccessToken(Authentication authentication);
    String generateAccessToken(User user);
    boolean isValidateToken(String token, UserDetails userDetails) ;
    boolean isTokenExpired(String token);
}
