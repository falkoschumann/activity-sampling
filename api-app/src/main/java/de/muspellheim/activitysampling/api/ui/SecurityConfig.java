// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import static org.springframework.security.config.Customizer.withDefaults;

import com.azure.spring.cloud.autoconfigure.implementation.aad.security.AadWebApplicationHttpSecurityConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.with(AadWebApplicationHttpSecurityConfigurer.aadWebApplication(), withDefaults())
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/token_details").authenticated().anyRequest().permitAll());
    return http.build();
  }

  @Bean
  @RequestScope
  public ServletUriComponentsBuilder urlBuilder() {
    return ServletUriComponentsBuilder.fromCurrentRequest();
  }
}
