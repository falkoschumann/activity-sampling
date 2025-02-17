// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Duration } from "../../src/domain/duration";

describe("Duration", () => {
  it("Creates zero duration", () => {
    const duration = Duration.ZERO;

    expect(duration.milliseconds).toBe(0);
  });

  it("Creates duration of milliseconds", () => {
    const duration = Duration.parse("PT4H3M2.001S");

    expect(duration.hours).toBeCloseTo(4.05);
    expect(duration.minutes).toBeCloseTo(243.03);
    expect(duration.seconds).toBeCloseTo(14582);
    expect(duration.milliseconds).toBe(14582001);
  });

  it("Creates duration of hours", () => {
    const duration = Duration.ofHours(8);

    expect(duration.milliseconds).toBe(8 * 3600000);
  });

  it("Creates duration of minutes", () => {
    const duration = Duration.ofMinutes(30);

    expect(duration.milliseconds).toBe(30 * 60000);
  });

  it("Creates duration of seconds", () => {
    const duration = Duration.ofSeconds(20);

    expect(duration.milliseconds).toBe(20 * 1000);
  });

  describe("Parse", () => {
    it("Parses hours", () => {
      const duration = Duration.parse("PT1H");

      expect(duration.hoursPart).toBe(1);
      expect(duration.minutesPart).toBe(0);
      expect(duration.secondsPart).toBe(0);
      expect(duration.millisecondsPart).toBe(0);
    });

    it("Parses minutes", () => {
      const duration = Duration.parse("PT1M");

      expect(duration.hoursPart).toBe(0);
      expect(duration.minutesPart).toBe(1);
      expect(duration.secondsPart).toBe(0);
      expect(duration.millisecondsPart).toBe(0);
    });

    it("Parses seconds", () => {
      const duration = Duration.parse("PT1S");

      expect(duration.hoursPart).toBe(0);
      expect(duration.minutesPart).toBe(0);
      expect(duration.secondsPart).toBe(1);
      expect(duration.millisecondsPart).toBe(0);
    });

    it("Parses milliseconds", () => {
      const duration = Duration.parse("PT0.001S");

      expect(duration.hoursPart).toBe(0);
      expect(duration.minutesPart).toBe(0);
      expect(duration.secondsPart).toBe(0);
      expect(duration.millisecondsPart).toBe(1);
    });

    it("Parses all components", () => {
      const duration = Duration.parse("PT4H3M2.001S");

      expect(duration.hoursPart).toBe(4);
      expect(duration.minutesPart).toBe(3);
      expect(duration.secondsPart).toBe(2);
      expect(duration.millisecondsPart).toBe(1);
    });

    it("Fails to parse invalid duration", () => {
      expect(() => Duration.parse("PT5X")).toThrowError(
        "Invalid duration format: PT5X.",
      );
    });
  });

  describe("To string", () => {
    it("Formats hours", () => {
      const duration = Duration.ofHours(1);

      expect(duration.toString()).toBe("PT1H");
    });

    it("Formats minutes", () => {
      const duration = Duration.ofMinutes(1);

      expect(duration.toString()).toBe("PT1M");
    });

    it("Formats seconds", () => {
      const duration = Duration.ofSeconds(1);

      expect(duration.toString()).toBe("PT1S");
    });

    it("Formats milliseconds", () => {
      const duration = Duration.ofMilliseconds(1);

      expect(duration.toString()).toBe("PT0.001S");
    });

    it("Formats all components", () => {
      const duration = Duration.parse("PT4H3M2.001S");

      expect(duration.toString()).toBe("PT4H3M2.001S");
    });
  });

  describe("To locale string", () => {
    it("Formats hours", () => {
      const duration = Duration.ofHours(1);

      expect(duration.toLocaleString()).toBe("01:00");
    });

    it("Formats minutes", () => {
      const duration = Duration.ofMinutes(1);

      expect(duration.toLocaleString()).toBe("00:01");
    });

    it("Formats seconds", () => {
      const duration = Duration.ofSeconds(1);

      expect(duration.toLocaleString({ style: "medium" })).toBe("00:00:01");
    });

    it("Formats milliseconds", () => {
      const duration = Duration.ofMilliseconds(1);

      expect(duration.toLocaleString({ style: "long" })).toBe("00:00:00.001");
    });

    it("Formats with long style", () => {
      const duration = Duration.parse("PT12H34M56.789S");

      expect(duration.toLocaleString({ style: "long" })).toBe("12:34:56.789");
    });

    it("Formats with medium style", () => {
      const duration = Duration.parse("PT12H34M56.789S");

      expect(duration.toLocaleString({ style: "medium" })).toBe("12:34:56");
    });

    it("Formats with short style", () => {
      const duration = Duration.parse("PT12H34M56.789S");

      expect(duration.toLocaleString({ style: "short" })).toBe("12:34");
    });
  });

  it("Serializes to JSON", () => {
    const duration = Duration.ofMilliseconds(5);

    const json = JSON.stringify(duration);

    expect(json).toBe('"PT0.005S"');
  });

  it("Gets primitive value", () => {
    const duration = Duration.ofMilliseconds(5);

    expect(duration.valueOf()).toBe(5);
  });
});
