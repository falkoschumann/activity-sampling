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
import Error from "../components/error";

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
      <aside className="container py-2 bg-body">
        <Error {...error} />
        <CurrentActivityForm
          {...currentActivityForm}
          onChange={(name, text) => dispatch(changeText({ name, text }))}
          onSubmit={() => dispatch(logActivity({}))}
        />
        <CountdownComponent
          {...countdown}
          onStart={() => dispatch(startCountdown({}))}
          onStop={() => dispatch(stopCountdown({}))}
          onChange={(duration) => dispatch(durationSelected({ duration }))}
        />
      </aside>
      <main className="container flex-shrink-0" style={{ paddingTop: "290px", paddingBottom: "90px" }}>
        <RecentActivitiesContainer
          recentActivities={recentActivities}
          timeZone={timeZone}
          onSelect={(activity) => dispatch(activitySelected(activity))}
        />
      </main>
      <footer className="container fixed-bottom py-3 bg-body">
        <TimeSummaryComponent {...timeSummary} />
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
  onChange: (name: "client" | "project" | "task" | "notes", text: string) => void;
  onSubmit: () => void;
}) {
  function handleSubmitted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmitted}>
      <FormInput
        name={"client"}
        title={"Client"}
        disabled={disabled}
        value={client}
        onChange={(text) => onChange("client", text)}
      />
      <FormInput
        name={"project"}
        title={"Project"}
        disabled={disabled}
        value={project}
        onChange={(text) => onChange("project", text)}
      />
      <FormInput
        name={"task"}
        title={"Task"}
        disabled={disabled}
        value={task}
        onChange={(text) => onChange("task", text)}
      />
      <FormInput
        name={"notes"}
        title={"Notes"}
        disabled={disabled}
        value={notes}
        onChange={(text) => onChange("notes", text)}
      />
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
  name: string;
  title: string;
  disabled: boolean;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <div className="row mb-2">
      <label htmlFor={name} className="col-sm-2 col-form-label">
        {title}:
      </label>
      <div className="col-sm-10">
        <input
          type="text"
          id={name}
          name={name}
          className="form-control form-control-sm"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  onStart: () => void;
  onStop: () => void;
  onChange: (duration: string) => void;
}) {
  function handleToggled(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      onStart();
    } else {
      onStop();
    }
  }

  return (
    <div className="my-3 d-flex gap-3">
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
        <div className="btn-group btn-group-sm">
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
            <DurationItem value="PT5M" active={duration === "PT5M"} onChange={onChange} />
            <DurationItem value="PT10M" active={duration === "PT10M"} onChange={onChange} />
            <DurationItem value="PT15M" active={duration === "PT15M"} onChange={onChange} />
            <DurationItem value="PT20M" active={duration === "PT20M"} onChange={onChange} />
            <DurationItem value="PT30M" active={duration === "PT30M"} onChange={onChange} />
            <DurationItem value="PT60M" active={duration === "PT60M"} onChange={onChange} />
            <DurationItem value="PT1M" active={duration === "PT1M"} onChange={onChange} />
          </ul>
        </div>
      </div>
    </div>
  );
}

function DurationItem({
  value,
  active,
  onChange,
}: {
  value: string;
  active: boolean;
  onChange: (duration: string) => void;
}) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onChange(value);
  }

  return (
    <li>
      <a
        className={"dropdown-item" + (active ? " active" : "")}
        aria-current={active ? "false" : undefined}
        href="#"
        onClick={handleClick}
      >
        {Duration.parse(value).minutes} min
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
  onSelect: (activity: Activity) => void;
}) {
  return recentActivities.map((workingDay) => (
    <div key={new Date(workingDay.date).toISOString()}>
      <h6 className="bg-body-tertiary p-1 m-0 mt-2 sticky-top small">
        {new Date(workingDay.date).toLocaleDateString(undefined, { dateStyle: "full", timeZone })}
      </h6>
      <div className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <ActivityComponent
            key={activity.start}
            activity={activity}
            timeZone={timeZone}
            onSelect={() => onSelect(activity)}
          />
        ))}
      </div>
    </div>
  ));
}

function ActivityComponent({
  activity,
  timeZone,
  onSelect,
}: {
  activity: Activity;
  timeZone: string;
  onSelect: () => void;
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
    <div>
      <div className="d-flex justify-content-center flex-wrap text-center">
        <div className="flex-fill">
          <div>Hours Today</div>
          <div className="fs-5">{Duration.parse(hoursToday).toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours Yesterday</div>
          <div className="fs-5">{Duration.parse(hoursYesterday).toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Week</div>
          <div className="fs-5">{Duration.parse(hoursThisWeek).toLocaleString()}</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Month</div>
          <div className="fs-5">{Duration.parse(hoursThisMonth).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
