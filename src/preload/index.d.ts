// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type Unsubscriber = () => void;

export interface ActivitySampling {
  logActivity(command: string): Promise<string>;

  exportTimesheet(command: string): Promise<string>;

  queryRecentActivities(query: string): Promise<string>;

  queryReport(query: string): Promise<string>;

  queryStatistics(query: string): Promise<string>;

  queryTimesheet(query: string): Promise<string>;

  queryEstimate(query: string): Promise<string>;

  queryBurnUp(query: string): Promise<string>;

  onTimerStartedEvent: (callback: (event: string) => void) => Unsubscriber;

  onTimerStoppedEvent: (callback: (event: string) => void) => Unsubscriber;

  onIntervalElapsedEvent: (callback: (event: string) => void) => Unsubscriber;

  loadSettings(): Promise<string>;

  storeSettings(settings: string): Promise<void>;

  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
}

declare global {
  interface Window {
    activitySampling: ActivitySampling;
  }
}
