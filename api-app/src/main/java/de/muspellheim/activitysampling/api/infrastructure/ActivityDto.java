/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.infrastructure;

import static org.hibernate.type.SqlTypes.INTERVAL_SECOND;

import de.muspellheim.activitysampling.api.domain.Activity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

@Data
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@Entity(name = "Activity")
@Table(name = "activities")
public class ActivityDto {

  @Id @NonNull private LocalDateTime timestamp;

  @JdbcTypeCode(INTERVAL_SECOND)
  @NonNull
  private Duration duration;

  @NonNull private String client;

  @NonNull private String project;

  @NonNull private String task;

  private String notes;

  public Activity validate() {
    return new Activity(
        timestamp.atZone(ZoneId.systemDefault()).toLocalDateTime(),
        duration,
        client,
        project,
        task,
        notes != null ? notes : "");
  }
}
