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
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfiguration {

        @Bean
        public CookieServerCsrfTokenRepository gatewayCsrfTokenRepository() {
                CookieServerCsrfTokenRepository repository =
                                CookieServerCsrfTokenRepository.withHttpOnlyFalse();

                repository.setCookiePath("/");

                return repository;
        }

        @Bean
        public SecurityWebFilterChain securityWebFilterChain(
                        ServerHttpSecurity http,
                        ReactiveJwtDecoder gatewayJwtDecoder,
                        Converter<Jwt, Mono<AbstractAuthenticationToken>> gatewayJwtAuthenticationConverter,
                        CookieServerBearerTokenAuthenticationConverter bearerTokenConverter,
                        GatewayAuthenticationEntryPoint authenticationEntryPoint,
                        GatewayAccessDeniedHandler accessDeniedHandler,
                        CookieServerCsrfTokenRepository gatewayCsrfTokenRepository) {
                http
                                /*
                                 * Les mutations métier utilisent un JWT en cookie :
                                 * le Gateway valide donc le token CSRF avant
                                 * de supprimer le header Cookie au routage.
                                 */
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(
                                                                gatewayCsrfTokenRepository)
                                                .requireCsrfProtectionMatcher(
                                                                new OrServerWebExchangeMatcher(
                                                                                ServerWebExchangeMatchers
                                                                                                .pathMatchers(
                                                                                                                HttpMethod.POST,
                                                                                                                "/api/shipments/**"),
                                                                                ServerWebExchangeMatchers
                                                                                                .pathMatchers(
                                                                                                                HttpMethod.PATCH,
                                                                                                                "/api/exports/**"))))

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
                                                                "/api/auth/login")
                                                .permitAll()

                                                .pathMatchers(
                                                                HttpMethod.GET,
                                                                "/api/auth/csrf")
                                                .permitAll()

                                                .pathMatchers(
                                                                HttpMethod.POST,
                                                                "/api/auth/logout")
                                                .permitAll()

                                                /*
                                                 * Routes d'authentification protégées.
                                                 */
                                                .pathMatchers(
                                                                HttpMethod.GET,
                                                                "/api/auth/me")
                                                .authenticated()

                                                .pathMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/auth/password")
                                                .authenticated()

                                                /*
                                                 * Toutes les routes métier shipments
                                                 * nécessitent un rôle back-office.
                                                 */
                                                .pathMatchers(
                                                                "/api/shipments/**")
                                                .hasAnyAuthority(
                                                                "ROLE_ADMIN",
                                                                "ROLE_OPERATOR")

                                                .pathMatchers(
                                                                "/api/exports/**")
                                                .hasAnyAuthority(
                                                                "ROLE_ADMIN",
                                                                "ROLE_OPERATOR")

                                                /*
                                                 * Les statistiques sont accessibles uniquement
                                                 * en lecture aux rôles du back-office.
                                                 */
                                                .pathMatchers(
                                                                HttpMethod.GET,
                                                                "/api/statistics/**")
                                                .hasAnyAuthority(
                                                                "ROLE_ADMIN",
                                                                "ROLE_OPERATOR")

                                                /*
                                                 * Endpoints techniques du Gateway.
                                                 */
                                                .pathMatchers(
                                                                "/actuator/health",
                                                                "/actuator/health/**",
                                                                "/actuator/info")
                                                .permitAll()

                                                /*
                                                 * Refus explicite de toute route oubliée,
                                                 * notamment les routes automatiques Eureka.
                                                 */
                                                .anyExchange()
                                                .denyAll())

                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .bearerTokenConverter(
                                                                bearerTokenConverter)
                                                .jwt(jwt -> jwt
                                                                .jwtDecoder(
                                                                                gatewayJwtDecoder)
                                                                .jwtAuthenticationConverter(
                                                                                gatewayJwtAuthenticationConverter))
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint)
                                                .accessDeniedHandler(
                                                                accessDeniedHandler))

                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint)
                                                .accessDeniedHandler(
                                                                accessDeniedHandler));

                return http.build();
        }
}
