// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

const MILLIS_PER_HOUR = 3600000;
const MILLIS_PER_MINUTE = 60000;
const MILLIS_PER_SECOND = 1000;

export class Duration {
  static ZERO = new Duration();

  static parse(duration: string): Duration {
    const regex =
      /^([-+])?PT(?:([-+]?\d+)H)?(?:([-+]?\d+)M)?(?:([-+]?\d+)(\.(\d+))?S)?$/;
    const matches = duration.match(regex);
    if (!matches) {
      throw new RangeError(`Invalid duration format: ${duration}.`);
    }

    const sign = matches[1] === "-" ? -1 : 1;
    const hours = parseInt(matches[2] || "0", 10);
    const minutes = parseInt(matches[3] || "0", 10);
    const seconds = parseInt(matches[4] || "0", 10);
    const secondsSign = Math.sign(seconds) < 0 ? -1 : 1;
    const milliseconds = parseInt((matches[6] || "0").padEnd(3, "0"), 10);
    return new Duration(
      sign *
        (hours * MILLIS_PER_HOUR +
          minutes * MILLIS_PER_MINUTE +
          seconds * MILLIS_PER_SECOND +
          secondsSign * milliseconds),
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
    const sign = Math.sign(this.milliseconds);
    const part = Math.abs(this.milliseconds) / MILLIS_PER_HOUR;
    return sign * Math.floor(part);
  }

  get minutes(): number {
    return this.#millis / MILLIS_PER_MINUTE;
  }

  get minutesPart(): number {
    const sign = Math.sign(this.milliseconds);
    const part =
      Math.abs(this.milliseconds) - Math.abs(this.hoursPart) * MILLIS_PER_HOUR;
    return sign * Math.floor(part / MILLIS_PER_MINUTE);
  }

  get seconds(): number {
    return this.#millis / MILLIS_PER_SECOND;
  }

  get secondsPart(): number {
    const sign = Math.sign(this.milliseconds);
    const part =
      Math.abs(this.milliseconds) -
      Math.abs(this.hoursPart) * MILLIS_PER_HOUR -
      Math.abs(this.minutesPart) * MILLIS_PER_MINUTE;
    return sign * Math.floor(part / MILLIS_PER_SECOND);
  }

  get milliseconds(): number {
    return this.#millis;
  }

  get millisecondsPart(): number {
    const sign = Math.sign(this.milliseconds);
    return (
      sign *
      (Math.abs(this.#millis) -
        Math.abs(this.hoursPart) * MILLIS_PER_HOUR -
        Math.abs(this.minutesPart) * MILLIS_PER_MINUTE -
        Math.abs(this.secondsPart) * MILLIS_PER_SECOND)
    );
  }

  abs() {
    return new Duration(Math.abs(this.#millis));
  }

  negated() {
    return new Duration(-this.#millis);
  }

  isPositive(): boolean {
    return this.#millis > 0;
  }

  isNegative(): boolean {
    return this.#millis < 0;
  }

  isZero(): boolean {
    return this.#millis === 0;
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
