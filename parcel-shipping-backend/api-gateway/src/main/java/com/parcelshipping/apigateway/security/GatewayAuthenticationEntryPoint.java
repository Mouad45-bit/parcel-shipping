package com.parcelshipping.apigateway.security;

import com.parcelshipping.apigateway.error.GatewayErrorResponseWriter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GatewayAuthenticationEntryPoint
        implements ServerAuthenticationEntryPoint {

    private final GatewayErrorResponseWriter responseWriter;

    public GatewayAuthenticationEntryPoint(
            GatewayErrorResponseWriter responseWriter
    ) {
        this.responseWriter = responseWriter;
    }

    @Override
    public Mono<Void> commence(
            ServerWebExchange exchange,
            AuthenticationException exception
    ) {
        exchange
                .getResponse()
                .getHeaders()
                .set(
                        HttpHeaders.WWW_AUTHENTICATE,
                        "Bearer"
                );

        return responseWriter.write(
                exchange,
                HttpStatus.UNAUTHORIZED,
                "AUTHENTICATION_REQUIRED",
                "Authentication is required or "
                        + "the session has expired."
        );
    }
}
