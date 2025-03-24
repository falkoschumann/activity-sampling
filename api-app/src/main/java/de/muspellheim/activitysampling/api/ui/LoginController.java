// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

  @GetMapping(value = {"/", "sign_in_status", "/index"})
  public String status(Model model) {
    return hydrateUi(model, "status");
  }

  @GetMapping(path = "/token_details")
  public String tokenDetails(Model model, @AuthenticationPrincipal OidcUser principal) {
    model.addAttribute("claims", filterClaims(principal));
    return hydrateUi(model, "token");
  }

  private String hydrateUi(Model model, String fragment) {
    model.addAttribute("bodyContent", String.format("content/%s.html", fragment));
    return "base";
  }

  private static Map<String, String> filterClaims(OidcUser principal) {
    var includeClaims =
        List.of("sub", "aud", "ver", "iss", "name", "oid", "preferred_username", "roles");
    var filteredClaims = new HashMap<String, String>();
    includeClaims.forEach(
        claim -> {
          if (principal.getIdToken().getClaims().containsKey(claim)) {
            filteredClaims.put(claim, principal.getIdToken().getClaims().get(claim).toString());
          }
        });
    return filteredClaims;
  }
}
