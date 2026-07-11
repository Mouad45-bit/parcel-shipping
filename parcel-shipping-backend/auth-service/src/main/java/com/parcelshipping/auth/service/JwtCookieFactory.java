package com.parcelshipping.auth.service;

import com.parcelshipping.auth.config.JwtProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

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
        return ResponseCookie
                .from(
                        jwtProperties.cookie().name(),
                        accessToken
                )
                .httpOnly(true)
                .secure(jwtProperties.cookie().secure())
                .sameSite(jwtProperties.cookie().sameSite())
                .path("/")
                .maxAge(jwtProperties.ttl())
                .build();
    }
}
