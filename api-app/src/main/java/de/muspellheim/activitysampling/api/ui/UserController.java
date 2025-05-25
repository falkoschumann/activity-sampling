// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.domain.Authentication;
import de.muspellheim.activitysampling.api.domain.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/authentication")
public class UserController {

  @GetMapping()
  public Authentication authentication(
      org.springframework.security.core.Authentication authentication) {
    if (authentication == null) {
      return Authentication.UNAUTHORIZED;
    }

    var user = User.builder().name(authentication.getName());

    // Azure: OidcUser, Basic: User
    var principal = authentication.getPrincipal();
    if (principal instanceof OidcUser oidcUser) {
      user.username(oidcUser.getPreferredUsername());
    }

    var roles =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            // Remove Spring role prefix
            .map(role -> role.replaceAll("^ROLE_", ""))
            // Remove Azure role prefix
            .map(role -> role.replaceAll("^APPROLE_", ""))
            .toList();
    user.roles(roles);

    return Authentication.of(user.build());
  }
}
