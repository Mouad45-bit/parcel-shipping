package com.parcelshipping.auth.config;

import com.parcelshipping.auth.security.CookieBearerTokenResolver;
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

@Configuration
public class SecurityConfiguration {

    private static final int BCRYPT_STRENGTH = 12;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(
                BCRYPT_STRENGTH
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtDecoder jwtDecoder,
            CookieBearerTokenResolver bearerTokenResolver,
            RestAuthenticationEntryPoint authenticationEntryPoint
    ) throws Exception {
        http
                /*
                 * Le login reste public et ne possède pas encore
                 * de token CSRF.
                 */
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(
                                "/api/auth/login"
                        )
                )

                /*
                 * L'authentification repose uniquement sur le JWT.
                 * Aucune session HTTP serveur n'est créée.
                 */
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())

                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/auth/me"
                        )
                        .authenticated()

                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info"
                        )
                        .permitAll()

                        .anyRequest()
                        .denyAll()
                )

                /*
                 * Valide le JWT extrait du cookie et construit
                 * l'Authentication placée dans le SecurityContext.
                 */
                .oauth2ResourceServer(oauth2 -> oauth2
                        .bearerTokenResolver(
                                bearerTokenResolver
                        )
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder)
                        )
                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                )

                .headers(Customizer.withDefaults());

        return http.build();
    }
}
