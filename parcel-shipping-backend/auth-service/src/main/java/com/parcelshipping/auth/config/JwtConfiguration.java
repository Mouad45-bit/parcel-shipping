package com.parcelshipping.auth.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfiguration {

    private static final int MINIMUM_SECRET_LENGTH_BYTES = 32;

    @Bean
    public JwtEncoder jwtEncoder(
            JwtProperties jwtProperties
    ) {
        byte[] secretBytes;

        try {
            secretBytes = Base64.getDecoder()
                    .decode(jwtProperties.secret());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "security.jwt.secret must be Base64 encoded",
                    exception
            );
        }

        if (secretBytes.length < MINIMUM_SECRET_LENGTH_BYTES) {
            throw new IllegalStateException(
                    "security.jwt.secret must contain at least "
                            + MINIMUM_SECRET_LENGTH_BYTES
                            + " decoded bytes"
            );
        }

        SecretKey secretKey = new SecretKeySpec(
                secretBytes,
                "HmacSHA256"
        );

        JWKSource<SecurityContext> jwkSource =
                new ImmutableSecret<>(secretKey);

        return new NimbusJwtEncoder(jwkSource);
    }
}
