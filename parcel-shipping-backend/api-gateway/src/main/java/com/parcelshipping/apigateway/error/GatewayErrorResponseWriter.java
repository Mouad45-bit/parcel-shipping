package com.parcelshipping.apigateway.error;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Component
public class GatewayErrorResponseWriter {

    private final ObjectMapper objectMapper;

    public GatewayErrorResponseWriter(
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
    }

    public Mono<Void> write(
            ServerWebExchange exchange,
            HttpStatus status,
            String code,
            String message
    ) {
        if (exchange.getResponse().isCommitted()) {
            return Mono.empty();
        }

        GatewayApiErrorResponse responseBody =
                new GatewayApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        code,
                        message,
                        exchange
                                .getRequest()
                                .getPath()
                                .value(),
                        List.of()
                );

        byte[] responseBytes;

        try {
            responseBytes = objectMapper
                    .writeValueAsBytes(responseBody);
        } catch (JsonProcessingException exception) {
            return Mono.error(exception);
        }

        exchange.getResponse().setStatusCode(status);

        exchange
                .getResponse()
                .getHeaders()
                .setContentType(
                        MediaType.APPLICATION_JSON
                );

        exchange
                .getResponse()
                .getHeaders()
                .set(
                        HttpHeaders.CACHE_CONTROL,
                        "no-store"
                );

        exchange
                .getResponse()
                .getHeaders()
                .set(
                        HttpHeaders.PRAGMA,
                        "no-cache"
                );

        DataBuffer responseBuffer = exchange
                .getResponse()
                .bufferFactory()
                .wrap(responseBytes);

        return exchange
                .getResponse()
                .writeWith(
                        Mono.just(responseBuffer)
                );
    }
}
