package com.parcelshipping.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
public record GatewayJwtProperties(
        String issuer,
        String audience,
        String secret,
        CookieProperties cookie
) {

    public GatewayJwtProperties {
        requireText(issuer, "security.jwt.issuer");
        requireText(audience, "security.jwt.audience");
        requireText(secret, "security.jwt.secret");

        if (cookie == null) {
            throw new IllegalArgumentException(
                    "security.jwt.cookie is required"
            );
        }
    }

    public record CookieProperties(
            String name
    ) {

        public CookieProperties {
            requireText(
                    name,
                    "security.jwt.cookie.name"
            );
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
