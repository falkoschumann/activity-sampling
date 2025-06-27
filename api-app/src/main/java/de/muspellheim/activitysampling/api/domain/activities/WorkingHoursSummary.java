// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.Duration;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record WorkingHoursSummary(Duration totalHours, Duration capacity, Duration offset) {

  public static final WorkingHoursSummary EMPTY =
      WorkingHoursSummary.builder()
          .totalHours(Duration.ZERO)
          .capacity(Duration.ofHours(40))
          .offset(Duration.ZERO)
          .build();

  public static WorkingHoursSummary createTestInstance() {
    return WorkingHoursSummary.builder()
        .totalHours(Duration.ofHours(4))
        .capacity(Duration.ofHours(40))
        .offset(Duration.ofHours(-20))
        .build();
  }
}
