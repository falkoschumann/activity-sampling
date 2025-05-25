package de.muspellheim.activitysampling.api.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Builder;
import org.springframework.lang.Nullable;

@Builder
@JsonInclude(Include.NON_NULL)
public record AuthenticationQueryResult(boolean isAuthenticated, @Nullable User user) {

  public static final AuthenticationQueryResult UNAUTHORIZED =
      new AuthenticationQueryResult(false, null);

  public static AuthenticationQueryResult of(User user) {
    return new AuthenticationQueryResult(true, user);
  }
}
