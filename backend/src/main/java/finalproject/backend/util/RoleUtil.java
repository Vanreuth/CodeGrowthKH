package finalproject.backend.util;

public final class RoleUtil {

    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_MODERATOR = "ROLE_MODERATOR";

    private RoleUtil() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return ROLE_USER;
        }

        String normalized = value.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }

        return switch (normalized) {
            case ROLE_USER, ROLE_ADMIN, ROLE_MODERATOR -> normalized;
            default -> throw new IllegalArgumentException("Unsupported role: " + value);
        };
    }
}
