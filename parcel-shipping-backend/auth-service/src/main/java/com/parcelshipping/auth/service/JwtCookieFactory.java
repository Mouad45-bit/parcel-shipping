package com.parcelshipping.auth.service;

import com.parcelshipping.auth.config.JwtProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class JwtCookieFactory {

    private final JwtProperties jwtProperties;

    public JwtCookieFactory(
            JwtProperties jwtProperties
    ) {
        this.jwtProperties = jwtProperties;
    }

    public ResponseCookie createAccessTokenCookie(
            String accessToken
    ) {
        return baseCookie(accessToken)
                .maxAge(jwtProperties.ttl())
                .build();
    }

    public ResponseCookie createExpiredAccessTokenCookie() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(
            String value
    ) {
        return ResponseCookie
                .from(
                        jwtProperties.cookie().name(),
                        value
                )
                .httpOnly(true)
                .secure(jwtProperties.cookie().secure())
                .sameSite(jwtProperties.cookie().sameSite())
                .path("/");
    }
}
