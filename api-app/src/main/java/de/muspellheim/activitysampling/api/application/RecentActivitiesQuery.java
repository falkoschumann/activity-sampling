/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record RecentActivitiesQuery(LocalDate today, ZoneId timeZone) {

  public static final RecentActivitiesQuery NULL = new RecentActivitiesQuery(null, null);

  public static RecentActivitiesQuery createTestInstance() {
    return new RecentActivitiesQueryBuilder()
        .today(LocalDate.of(2024, 12, 18))
        .timeZone(ZoneId.of("Europe/Berlin"))
        .build();
  }
}
