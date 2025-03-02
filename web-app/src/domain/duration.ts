// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

const MILLIS_PER_HOUR = 3600000;
const MILLIS_PER_MINUTE = 60000;
const MILLIS_PER_SECOND = 1000;

export class Duration {
  static ZERO = new Duration();

  static parse(duration: string): Duration {
    const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(\.(\d+))?S)?$/;
    const matches = duration.match(regex);
    if (!matches) {
      throw new RangeError(`Invalid duration format: ${duration}.`);
    }

    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);
    const milliseconds = parseInt((matches[5] || "0").padEnd(3, "0"), 10);
    return new Duration(
      hours * MILLIS_PER_HOUR +
        minutes * MILLIS_PER_MINUTE +
        seconds * MILLIS_PER_SECOND +
        milliseconds,
    );
  }

  static ofHours(hours: number): Duration {
    return new Duration(hours * MILLIS_PER_HOUR);
  }

  static ofMinutes(minutes: number): Duration {
    return new Duration(minutes * MILLIS_PER_MINUTE);
  }

  static ofSeconds(seconds: number): Duration {
    return new Duration(seconds * MILLIS_PER_SECOND);
  }

  static ofMilliseconds(milliseconds: number): Duration {
    return new Duration(milliseconds);
  }

  readonly #millis: number;

  private constructor(milliseconds = 0) {
    this.#millis = milliseconds;
  }

  get hours(): number {
    return this.#millis / MILLIS_PER_HOUR;
  }

  get hoursPart(): number {
    const part = this.milliseconds / MILLIS_PER_HOUR;
    return Math.floor(part);
  }

  get minutes(): number {
    return this.#millis / MILLIS_PER_MINUTE;
  }

  get minutesPart(): number {
    const part = this.milliseconds - this.hoursPart * MILLIS_PER_HOUR;
    return Math.floor(part / MILLIS_PER_MINUTE);
  }

  get seconds(): number {
    return this.#millis / MILLIS_PER_SECOND;
  }

  get secondsPart(): number {
    const part =
      this.milliseconds -
      this.hoursPart * MILLIS_PER_HOUR -
      this.minutesPart * MILLIS_PER_MINUTE;
    return Math.floor(part / MILLIS_PER_SECOND);
  }

  get milliseconds(): number {
    return this.#millis;
  }

  get millisecondsPart(): number {
    return (
      this.#millis -
      this.hoursPart * MILLIS_PER_HOUR -
      this.minutesPart * MILLIS_PER_MINUTE -
      this.secondsPart * MILLIS_PER_SECOND
    );
  }

  minus(duration: Duration): Duration {
    return new Duration(this.#millis - duration.#millis);
  }

  minusHours(hours: number): Duration {
    return new Duration(this.#millis - hours * MILLIS_PER_HOUR);
  }

  minusMinutes(minutes: number): Duration {
    return new Duration(this.#millis - minutes * MILLIS_PER_MINUTE);
  }

  minusSeconds(seconds: number): Duration {
    return new Duration(this.#millis - seconds * MILLIS_PER_SECOND);
  }

  minusMilliseconds(milliseconds: number): Duration {
    return new Duration(this.#millis - milliseconds);
  }

  toString(): string {
    let result = "PT";
    if (this.hoursPart > 0) {
      result += `${this.hoursPart}H`;
    }
    if (this.minutesPart > 0) {
      result += `${this.minutesPart}M`;
    }
    if (this.secondsPart > 0 || this.millisecondsPart > 0) {
      result += `${this.secondsPart}`;
      if (this.millisecondsPart > 0)
        result += `.${String(this.millisecondsPart).padStart(3, "0")}`;
      result += "S";
    }
    if (this.milliseconds === 0) {
      result += "0S";
    }
    return result;
  }

  toLocaleString({
    style = "short",
  }: {
    style?: "short" | "medium" | "long";
  } = {}): string {
    let result = "";
    result += `${String(this.hoursPart).padStart(2, "0")}:`;
    result += `${String(this.minutesPart).padStart(2, "0")}`;
    if (style === "medium" || style === "long") {
      result += `:${String(this.secondsPart).padStart(2, "0")}`;
    }
    if (style === "long") {
      result += `.${String(this.millisecondsPart).padStart(3, "0")}`;
    }
    return result;
  }

  toJSON(): string {
    return this.toString();
  }

  valueOf(): number {
    return this.#millis;
  }
}
