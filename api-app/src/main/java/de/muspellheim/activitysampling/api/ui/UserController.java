// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.domain.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

  @GetMapping()
  public User user(Authentication authentication) {
    // Azure: OidcUser, Basic: User
    // var principal = authentication.getPrincipal();

    var roles =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            // Remove Spring role prefix
            .map(role -> role.replaceAll("^ROLE_", ""))
            // Remove Azure role prefix
            .map(role -> role.replaceAll("^APPROLE_", ""))
            .toList();

    return new User(authentication.getName(), roles);
  }
}
