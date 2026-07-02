// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class Clock {
  static systemUtc() {
    return Clock.system("UTC");
  }

  static systemDefaultZone() {
    return Clock.system(Temporal.Now.timeZoneId());
  }

  static system(zone: Temporal.TimeZoneLike) {
    return new Clock(() => Temporal.Now.instant(), zone);
  }

  static fixed(
    fixedInstant: Temporal.InstantLike,
    zone: Temporal.TimeZoneLike,
  ) {
    return new Clock(() => Temporal.Instant.from(fixedInstant), zone);
  }

  static offset(
    baseClock: Clock,
    offsetDuration: Temporal.DurationLike,
  ): Clock {
    return new OffsetClock(baseClock, Temporal.Duration.from(offsetDuration));
  }

  readonly #instantFactory: () => Temporal.Instant;
  readonly #zone: Temporal.TimeZoneLike;

  protected constructor(
    instantFactory: () => Temporal.Instant,
    zone: Temporal.TimeZoneLike,
  ) {
    this.#instantFactory = instantFactory;
    this.#zone = zone;
  }

  get zone(): Temporal.TimeZoneLike {
    return this.#zone;
  }

  instant(): Temporal.Instant {
    return this.#instantFactory();
  }

  millis(): number {
    return this.instant().epochMilliseconds;
  }
}

class OffsetClock extends Clock {
  constructor(baseClock: Clock, offsetDuration: Temporal.Duration) {
    super(() => baseClock.instant().add(offsetDuration), baseClock.zone);
  }
}
