// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export const FormatStyle = Object.freeze({
  // Example: Samstag, 28. Juni 2025
  FULL: "full",
  // Example: 28. Juni 2025
  LONG: "long",
  // Examples: 28.06.2025 or 12:02:38
  MEDIUM: "medium",
  // Examples: 28.06.25 or 12:02
  SHORT: "short",
});

export type FormatStyle = (typeof FormatStyle)[keyof typeof FormatStyle];

export function formatDateTime(
  dateTime: Temporal.PlainDateTimeLike,
  {
    dateFormat = FormatStyle.MEDIUM,
    timeFormat = FormatStyle.MEDIUM,
  }: { dateFormat?: FormatStyle; timeFormat?: FormatStyle } = {},
): string {
  return Temporal.PlainDateTime.from(dateTime).toLocaleString(undefined, {
    dateStyle: dateFormat,
    timeStyle: timeFormat,
    hour12: false,
  });
}

export function formatDate(
  date: Temporal.PlainDateLike,
  { format = FormatStyle.MEDIUM }: { format?: FormatStyle } = {},
): string {
  return Temporal.PlainDate.from(date).toLocaleString(undefined, {
    dateStyle: format,
  });
}

export function formatTime(
  time: Temporal.PlainTimeLike,
  { format = FormatStyle.MEDIUM }: { format?: FormatStyle } = {},
): string {
  return Temporal.PlainTime.from(time).toLocaleString(undefined, {
    timeStyle: format,
    hour12: false,
  });
}

export function formatDuration(
  duration: Temporal.DurationLike,
  { format = FormatStyle.MEDIUM }: { format?: FormatStyle } = {},
): string {
  const s = Temporal.Duration.from(duration).toLocaleString(undefined, {
    style: "digital",
    hours: "2-digit",
    minutes: "2-digit",
    seconds: "2-digit",
  });
  if (format === FormatStyle.MEDIUM) {
    return s.slice(0, -3);
  }
  return s;
}
