// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Objects;
import java.util.Set;

public class Calendar {

  private final Set<DayOfWeek> businessDays =
      Set.of(
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY);
  private Set<LocalDate> holidays = Set.of();

  public void initHolidays(Set<LocalDate> holidays) {
    this.holidays = Objects.requireNonNull(holidays, "Holidays must not be null.");
  }

  public boolean isBusinessDay(LocalDate date) {
    return businessDays.contains(date.getDayOfWeek());
  }

  public boolean isHoliday(LocalDate date) {
    return holidays.contains(date);
  }

  public boolean isNotHoliday(LocalDate date) {
    return !isHoliday(date);
  }

  public long countBusinessDays(LocalDate startInclusive, LocalDate endExclusive) {
    return startInclusive
        .datesUntil(endExclusive)
        .filter(this::isBusinessDay)
        .filter(this::isNotHoliday)
        .count();
  }
}
