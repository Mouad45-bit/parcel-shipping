package com.parcelshipping.apigateway.security;

import com.parcelshipping.apigateway.config.GatewayJwtProperties;
import org.springframework.http.HttpCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Set;

@Component
public class CookieServerBearerTokenAuthenticationConverter
        implements ServerAuthenticationConverter {

    private static final Set<String> PUBLIC_AUTH_PATHS =
            Set.of(
                    "/api/auth/login",
                    "/api/auth/logout",
                    "/api/auth/csrf"
            );

    private final GatewayJwtProperties jwtProperties;

    public CookieServerBearerTokenAuthenticationConverter(
            GatewayJwtProperties jwtProperties
    ) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public Mono<Authentication> convert(
            ServerWebExchange exchange
    ) {
        String requestPath = exchange
                .getRequest()
                .getPath()
                .pathWithinApplication()
                .value();

        /*
         * Un ancien JWT invalide ne doit pas empêcher
         * une nouvelle connexion ou un logout.
         */
        if (
                PUBLIC_AUTH_PATHS.contains(requestPath)
                        || requestPath.startsWith(
                                "/actuator/"
                        )
        ) {
            return Mono.empty();
        }

        HttpCookie accessTokenCookie = exchange
                .getRequest()
                .getCookies()
                .getFirst(
                        jwtProperties.cookie().name()
                );

        if (
                accessTokenCookie == null
                        || !StringUtils.hasText(
                                accessTokenCookie.getValue()
                        )
        ) {
            return Mono.empty();
        }

        return Mono.just(
                new BearerTokenAuthenticationToken(
                        accessTokenCookie.getValue()
                )
        );
    }
}
