// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record Holiday(LocalDate date, String title) {}
