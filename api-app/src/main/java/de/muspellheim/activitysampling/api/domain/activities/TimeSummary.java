// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.Duration;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record TimeSummary(
    Duration hoursToday, Duration hoursYesterday, Duration hoursThisWeek, Duration hoursThisMonth) {

  public static final TimeSummary NULL =
      new TimeSummary(Duration.ZERO, Duration.ZERO, Duration.ZERO, Duration.ZERO);
}
