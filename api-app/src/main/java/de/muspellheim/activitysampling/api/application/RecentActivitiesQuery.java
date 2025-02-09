/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.Builder;

@Builder
@JsonInclude(Include.NON_NULL)
public record RecentActivitiesQuery(LocalDate today, ZoneId timeZone) {

  public static final RecentActivitiesQuery NULL = new RecentActivitiesQuery(null, null);

  public static class RecentActivitiesQueryBuilder {
    private LocalDate today = LocalDate.of(2024, 12, 18);
    private ZoneId timeZone = ZoneId.of("Europe/Berlin");
  }
}
