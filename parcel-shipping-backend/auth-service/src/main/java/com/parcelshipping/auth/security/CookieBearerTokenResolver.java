package com.parcelshipping.auth.security;

import com.parcelshipping.auth.config.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class CookieBearerTokenResolver
        implements BearerTokenResolver {

    private static final Set<String> PUBLIC_AUTH_PATHS =
            Set.of(
                    "/api/auth/login",
                    "/api/auth/logout",
                    "/api/auth/csrf"
            );

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
        if (
                PUBLIC_AUTH_PATHS.contains(
                        request.getServletPath()
                )
        ) {
            return null;
        }

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
