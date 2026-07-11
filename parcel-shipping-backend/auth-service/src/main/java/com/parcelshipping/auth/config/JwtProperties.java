package com.parcelshipping.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.Set;

@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(
        String issuer,
        String audience,
        String secret,
        Duration ttl,
        CookieProperties cookie
) {

    private static final Set<String> ALLOWED_SAME_SITE_VALUES =
            Set.of("Lax", "Strict", "None");

    public JwtProperties {
        requireText(issuer, "security.jwt.issuer");
        requireText(audience, "security.jwt.audience");
        requireText(secret, "security.jwt.secret");

        if (ttl == null || ttl.isZero() || ttl.isNegative()) {
            throw new IllegalArgumentException(
                    "security.jwt.ttl must be positive"
            );
        }

        if (cookie == null) {
            throw new IllegalArgumentException(
                    "security.jwt.cookie is required"
            );
        }
    }

    public record CookieProperties(
            String name,
            boolean secure,
            String sameSite
    ) {

        public CookieProperties {
            requireText(name, "security.jwt.cookie.name");
            requireText(
                    sameSite,
                    "security.jwt.cookie.same-site"
            );

            if (!ALLOWED_SAME_SITE_VALUES.contains(sameSite)) {
                throw new IllegalArgumentException(
                        "security.jwt.cookie.same-site must be "
                                + "Lax, Strict or None"
                );
            }

            if ("None".equals(sameSite) && !secure) {
                throw new IllegalArgumentException(
                        "SameSite=None requires a secure cookie"
                );
            }
        }
    }

    private static void requireText(
            String value,
            String propertyName
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    propertyName + " is required"
            );
        }
    }
}
