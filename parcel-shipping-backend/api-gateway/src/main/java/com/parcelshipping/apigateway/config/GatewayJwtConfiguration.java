package com.parcelshipping.apigateway.config;

import com.parcelshipping.apigateway.security.GatewayJwtAudienceValidator;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtGrantedAuthoritiesConverterAdapter;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
@EnableConfigurationProperties(
        GatewayJwtProperties.class
)
public class GatewayJwtConfiguration {

    private static final int MINIMUM_SECRET_LENGTH_BYTES = 32;

    @Bean
    public SecretKey gatewayJwtSecretKey(
            GatewayJwtProperties jwtProperties
    ) {
        byte[] secretBytes;

        try {
            secretBytes = Base64
                    .getDecoder()
                    .decode(jwtProperties.secret());
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "security.jwt.secret must be Base64 encoded",
                    exception
            );
        }

        if (secretBytes.length < MINIMUM_SECRET_LENGTH_BYTES) {
            throw new IllegalStateException(
                    "security.jwt.secret must contain at least "
                            + MINIMUM_SECRET_LENGTH_BYTES
                            + " decoded bytes"
            );
        }

        return new SecretKeySpec(
                secretBytes,
                "HmacSHA256"
        );
    }

    @Bean
    public ReactiveJwtDecoder gatewayJwtDecoder(
            SecretKey gatewayJwtSecretKey,
            GatewayJwtProperties jwtProperties
    ) {
        NimbusReactiveJwtDecoder jwtDecoder =
                NimbusReactiveJwtDecoder
                        .withSecretKey(
                                gatewayJwtSecretKey
                        )
                        .macAlgorithm(
                                MacAlgorithm.HS256
                        )
                        .build();

        OAuth2TokenValidator<Jwt> issuerValidator =
                JwtValidators.createDefaultWithIssuer(
                        jwtProperties.issuer()
                );

        OAuth2TokenValidator<Jwt> audienceValidator =
                new GatewayJwtAudienceValidator(
                        jwtProperties.audience()
                );

        jwtDecoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(
                        issuerValidator,
                        audienceValidator
                )
        );

        return jwtDecoder;
    }

    @Bean
    public Converter<
            Jwt,
            Mono<AbstractAuthenticationToken>
            > gatewayJwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        /*
         * Le JWT contient actuellement :
         * "role": "ADMIN" ou "OPERATOR".
         */
        authoritiesConverter.setAuthoritiesClaimName(
                "role"
        );

        authoritiesConverter.setAuthorityPrefix(
                "ROLE_"
        );

        ReactiveJwtAuthenticationConverter authenticationConverter =
                new ReactiveJwtAuthenticationConverter();

        authenticationConverter
                .setJwtGrantedAuthoritiesConverter(
                        new ReactiveJwtGrantedAuthoritiesConverterAdapter(
                                authoritiesConverter
                        )
                );

        return authenticationConverter;
    }
}
