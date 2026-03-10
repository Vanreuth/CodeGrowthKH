package finalproject.backend.config;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Setter
@Getter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    @NotBlank
    private String secret;

    @Min(60000)
    private long expiration =300000; // 5mn (5 * 60 * 1000)

    @Min(60000)
    private long refreshExpiration =  86400000; //24hours

}
