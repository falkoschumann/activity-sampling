// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import com.azure.spring.cloud.autoconfigure.implementation.aad.security.AadWebApplicationHttpSecurityConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Profile("azure")
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class AzureSecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.with(
            AadWebApplicationHttpSecurityConfigurer.aadWebApplication(), Customizer.withDefaults())
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/api/authentication")
                    .permitAll()
                    .requestMatchers("/api/**")
                    .hasAuthority("APPROLE_USER")
                    .anyRequest()
                    .permitAll())
        // Session cookies are configured with SameSite=Lax, so CSRF protection is not needed for
        // API endpoints.
        .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));
    return http.build();
  }

  @Bean
  RoleHierarchy azureRoleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy(
        """
        APPROLE_ADMIN > APPROLE_STAFF
        APPROLE_STAFF > APPROLE_USER
        """);
  }
}
