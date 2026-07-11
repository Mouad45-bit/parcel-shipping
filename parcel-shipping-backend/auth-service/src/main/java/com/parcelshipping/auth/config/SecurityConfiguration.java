package com.parcelshipping.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {

    private static final int BCRYPT_STRENGTH = 12;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(BCRYPT_STRENGTH);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {
        http
                /*
                 * Le login ne peut pas encore fournir de jeton CSRF.
                 * Les futures routes sensibles conserveront une
                 * protection adaptée aux cookies d'authentification.
                 */
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/api/auth/login")
                )

                /*
                 * Aucun état d'authentification n'est conservé
                 * dans une session HTTP côté serveur.
                 */
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                /*
                 * Désactive les mécanismes d'authentification web
                 * fournis par défaut par Spring Security.
                 */
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
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info"
                        )
                        .permitAll()

                        /*
                         * Les autres routes seront ouvertes
                         * progressivement dans les étapes suivantes.
                         */
                        .anyRequest()
                        .denyAll()
                )

                .headers(Customizer.withDefaults());

        return http.build();
    }
}
