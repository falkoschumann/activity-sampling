// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import jakarta.validation.constraints.NotNull;
import java.nio.file.Path;
import lombok.Builder;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Builder
@ConfigurationProperties(prefix = "app.csv-holiday-repository")
public record CsvHolidayRepositoryConfiguration(@NotNull Path file) {}
