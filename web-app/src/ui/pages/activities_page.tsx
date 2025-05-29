// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  activitySelected,
  changeText,
  durationSelected,
  logActivity,
  queryRecentActivities,
  selectCountdown,
  selectCurrentActivityForm,
  selectError,
  selectRecentActivities,
  selectTimeSummary,
  selectTimeZone,
  startCountdown,
  stopCountdown,
} from "../../application/activities_slice";
import { AppDispatch } from "../../application/store";
import { Activity, TimeSummary, WorkingDay } from "../../domain/activities";
import { Duration } from "../../domain/duration";
import { EventHandler } from "../../util/types";
import ErrorComponent from "../components/error_component";

export default function ActivitiesPage() {
  const error = useSelector(selectError);
  const currentActivityForm = useSelector(selectCurrentActivityForm);
  const countdown = useSelector(selectCountdown);
  const recentActivities = useSelector(selectRecentActivities);
  const timeZone = useSelector(selectTimeZone);
  const timeSummary = useSelector(selectTimeSummary);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryRecentActivities({}));
  }, [dispatch]);

  return (
    <>
      <aside className="container my-4">
        <ErrorComponent {...error} />
        <CurrentActivityForm
          {...currentActivityForm}
          onChange={(event) => dispatch(changeText(event))}
          onSubmit={() => dispatch(logActivity({}))}
        />
        <CountdownComponent
          {...countdown}
          onStart={() => dispatch(startCountdown({}))}
          onStop={() => dispatch(stopCountdown({}))}
          onChange={(event) => dispatch(durationSelected(event))}
        />
      </aside>
      <main className="container my-4">
        <RecentActivitiesContainer
          recentActivities={recentActivities}
          timeZone={timeZone}
          onSelect={({ activity }) => dispatch(activitySelected(activity))}
        />
      </main>
      <footer className="sticky-bottom bg-body-secondary">
        <div className="container py-2">
          <TimeSummaryComponent {...timeSummary} />
        </div>
      </footer>
    </>
  );
}

function CurrentActivityForm({
  client,
  project,
  task,
  notes,
  disabled,
  loggable,
  onChange,
  onSubmit,
}: {
  client: string;
  project: string;
  task: string;
  notes: string;
  disabled: boolean;
  loggable: boolean;
  onChange: EventHandler<{ name: "client" | "project" | "task" | "notes"; text: string }>;
  onSubmit: EventHandler;
}) {
  function handleSubmitted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmitted}>
      <FormInput name="client" title="Client" disabled={disabled} value={client} onChange={onChange} />
      <FormInput name="project" title="Project" disabled={disabled} value={project} onChange={onChange} />
      <FormInput name="task" title="Task" disabled={disabled} value={task} onChange={onChange} />
      <FormInput name="notes" title="Notes" disabled={disabled} value={notes} onChange={onChange} />
      <button type="submit" className="btn btn-primary btn-sm w-100" disabled={disabled || loggable}>
        Log
      </button>
    </form>
  );
}

function FormInput({
  name,
  title,
  disabled,
  value,
  onChange,
}: {
  name: "client" | "project" | "task" | "notes";
  title: string;
  disabled: boolean;
  value: string;
  onChange: EventHandler<{ name: "client" | "project" | "task" | "notes"; text: string }>;
}) {
  return (
    <div className="row mb-3">
      <label htmlFor={name} className="col-sm-2 col-form-label">
        {title}
      </label>
      <div className="col-sm-10">
        <input
          type="text"
          id={name}
          name={name}
          className="form-control form-control-sm"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange({ name, text: e.target.value })}
        />
      </div>
    </div>
  );
}

function CountdownComponent({
  duration,
  remaining,
  percentage,
  isRunning,
  onStart,
  onStop,
  onChange,
}: {
  duration: string;
  remaining: string;
  percentage: number;
  isRunning: boolean;
  onStart: EventHandler;
  onStop: EventHandler;
  onChange: EventHandler<{ duration: string }>;
}) {
  function handleToggled(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      onStart();
    } else {
      onStop();
    }
  }

  return (
    <div className="d-flex my-4 gap-3">
      <div className="flex-fill">
        <div
          className="progress"
          role="progressbar"
          aria-label="Interval progress"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="text-center">{Duration.parse(remaining).toLocaleString({ style: "medium" })}</div>
      </div>
      <div>
        <div className="btn-group">
          <input
            id="start-stop-countdown"
            type="checkbox"
            className="btn-check"
            autoComplete="off"
            checked={isRunning}
            onChange={handleToggled}
          />
          <label className="btn btn-primary" htmlFor="start-stop-countdown">
            {isRunning ? "Stop" : "Start"}
          </label>
          <button
            type="button"
            className="btn btn-primary dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="visually-hidden">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu">
            <DurationItem duration="PT5M" active={duration === "PT5M"} onChange={onChange} />
            <DurationItem duration="PT10M" active={duration === "PT10M"} onChange={onChange} />
            <DurationItem duration="PT15M" active={duration === "PT15M"} onChange={onChange} />
            <DurationItem duration="PT20M" active={duration === "PT20M"} onChange={onChange} />
            <DurationItem duration="PT30M" active={duration === "PT30M"} onChange={onChange} />
            <DurationItem duration="PT60M" active={duration === "PT60M"} onChange={onChange} />
            <DurationItem duration="PT1M" active={duration === "PT1M"} onChange={onChange} />
          </ul>
        </div>
      </div>
    </div>
  );
}

function DurationItem({
  duration,
  active,
  onChange,
}: {
  duration: string;
  active: boolean;
  onChange: EventHandler<{ duration: string }>;
}) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onChange({ duration });
  }

  return (
    <li>
      <a
        className={"dropdown-item" + (active ? " active" : "")}
        aria-current={active ? "false" : undefined}
        href="#"
        onClick={handleClick}
      >
        {Duration.parse(duration).minutes} min
      </a>
    </li>
  );
}

function RecentActivitiesContainer({
  recentActivities,
  timeZone,
  onSelect,
}: {
  recentActivities: WorkingDay[];
  timeZone: string;
  onSelect: EventHandler<{ activity: Activity }>;
}) {
  return recentActivities.map((workingDay) => (
    <WorkingDayComponent
      key={new Date(workingDay.date).toISOString()}
      workingDay={workingDay}
      timeZone={timeZone}
      onSelect={onSelect}
    />
  ));
}

function WorkingDayComponent({
  workingDay,
  timeZone,
  onSelect,
}: {
  workingDay: WorkingDay;
  timeZone: string;
  onSelect: EventHandler<{ activity: Activity }>;
}) {
  return (
    <div className="mt-4">
      <h6 className="m-0 p-2 sticky-top" style={{ top: "3.5rem" }}>
        {new Date(workingDay.date).toLocaleDateString(undefined, { dateStyle: "full", timeZone })}
      </h6>
      <div className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <ActivityComponent
            key={activity.start}
            activity={activity}
            timeZone={timeZone}
            onSelect={() => onSelect({ activity })}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityComponent({
  activity,
  timeZone,
  onSelect,
}: {
  activity: Activity;
  timeZone: string;
  onSelect: EventHandler;
}) {
  return (
    <button
      key={new Date(activity.start).toISOString()}
      onClick={() => onSelect()}
      className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start"
    >
      <div style={{ width: "3em" }}>
        {new Date(activity.start).toLocaleTimeString(undefined, {
          timeStyle: "short",
          hour12: false,
          timeZone,
        })}
      </div>
      <div>
        <div className="ms-2 me-auto">
          <div>
            {activity.project} ({activity.client}) {activity.task}
          </div>
          {activity.notes && <small className="text-body-tertiary">{activity.notes}</small>}
        </div>
      </div>
    </button>
  );
}

function TimeSummaryComponent({ hoursToday, hoursYesterday, hoursThisWeek, hoursThisMonth }: TimeSummary) {
  return (
    <div className="d-flex justify-content-center flex-wrap text-center">
      <div className="flex-fill">
        <div className="small">Hours Today</div>
        <div>{Duration.parse(hoursToday).toLocaleString()}</div>
      </div>
      <div className="flex-fill">
        <div className="small">Hours Yesterday</div>
        <div>{Duration.parse(hoursYesterday).toLocaleString()}</div>
      </div>
      <div className="flex-fill">
        <div className="small">Hours this Week</div>
        <div>{Duration.parse(hoursThisWeek).toLocaleString()}</div>
      </div>
      <div className="flex-fill">
        <div className="small">Hours this Month</div>
        <div>{Duration.parse(hoursThisMonth).toLocaleString()}</div>
      </div>
    </div>
  );
}
