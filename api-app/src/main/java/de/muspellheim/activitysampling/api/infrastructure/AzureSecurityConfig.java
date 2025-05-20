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
                auth.requestMatchers("/api/**")
                    .hasAuthority("APPROLE_user")
                    .anyRequest()
                    .permitAll());
    return http.build();
  }

  @Bean
  RoleHierarchy azureRoleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy(
        """
      APPROLE_admin > APPROLE_staff
      APPROLE_staff > APPROLE_user
      """);
  }
}
