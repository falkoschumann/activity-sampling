// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.ZoneId;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record RecentActivitiesQuery(ZoneId timeZone) {

  public static final RecentActivitiesQuery DEFAULT = new RecentActivitiesQuery(null);

  public static RecentActivitiesQuery createTestInstance() {
    return RecentActivitiesQuery.builder().timeZone(ZoneId.of("Europe/Berlin")).build();
  }
}
