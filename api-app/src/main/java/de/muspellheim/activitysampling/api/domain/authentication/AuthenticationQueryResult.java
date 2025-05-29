// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.authentication;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Builder;
import org.springframework.lang.Nullable;

@Builder
@JsonInclude(Include.NON_NULL)
public record AuthenticationQueryResult(boolean isAuthenticated, @Nullable AccountInfo account) {

  public static final AuthenticationQueryResult UNAUTHORIZED =
      new AuthenticationQueryResult(false, null);

  public static AuthenticationQueryResult of(AccountInfo account) {
    return new AuthenticationQueryResult(true, account);
  }
}
