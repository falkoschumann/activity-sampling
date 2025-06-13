// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.common;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

public class Calendar {

  private static final Set<DayOfWeek> BUSINESS_DAYS =
      Set.of(
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY);

  public boolean isBusinessDay(LocalDate date) {
    return BUSINESS_DAYS.contains(date.getDayOfWeek());
  }

  public long countBusinessDays(LocalDate startInclusive, LocalDate endExclusive) {
    return startInclusive.datesUntil(endExclusive).filter(this::isBusinessDay).count();
  }
}
