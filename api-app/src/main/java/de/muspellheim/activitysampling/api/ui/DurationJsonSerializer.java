// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;
import java.time.Duration;
import org.springframework.boot.jackson.JsonComponent;

@JsonComponent
public class DurationJsonSerializer extends JsonSerializer<Duration> {

  @Override
  public void serialize(Duration value, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    var s = value.toString();
    if (s.contains("-")) {
      s = "-" + s.replaceAll("-", "");
    }
    gen.writeString(s);
  }
}
