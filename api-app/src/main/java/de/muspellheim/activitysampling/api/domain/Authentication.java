package de.muspellheim.activitysampling.api.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Builder;
import org.springframework.lang.Nullable;

@Builder
@JsonInclude(Include.NON_NULL)
public record Authentication(boolean isAuthenticated, @Nullable User user) {

  public static final Authentication UNAUTHORIZED = new Authentication(false, null);

  public static Authentication of(User user) {
    return new Authentication(true, user);
  }
}
