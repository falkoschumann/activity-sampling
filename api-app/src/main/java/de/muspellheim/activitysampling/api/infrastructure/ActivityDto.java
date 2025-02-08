/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.infrastructure;

import static org.hibernate.type.SqlTypes.INTERVAL_SECOND;

import de.muspellheim.activitysampling.api.domain.Activity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

@Data
@Builder
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@Entity(name = "Activity")
@Table(name = "activities")
public class ActivityDto {

  public static class ActivityDtoBuilder {
    private Instant timestamp = Instant.parse("2024-12-18T08:30:00Z");
    private Duration duration = Duration.ofMinutes(30);
    private String client = "ACME Inc.";
    private String project = "Foobar";
    private String task = "Do something";
    private String notes = "";
  }

  @Id @NonNull private Instant timestamp;

  @JdbcTypeCode(INTERVAL_SECOND)
  @NonNull
  private Duration duration;

  @NonNull private String client;

  @NonNull private String project;

  @NonNull private String task;

  private String notes;

  public Activity validate() {
    return new Activity(timestamp, duration, client, project, task, notes != null ? notes : "");
  }
}
