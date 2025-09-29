// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export const PeriodUnit = Object.freeze({
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  YEAR: "Year",
  ALL_TIME: "All time",
});

export type PeriodUnit = (typeof PeriodUnit)[keyof typeof PeriodUnit];
