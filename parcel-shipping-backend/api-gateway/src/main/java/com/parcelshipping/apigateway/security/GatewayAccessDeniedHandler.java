package com.parcelshipping.apigateway.security;

import com.parcelshipping.apigateway.error.GatewayErrorResponseWriter;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GatewayAccessDeniedHandler
        implements ServerAccessDeniedHandler {

    private final GatewayErrorResponseWriter responseWriter;

    public GatewayAccessDeniedHandler(
            GatewayErrorResponseWriter responseWriter
    ) {
        this.responseWriter = responseWriter;
    }

    @Override
    public Mono<Void> handle(
            ServerWebExchange exchange,
            AccessDeniedException exception
    ) {
        return responseWriter.write(
                exchange,
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                "You are not allowed to perform this action."
        );
    }
}
