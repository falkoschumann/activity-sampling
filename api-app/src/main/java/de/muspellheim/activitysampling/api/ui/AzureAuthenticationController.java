// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.domain.AccountInfo;
import de.muspellheim.activitysampling.api.domain.AuthenticationQueryResult;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("azure")
@RestController
public class AzureAuthenticationController {

  @GetMapping("/api/authentication")
  public AuthenticationQueryResult authentication(Authentication authentication) {
    if (authentication == null) {
      return AuthenticationQueryResult.UNAUTHORIZED;
    }

    var principal = (OidcUser) authentication.getPrincipal();
    var account =
        AccountInfo.builder().username(principal.getPreferredUsername()).name(principal.getName());
    var roles =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(role -> role.replaceAll("^APPROLE_", ""))
            .toList();
    account.roles(roles);
    return AuthenticationQueryResult.of(account.build());
  }
}
