// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function Countdown() {
  return (
    <div className="my-3">
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
  );
}
