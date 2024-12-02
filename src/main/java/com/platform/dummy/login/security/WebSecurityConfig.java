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
            // Enable CORS with the defined configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Disable CSRF as we're using JWT
            .csrf(csrf -> csrf.disable())
            // Handle unauthorized attempts
            .exceptionHandling(exceptionHandling -> exceptionHandling.authenticationEntryPoint(unauthorizedHandler))
            // Use stateless session; sessions won't be used to store user state
            .sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Define URL-based authorization rules
            .authorizeHttpRequests(authorize -> authorize
                // Permit all users to access signin and signup endpoints
                .antMatchers("/signin", "/signup").permitAll()
                
      
                
                // Restrict these endpoints to ADMIN role only
                .antMatchers("/payments", "/multiple-payments", "/multiple-licenses","/licenses", "/sales","/revenues","/company-types").hasAnyRole("ADMIN", "MODERATOR")
                
                // Restrict specific PUT endpoints to ADMIN role
                .antMatchers(HttpMethod.PUT,
                        "/payments/{id}", "/licenses/{id}",
                        "/licenses/{id}/mappingId", "/licenses/{id}/details",
                        "/payments/{id}/details", "/multiple-licenses/{id}/details",
                        "/multiple-payments/{id}/details", "/payments/{id}/undo",
                        "/multiple-payments/{id}/undoP", "/multiple-licenses/{id}/MLmappingId",
                        "/licenses/{id}/mappingId", "/multiple-payments/{id}/MPmappingId",
                        "/payments/{id}/mappingId", "/timeline", "/annual-revenues",
                        "/multiple-licenses/{id}/undo", "/equations"
                ).hasAnyRole("ADMIN")
                
                // Restrict specific GET endpoints to ADMIN role
                .antMatchers(HttpMethod.GET,
                        "/mappingId", "/quarterly-revenues", "/annual-revenues",
                        "/payments", "/multiple-payments",
                        "/multiple-licenses", "/equations","/sales","/revenues","/company-types"
                ).hasAnyRole("ADMIN", "MODERATOR")
                
                // Restrict DELETE endpoints to ADMIN role
                .antMatchers(HttpMethod.DELETE, "/mappingId").hasAnyRole("ADMIN")
                
                // Any other request requires authentication
                .anyRequest().authenticated()
            );

        // Add JWT token filter before the UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Define the CORS configuration source
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins
        config.setAllowedOriginPatterns(List.of("*"));
        // Allow specific HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Allow all headers
        config.setAllowedHeaders(List.of("*"));
        // Allow credentials (e.g., cookies, authorization headers)
        config.setAllowCredentials(true);
        // Register the CORS configuration for all paths
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
