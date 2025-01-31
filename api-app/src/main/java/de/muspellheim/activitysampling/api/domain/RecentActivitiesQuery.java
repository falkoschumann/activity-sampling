/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.LocalDate;

public record RecentActivitiesQuery(LocalDate today) {

  public static RecentActivitiesQuery createTestInstance() {
    return new RecentActivitiesQuery(LocalDate.of(2025, 1, 17));
  }

  public RecentActivitiesQuery() {
    this(LocalDate.now());
  }
}
