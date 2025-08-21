// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { formatDuration, FormatStyle } from "../main/common/temporal";

function DesktopApp() {
  /*
  const [versions] = useState(window.electron.process.versions);
  const ping = (): void => window.electron.ping();
  const component = (
    <div className="my-4">
      <button className="btn btn-primary" onClick={ping}>
        Send IPC
      </button>
      <ul>
        <li className="electron-version">Electron v{versions.electron}</li>
        <li className="chrome-version">Chromium v{versions.chrome}</li>
        <li className="node-version">Node v{versions.node}</li>
      </ul>
    </div>
  );
  */

  const remaining = "PT18M36S";
  const percentage = 38;
  const hoursToday = "PT1H";
  const hoursYesterday = "PT0S";
  const hoursThisWeek = "PT1H";
  const hoursThisMonth = "PT1H";

  return (
    <div className="container">
      {/* TODO add scroll to top button */}
      <aside className="my-4">
        <form>
          <div className="row mb-1">
            <label htmlFor="client" className="col-sm-2 col-form-label">
              Client
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                id="client"
                name="client"
                className="form-control form-control-sm"
              />
            </div>
          </div>
          <div className="row mb-1">
            <label htmlFor="project" className="col-sm-2 col-form-label">
              Project
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                id="project"
                name="project"
                className="form-control form-control-sm"
              />
            </div>
          </div>
          <div className="row mb-1">
            <label htmlFor="task" className="col-sm-2 col-form-label">
              Task
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                id="task"
                name="task"
                className="form-control form-control-sm"
              />
            </div>
          </div>
          <div className="row mb-1">
            <label htmlFor="notes" className="col-sm-2 col-form-label">
              Notes
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                id="notes"
                name="notes"
                className="form-control form-control-sm"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm w-100">
            Log
          </button>
        </form>
        <div className="my-4">
          <div
            className="progress"
            role="progressbar"
            aria-label="Interval progress"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-bar"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-center">
            {formatDuration(remaining, FormatStyle.FULL)}
          </div>
        </div>
      </aside>
      <main className="my-4">
        <h5>
          Logged activities of the last 30 days
          <button className="btn" title="Refresh logged activities.">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </h5>
        <div className="mt-4">
          <h6
            className="m-0 p-2 sticky-top bg-body-tertiary"
            style={{ top: "3.5rem" }}
          >
            {Temporal.PlainDate.from("2025-08-21").toLocaleString(undefined, {
              dateStyle: "full",
            })}
          </h6>
          <ul className="list-group list-group-flush">
            <li className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start">
              <div style={{ width: "3em" }}>
                {Temporal.PlainDateTime.from(
                  "2025-08-21T09:20+02:00",
                ).toLocaleString(undefined, {
                  timeStyle: "short",
                  hour12: false,
                })}
              </div>
              <div>
                <div className="ms-2 me-auto">
                  <div>
                    <strong>Test project</strong> (Test client) Test task
                    <button
                      className="btn btn-sm"
                      title="Use this activity as current activity."
                    >
                      <i className="bi bi-arrow-repeat"></i>
                    </button>
                    <button className="btn btn-sm" title="Copy task name.">
                      <i className="bi bi-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </li>
            <li className="list-group-item list-group-item-action py-1 d-flex justify-content-start align-items-start">
              <div style={{ width: "3em" }}>
                {Temporal.PlainDateTime.from(
                  "2025-08-21T08:50+02:00",
                ).toLocaleString(undefined, {
                  timeStyle: "short",
                  hour12: false,
                })}
              </div>
              <div>
                <div className="ms-2 me-auto">
                  <div>
                    <strong>Test project</strong> (Test client) Test task
                    <button
                      className="btn btn-sm"
                      title="Use this activity as current activity."
                    >
                      <i className="bi bi-arrow-repeat"></i>
                    </button>
                    <button className="btn btn-sm" title="Copy task name.">
                      <i className="bi bi-copy"></i>
                    </button>
                  </div>
                  <small className="text-body-tertiary">Test notes</small>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </main>
      <footer className="fixed-bottom bg-body-secondary">
        <div className="container py-2">
          <div className="d-flex justify-content-center flex-wrap text-center">
            <div className="flex-fill">
              <div className="small">Hours Today</div>
              <div>{formatDuration(hoursToday)}</div>
            </div>
            <div className="flex-fill">
              <div className="small">Hours Yesterday</div>
              <div>{formatDuration(hoursYesterday)}</div>
            </div>
            <div className="flex-fill">
              <div className="small">Hours this Week</div>
              <div>{formatDuration(hoursThisWeek)}</div>
            </div>
            <div className="flex-fill">
              <div className="small">Hours this Month</div>
              <div>{formatDuration(hoursThisMonth)}</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DesktopApp;
