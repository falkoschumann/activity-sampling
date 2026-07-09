// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { createLogActivityCommand } from "../../../../shared/domain/activity/log_activity.command";
import type { ActivityLoggedEvent } from "../../../../shared/domain/activity/activity_logged.event";
import type { TimerStartedEvent } from "../../../../shared/domain/timer/timer_started.event";
import type { TimerStoppedEvent } from "../../../../shared/domain/timer/timer_stopped.event";
import type { TimerTickedEvent } from "../../../../shared/domain/timer/timer_ticked.event";
import type { TimerElapsedEvent } from "../../../../shared/domain/timer/timer_elapsed.event";
import {
  createGetCurrentIntervalQuery,
  createGetCurrentIntervalQueryResult,
  type GetCurrentIntervalQueryResult,
} from "../../../../shared/domain/read_models/get_current_interval.query";
import {
  createGetRecentActivitiesQuery,
  createGetRecentActivitiesQueryResult,
  type GetRecentActivitiesQueryResult,
} from "../../../../shared/domain/read_models/get_recent_activities.query";
import {
  createGetSettingsQuery,
  type GetSettingsQueryResult,
} from "../../../../shared/domain/read_models/get_settings.query";
import type { RecentActivity } from "../../../../shared/domain/value_objects/recent_activity.value_object";
import ScrollToTopButtonComponent from "../../components/scroll_to_top_button.component";
import CountdownComponent from "./countdown.component";
import TimeSummaryComponent from "./time_summary.component";
import WorkingDaysComponent from "./working_days.component";
import ActivityFormComponent from "./activity_form.component";

export default function LogPage() {
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  // TODO form is disabled when timer is running and current interval is logged
  const isFormDisabled = false;

  const [currentIntervalQuery, setCurrentIntervalQuery] = useState(createGetCurrentIntervalQuery());
  const [currentInterval, setCurrentInterval] = useState(createGetCurrentIntervalQueryResult());

  const [recentActivitiesQuery, setRecentActivitiesQuery] = useState(createGetRecentActivitiesQuery());
  const [recentActivities, setRecentActivities] = useState(createGetRecentActivitiesQueryResult());

  useEffect(() => {
    const getSettingsAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetSettingsQueryResult>(createGetSettingsQuery());
      setCategories(result.categories);
    };

    void getSettingsAsync();
  }, []);

  const logActivity = () => {
    void window.activitySampling.routeMessage(
      createLogActivityCommand({
        timestamp: Temporal.Now.instant().toString(),
        duration: currentInterval.interval,
        client,
        project,
        task,
        notes,
        category,
      }),
    );
  };

  useEffect(() => {
    return window.activitySampling.subscribeEvents(
      (event: ActivityLoggedEvent | TimerStartedEvent | TimerStoppedEvent | TimerTickedEvent | TimerElapsedEvent) => {
        switch (event.type) {
          case "activity-logged":
            setRecentActivitiesQuery(createGetRecentActivitiesQuery());
            break;
          case "timer-started":
          case "timer-stopped":
          case "timer-ticked":
          case "timer-elapsed":
            setCurrentIntervalQuery(createGetCurrentIntervalQuery());
            break;
        }
      },
    );
  }, []);

  useEffect(() => {
    const getCurrentIntervalAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetCurrentIntervalQueryResult>(currentIntervalQuery);
      setCurrentInterval(result);
    };

    void getCurrentIntervalAsync();
  }, [currentIntervalQuery]);

  const selectActivity = (activity: RecentActivity) => {
    setClient(activity.client);
    setProject(activity.project);
    setTask(activity.task);
    setNotes(activity.notes ?? "");
    setCategory(activity.category ?? "");
  };

  useEffect(() => {
    const getRecentActivitiesAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetRecentActivitiesQueryResult>(recentActivitiesQuery);
      setRecentActivities(result);

      const activity = result.workingDays?.[0]?.activities?.[0];
      if (activity != null) {
        selectActivity(activity);
      }
    };

    void getRecentActivitiesAsync();
  }, [recentActivitiesQuery]);

  // TODO add notification handling

  return (
    <>
      <ScrollToTopButtonComponent />
      <aside className="container my-4">
        <ActivityFormComponent
          client={client}
          project={project}
          task={task}
          notes={notes}
          category={category}
          categories={categories}
          isDisabled={isFormDisabled}
          onClientChange={setClient}
          onProjectChange={setProject}
          onTaskChange={setTask}
          onNotesChange={setNotes}
          onCategoryChange={setCategory}
          onSubmit={logActivity}
        />
        <CountdownComponent {...currentInterval} />
      </aside>
      <main className="container mt-4" style={{ paddingBottom: 80 }}>
        <h5>
          Logged activities of the last 30 days
          <button
            className="btn"
            title="Refresh logged activities."
            onClick={() => setRecentActivitiesQuery(createGetRecentActivitiesQuery())}
          >
            <span className="visually-hidden">Refresh logged activities.</span>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        <WorkingDaysComponent
          workingDays={recentActivities.workingDays}
          onSelectActivity={(activity) => selectActivity(activity)}
        />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container">
          <TimeSummaryComponent {...recentActivities.timeSummary} />
        </div>
      </footer>
    </>
  );
}
