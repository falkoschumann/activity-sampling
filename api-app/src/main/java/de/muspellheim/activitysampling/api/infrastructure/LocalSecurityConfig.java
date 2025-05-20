// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Profile({"local", "test"})
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class LocalSecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(
            auth -> auth.requestMatchers("/api/**").hasRole("USER").anyRequest().permitAll())
        .httpBasic(withDefaults())
        .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"));
    return http.build();
  }

  @Bean
  RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy(
        """
        ROLE_ADMIN > ROLE_STAFF
        ROLE_STAFF > ROLE_USER
        """);
  }
}
