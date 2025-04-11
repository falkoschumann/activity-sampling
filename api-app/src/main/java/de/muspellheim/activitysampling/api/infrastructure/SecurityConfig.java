// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import com.azure.spring.cloud.autoconfigure.implementation.aad.security.AadResourceServerHttpSecurityConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/*")
        .with(
            AadResourceServerHttpSecurityConfigurer.aadResourceServer(), Customizer.withDefaults())
        .authorizeHttpRequests(auth -> auth.anyRequest().hasAuthority("APPROLE_user"));
    return http.build();
  }

  @Bean
  RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy("APPROLE_admin > APPROLE_user");
  }
}
