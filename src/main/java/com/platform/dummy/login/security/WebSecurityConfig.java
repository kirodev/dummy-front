package com.platform.dummy.login.security;

import com.platform.dummy.login.security.jwt.AuthEntryPointJwt;
import com.platform.dummy.login.security.jwt.AuthTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Use configurationSource directly
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exceptionHandling -> exceptionHandling.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .antMatchers("/signin", "/signup").permitAll()
                .antMatchers("/licenses", "/payments", "/multiple-payments", "/multiple-licenses").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT,
                        "/payments/{id}", "/licenses/{id}",
                        "/licenses/{id}/mappingId", "/licenses/{id}/details",
                        "/payments/{id}/details", "/multiple-licenses/{id}/details",
                        "/multiple-payments/{id}/details", "/payments/{id}/undo",
                        "/multiple-payments/{id}/undoP", "/multiple-licenses/{id}/MLmappingId",
                        "/licenses/{id}/mappingId", "/multiple-payments/{id}/MPmappingId",
                        "/payments/{id}/mappingId", "/timeline", "/annual-revenues",
                        "/multiple-licenses/{id}/undo", "/equations"
                ).hasRole("ADMIN")
                .antMatchers(HttpMethod.GET,
                        "/mappingId", "/quarterly-revenues", "/annual-revenues",
                        "/licenses", "/payments", "/multiple-payments",
                        "/multiple-licenses", "/equations"
                ).hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/mappingId").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Define the CORS configuration source
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*")); // Allow all origins
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
