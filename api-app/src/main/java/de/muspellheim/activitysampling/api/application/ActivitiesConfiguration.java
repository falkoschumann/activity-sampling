// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.activities")
public record ActivitiesConfiguration(@NotNull Duration capacity) {

  public static final ActivitiesConfiguration DEFAULT =
      new ActivitiesConfiguration(Duration.ofHours(40));
}
