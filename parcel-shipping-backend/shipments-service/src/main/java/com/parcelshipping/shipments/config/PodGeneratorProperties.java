package com.parcelshipping.shipments.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.time.Duration;
import java.util.Set;

@ConfigurationProperties(
        prefix = "pod-generator"
)
public record PodGeneratorProperties(
        URI baseUrl,
        Duration connectTimeout,
        Duration readTimeout
) {

    private static final Set<String>
            ALLOWED_SCHEMES =
            Set.of("http", "https");

    public PodGeneratorProperties {
        if (
                baseUrl == null
                        || baseUrl.getScheme() == null
                        || baseUrl.getHost() == null
                        || !ALLOWED_SCHEMES.contains(
                                baseUrl.getScheme()
                        )
        ) {
            throw new IllegalArgumentException(
                    "pod-generator.base-url must be a valid HTTP URL."
            );
        }

        requirePositive(
                connectTimeout,
                "pod-generator.connect-timeout"
        );

        requirePositive(
                readTimeout,
                "pod-generator.read-timeout"
        );
    }

    private static void requirePositive(
            Duration value,
            String propertyName
    ) {
        if (
                value == null
                        || value.isZero()
                        || value.isNegative()
        ) {
            throw new IllegalArgumentException(
                    propertyName
                            + " must be positive."
            );
        }
    }
}