package com.parcelshipping.apigateway.config;

import com.parcelshipping.apigateway.security.CookieServerBearerTokenAuthenticationConverter;
import com.parcelshipping.apigateway.security.GatewayAccessDeniedHandler;
import com.parcelshipping.apigateway.security.GatewayAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfiguration {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            ReactiveJwtDecoder gatewayJwtDecoder,
            Converter<
                    Jwt,
                    Mono<AbstractAuthenticationToken>
                    > gatewayJwtAuthenticationConverter,
            CookieServerBearerTokenAuthenticationConverter
                    bearerTokenConverter,
            GatewayAuthenticationEntryPoint
                    authenticationEntryPoint,
            GatewayAccessDeniedHandler
                    accessDeniedHandler
    ) {
        http
                /*
                 * Le Gateway valide l'authentification.
                 *
                 * Le CSRF de /password et /logout reste contrôlé
                 * par auth-service, qui possède le repository
                 * et l'endpoint /api/auth/csrf.
                 */
                .csrf(csrf -> csrf.disable())

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .requestCache(cache -> cache.disable())

                .authorizeExchange(authorize -> authorize
                        /*
                         * Routes publiques d'authentification.
                         */
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/auth/login"
                        )
                        .permitAll()

                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/auth/csrf"
                        )
                        .permitAll()

                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/auth/logout"
                        )
                        .permitAll()

                        /*
                         * Routes d'authentification protégées.
                         */
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/auth/me"
                        )
                        .authenticated()

                        .pathMatchers(
                                HttpMethod.PATCH,
                                "/api/auth/password"
                        )
                        .authenticated()

                        /*
                         * Toutes les routes métier shipments
                         * nécessitent un rôle back-office.
                         */
                        .pathMatchers(
                                "/api/shipments/**"
                        )
                        .hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_OPERATOR"
                        )

                        /*
                         * Endpoints techniques du Gateway.
                         */
                        .pathMatchers(
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info"
                        )
                        .permitAll()

                        /*
                         * Refus explicite de toute route oubliée,
                         * notamment les routes automatiques Eureka.
                         */
                        .anyExchange()
                        .denyAll()
                )

                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenConverter(
                                bearerTokenConverter
                        )
                        .jwt(jwt -> jwt
                                .jwtDecoder(
                                        gatewayJwtDecoder
                                )
                                .jwtAuthenticationConverter(
                                        gatewayJwtAuthenticationConverter
                                )
                        )
                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                        .accessDeniedHandler(
                                accessDeniedHandler
                        )
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                        .accessDeniedHandler(
                                accessDeniedHandler
                        )
                );

        return http.build();
    }
}
