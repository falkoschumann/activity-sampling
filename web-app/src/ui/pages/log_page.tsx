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
} from "../../application/log_slice";
import { AppDispatch } from "../../application/store";
import { Duration } from "../../common/duration";
import { EventHandler } from "../../common/events";
import { Activity, WorkingDay } from "../../domain/activities";
import ErrorComponent from "../components/error_component";
import PageLayout from "../layouts/page_layout";

export default function LogPage() {
  const error = useSelector(selectError);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(queryRecentActivities({}));
  }, [dispatch]);

  return (
    <PageLayout>
      <aside className="container my-4">
        <CurrentActivityFormContainer />
        <CountdownContainer />
      </aside>
      <main className="container my-4" style={{ paddingBottom: "3rem" }}>
        <ErrorComponent {...error} />
        <RecentActivitiesContainer />
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container py-2">
          <TimeSummaryContainer />
        </div>
      </footer>
    </PageLayout>
  );
}

function CurrentActivityFormContainer() {
  const { client, project, task, notes, disabled, loggable } = useSelector(selectCurrentActivityForm);
  const dispatch = useDispatch<AppDispatch>();

  function handleChange(event: { name: "client" | "project" | "task" | "notes"; text: string }) {
    dispatch(changeText(event));
  }

  function handleSubmitted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(logActivity({}));
  }

  return (
    <form onSubmit={handleSubmitted}>
      <FormInputComponent name="client" title="Client" disabled={disabled} value={client} onChange={handleChange} />
      <FormInputComponent name="project" title="Project" disabled={disabled} value={project} onChange={handleChange} />
      <FormInputComponent name="task" title="Task" disabled={disabled} value={task} onChange={handleChange} />
      <FormInputComponent name="notes" title="Notes" disabled={disabled} value={notes} onChange={handleChange} />
      <button type="submit" className="btn btn-primary btn-sm w-100" disabled={disabled || !loggable}>
        Log
      </button>
    </form>
  );
}

function FormInputComponent({
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

function CountdownContainer() {
  const { duration, remaining, percentage, isRunning } = useSelector(selectCountdown);
  const dispatch = useDispatch<AppDispatch>();

  function handleChange(event: { duration: string }) {
    dispatch(durationSelected(event));
  }

  function handleToggled(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      dispatch(startCountdown({}));
    } else {
      dispatch(stopCountdown({}));
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
            <DurationItemComponent duration="PT5M" active={duration === "PT5M"} onChange={handleChange} />
            <DurationItemComponent duration="PT10M" active={duration === "PT10M"} onChange={handleChange} />
            <DurationItemComponent duration="PT15M" active={duration === "PT15M"} onChange={handleChange} />
            <DurationItemComponent duration="PT20M" active={duration === "PT20M"} onChange={handleChange} />
            <DurationItemComponent duration="PT30M" active={duration === "PT30M"} onChange={handleChange} />
            <DurationItemComponent duration="PT60M" active={duration === "PT60M"} onChange={handleChange} />
            <DurationItemComponent duration="PT1M" active={duration === "PT1M"} onChange={handleChange} />
          </ul>
        </div>
      </div>
    </div>
  );
}

function DurationItemComponent({
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

function RecentActivitiesContainer() {
  const recentActivities = useSelector(selectRecentActivities);
  const timeZone = useSelector(selectTimeZone);
  const dispatch = useDispatch<AppDispatch>();

  function handleSelect(event: { activity: Activity }) {
    dispatch(activitySelected(event.activity));
  }

  return recentActivities.map((workingDay) => (
    <WorkingDayComponent
      key={new Date(workingDay.date).toISOString()}
      workingDay={workingDay}
      timeZone={timeZone}
      onSelect={handleSelect}
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
      <h6 className="m-0 p-2 sticky-top bg-body-tertiary" style={{ top: "3.5rem" }}>
        {new Date(workingDay.date).toLocaleDateString(undefined, { dateStyle: "full", timeZone })}
      </h6>
      <div className="list-group list-group-flush">
        {workingDay.activities.map((activity) => (
          <ActivityComponent
            key={activity.timestamp}
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
      key={new Date(activity.timestamp).toISOString()}
      onClick={() => onSelect()}
      className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start"
    >
      <div style={{ width: "3em" }}>
        {new Date(activity.timestamp).toLocaleTimeString(undefined, {
          timeStyle: "short",
          hour12: false,
          timeZone,
        })}
      </div>
      <div>
        <div className="ms-2 me-auto">
          <div>
            <strong>{activity.project}</strong> ({activity.client}) {activity.task}
          </div>
          {activity.notes && <small className="text-body-tertiary">{activity.notes}</small>}
        </div>
      </div>
    </button>
  );
}

function TimeSummaryContainer() {
  const { hoursToday, hoursYesterday, hoursThisWeek, hoursThisMonth } = useSelector(selectTimeSummary);

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
