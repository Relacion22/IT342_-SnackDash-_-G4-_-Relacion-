package SnackDash.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Added import
import org.springframework.security.config.Customizer; // Added import
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Enable CORS at the security level
            .cors(Customizer.withDefaults())
            // Disable CSRF for stateless API
            .csrf(csrf -> csrf.disable())
            // Use stateless session policy (JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Authorize requests
            .authorizeHttpRequests(authz -> authz
                // 2. Explicitly allow preflight OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                
                // 3. Changed from hasRole to hasAuthority
                .requestMatchers("/api/stall/**", "/api/menu/**", "/api/orders/owner").hasAuthority("OWNER")
                .requestMatchers("/api/orders/my").hasAuthority("STUDENT")
                
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            // Add JWT filter before username/password filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            // Disable form login since we're using JWT
            .formLogin(form -> form.disable())
            // Disable HTTP basic auth since we're using JWT
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}