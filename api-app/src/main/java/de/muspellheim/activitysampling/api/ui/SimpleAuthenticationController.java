// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.domain.AccountInfo;
import de.muspellheim.activitysampling.api.domain.AuthenticationQueryResult;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile({"local", "test"})
@RestController
@RequestMapping("/api/authentication")
public class SimpleAuthenticationController {

  @GetMapping()
  public AuthenticationQueryResult authentication(Authentication authentication) {
    if (authentication == null) {
      return AuthenticationQueryResult.UNAUTHORIZED;
    }

    var account = AccountInfo.builder().username(authentication.getName());
    var roles =
        authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(role -> role.replaceAll("^ROLE_", ""))
            .toList();
    account.roles(roles);
    return AuthenticationQueryResult.of(account.build());
  }
}
