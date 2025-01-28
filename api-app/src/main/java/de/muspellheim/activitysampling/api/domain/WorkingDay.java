/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.LocalDate;
import java.util.List;

public record WorkingDay(LocalDate date, List<Activity> activities) {}
