// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useDispatch, useSelector } from "react-redux";

import { AppDispatch } from "../application/store.ts";
import { durationSelected, selectCountdown } from "../application/activities_slice.ts";
import { Duration } from "../domain/duration.ts";

export default function Countdown() {
  const { duration } = useSelector(selectCountdown);

  return (
    <div className="my-3 d-flex gap-3">
      <div className="flex-fill">
        <div
          className="progress"
          role="progressbar"
          aria-label="Interval progress"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: "75%" }}></div>
        </div>
        <div className="text-center">00:07:30</div>
      </div>
      <div>
        <div className="btn-group btn-group-sm">
          <button type="button" className="btn btn-primary" data-bs-toggle="button">
            Start
          </button>
          <button
            type="button"
            className="btn btn-primary dropdown-toggle dropdown-toggle-split"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="visually-hidden">Toggle Dropdown</span>
          </button>
          <ul className="dropdown-menu">
            <DurationItem value="PT5M" current={duration} />
            <DurationItem value="PT10M" current={duration} />
            <DurationItem value="PT15M" current={duration} />
            <DurationItem value="PT20M" current={duration} />
            <DurationItem value="PT30M" current={duration} />
            <DurationItem value="PT60M" current={duration} />
            <DurationItem value="PT1M" current={duration} />
          </ul>
        </div>
      </div>
    </div>
  );
}

function DurationItem({ value, current }: { value: string; current: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const isActive = value === current;

  function handleClicked(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    dispatch(durationSelected({ duration: value }));
  }

  return (
    <li>
      <a
        className={"dropdown-item" + (isActive ? " active" : "")}
        aria-current={isActive ? "false" : undefined}
        href="#"
        onClick={handleClicked}
      >
        {Duration.parse(value).minutes} min
      </a>
    </li>
  );
}
