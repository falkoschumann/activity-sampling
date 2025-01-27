// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function TimeSummary() {
  return (
    <div>
      <div className="d-flex justify-content-center flex-wrap text-center">
        <div className="flex-fill">
          <div>Hours Today</div>
          <div className="fs-5">01:30</div>
        </div>
        <div className="flex-fill">
          <div>Hours Yesterday</div>
          <div className="fs-5">00:00</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Week</div>
          <div className="fs-5">01:30</div>
        </div>
        <div className="flex-fill">
          <div>Hours this Month</div>
          <div className="fs-5">01:30</div>
        </div>
      </div>
    </div>
  );
}
