// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import static org.hibernate.type.SqlTypes.INTERVAL_SECOND;

import de.muspellheim.activitysampling.api.domain.Activity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serial;
import java.io.Serializable;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.With;
import org.hibernate.annotations.JdbcTypeCode;

@Data
@Builder
@With
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@Entity(name = "Activity")
@Table(name = "activities")
public class ActivityDto implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  public static ActivityDto createTestInstance() {
    return new ActivityDtoBuilder()
        .start(Instant.parse("2024-12-18T08:30:00Z"))
        .duration(Duration.ofMinutes(30))
        .client("ACME Inc.")
        .project("Foobar")
        .task("Do something")
        .notes("")
        .build();
  }

  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Id
  private Long id;

  @NonNull private Instant start;

  @NonNull
  @JdbcTypeCode(INTERVAL_SECOND)
  private Duration duration;

  @NonNull private String client;

  @NonNull private String project;

  @NonNull private String task;

  private String notes;

  public Activity validate(ZoneId timeZone) {
    return new Activity(
        start.atZone(timeZone).toLocalDateTime(),
        duration,
        client,
        project,
        task,
        notes != null ? notes : "");
  }
}
