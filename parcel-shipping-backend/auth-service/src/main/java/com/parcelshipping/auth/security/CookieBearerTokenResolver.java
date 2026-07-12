package com.parcelshipping.auth.security;

import com.parcelshipping.auth.config.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

@Component
public class CookieBearerTokenResolver
        implements BearerTokenResolver {

    private final JwtProperties jwtProperties;

    public CookieBearerTokenResolver(
            JwtProperties jwtProperties
    ) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public String resolve(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        String cookieName =
                jwtProperties.cookie().name();

        for (Cookie cookie : cookies) {
            if (
                    cookieName.equals(cookie.getName())
                            && cookie.getValue() != null
                            && !cookie.getValue().isBlank()
            ) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
