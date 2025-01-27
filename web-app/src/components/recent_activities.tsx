// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function RecentActivities() {
  return (
    <div>
      <h6 className="bg-body-tertiary p-2 sticky-top">Tuesday, 14. January 2025</h6>
      <div className="list-group list-group-flush">
        <button className="list-group-item list-group-item-action d-flex justify-content-start align-items-start">
          <div style={{ width: "3em" }}>10:00</div>
          <div>
            <div className="ms-2 me-auto">
              <div>Project (Client) Task</div>
              <small className="text-body-tertiary">Notes</small>
            </div>
          </div>
        </button>
        <button className="list-group-item list-group-item-action d-flex justify-content-start align-items-start">
          <div style={{ width: "3em" }}>09:30</div>
          <div>
            <div className="ms-2 me-auto">
              <div>Project (Client) Task</div>
            </div>
          </div>
        </button>
        <button className="list-group-item list-group-item-action d-flex justify-content-start align-items-start">
          <div style={{ width: "3em" }}>09:00</div>
          <div>
            <div className="ms-2 me-auto">
              <div>Project (Client) Task</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
