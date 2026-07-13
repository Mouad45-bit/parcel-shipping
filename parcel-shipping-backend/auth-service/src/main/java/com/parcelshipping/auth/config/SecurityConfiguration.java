package com.parcelshipping.auth.config;

import com.parcelshipping.auth.security.CookieBearerTokenResolver;
import com.parcelshipping.auth.security.RestAccessDeniedHandler;
import com.parcelshipping.auth.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.config.ObjectPostProcessor;
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy;
import org.springframework.security.web.csrf.CsrfFilter;

@Configuration
public class SecurityConfiguration {

        private static final int BCRYPT_STRENGTH = 12;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(
                                BCRYPT_STRENGTH);
        }

        @Bean
        public CookieCsrfTokenRepository csrfTokenRepository(
                        JwtProperties jwtProperties) {
                CookieCsrfTokenRepository repository = new CookieCsrfTokenRepository();

                repository.setCookiePath("/");

                repository.setCookieCustomizer(cookie -> cookie
                                /*
                                 * Le frontend reçoit le token dans la
                                 * réponse JSON de /csrf. Il n'a donc pas
                                 * besoin de lire directement le cookie.
                                 */
                                .httpOnly(true)
                                .secure(
                                                jwtProperties
                                                                .cookie()
                                                                .secure())
                                .sameSite(
                                                jwtProperties
                                                                .cookie()
                                                                .sameSite()));

                return repository;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtDecoder jwtDecoder,
                        CookieBearerTokenResolver bearerTokenResolver,
                        RestAuthenticationEntryPoint authenticationEntryPoint,
                        RestAccessDeniedHandler accessDeniedHandler,
                        CookieCsrfTokenRepository csrfTokenRepository) throws Exception {
                http
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(
                                                                csrfTokenRepository)

                                                /*
                                                 * L'authentification JWT est réalisée à chaque requête.
                                                 * Elle ne doit donc pas supprimer le token CSRF.
                                                 */
                                                .sessionAuthenticationStrategy(
                                                                new NullAuthenticatedSessionStrategy())

                                                /*
                                                 * OAuth2 Resource Server ignore normalement le CSRF
                                                 * pour les requêtes contenant un bearer token.
                                                 *
                                                 * Comme notre bearer token est stocké dans un cookie,
                                                 * nous rétablissons explicitement la protection CSRF
                                                 * pour toutes les méthodes non sûres, sauf le login.
                                                 */
                                                .withObjectPostProcessor(
                                                                new ObjectPostProcessor<CsrfFilter>() {

                                                                        @Override
                                                                        public <O extends CsrfFilter> O postProcess(
                                                                                        O csrfFilter) {
                                                                                csrfFilter.setRequireCsrfProtectionMatcher(
                                                                                                request -> {
                                                                                                        boolean requiresCsrf = CsrfFilter.DEFAULT_CSRF_MATCHER
                                                                                                                        .matches(request);

                                                                                                        boolean isLoginRequest = "POST"
                                                                                                                        .equalsIgnoreCase(
                                                                                                                                        request.getMethod())
                                                                                                                        && "/api/auth/login"
                                                                                                                                        .equals(
                                                                                                                                                        request.getServletPath());

                                                                                                        return requiresCsrf
                                                                                                                        && !isLoginRequest;
                                                                                                });

                                                                                return csrfFilter;
                                                                        }
                                                                }))

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.STATELESS))

                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())
                                .logout(logout -> logout.disable())

                                .authorizeHttpRequests(authorize -> authorize
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/auth/login")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/auth/csrf")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/auth/logout")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/auth/me")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.PATCH,
                                                                "/api/auth/password")
                                                .authenticated()

                                                .requestMatchers(
                                                                "/actuator/health",
                                                                "/actuator/health/**",
                                                                "/actuator/info")
                                                .permitAll()

                                                .anyRequest()
                                                .denyAll())

                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .bearerTokenResolver(
                                                                bearerTokenResolver)
                                                .jwt(jwt -> jwt
                                                                .decoder(jwtDecoder))
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint))

                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint)
                                                .accessDeniedHandler(
                                                                accessDeniedHandler))

                                .headers(Customizer.withDefaults());

                return http.build();
        }
}
