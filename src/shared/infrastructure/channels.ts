// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

// Commands

export const START_TIMER_CHANNEL = "startTimer";
export const STOP_TIMER_CHANNEL = "stopTimer";
export const LOG_ACTIVITY_CHANNEL = "logActivity";
export const EXPORT_TIMESHEET_CHANNEL = "exportTimesheet";

// Queries
export const QUERY_CURRENT_INTERVAL_CHANNEL = "queryCurrentInterval";
export const QUERY_RECENT_ACTIVITIES_CHANNEL = "queryRecentActivities";
export const QUERY_REPORT_CHANNEL = "queryReport";
export const QUERY_STATISTICS_CHANNEL = "queryStatistics";
export const QUERY_ESTIMATE_CHANNEL = "queryEstimate";
export const QUERY_BURN_UP_CHANNEL = "queryBurnUp";
export const QUERY_TIMESHEET_CHANNEL = "queryTimesheet";

// Events
export const TIMER_STARTED_CHANNEL = "timerStarted";
export const TIMER_STOPPED_CHANNEL = "timerStopped";
export const INTERVAL_ELAPSED_CHANNEL = "intervalElapsed";
export const ACTIVITY_LOGGED_CHANNEL = "activityLogged";

// Settings
export const LOAD_SETTINGS_CHANNEL = "loadSettings";
export const STORE_SETTINGS_CHANNEL = "storeSettings";
export const SHOW_OPEN_DIALOG_CHANNEL = "showOpenDialog";
