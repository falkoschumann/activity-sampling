// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { logActivity, selectLastActivity } from "../application/activities_slice.ts";
import { AppDispatch } from "../application/store.ts";

export default function CurrentActivity() {
  const lastActivity = useSelector(selectLastActivity);
  const dispatch = useDispatch<AppDispatch>();

  function handleSubmitted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const client = (form.elements.namedItem("client") as HTMLInputElement).value;
    const project = (form.elements.namedItem("project") as HTMLInputElement).value;
    const task = (form.elements.namedItem("task") as HTMLInputElement).value;
    const notes = (form.elements.namedItem("notes") as HTMLInputElement).value;
    dispatch(logActivity({ client, project, task, notes }));
  }

  return (
    <form onSubmit={handleSubmitted}>
      <div className="mb-2">
        <label htmlFor="client" className="form-label">
          Client:
        </label>
        <input
          type="text"
          id="client"
          name="client"
          className="form-control form-control-sm"
          defaultValue={lastActivity?.client}
        />
      </div>
      <div className="mb-2">
        <label htmlFor="project" className="form-label">
          Project:
        </label>
        <input
          type="text"
          id="project"
          name="project"
          className="form-control form-control-sm"
          defaultValue={lastActivity?.project}
        />
      </div>
      <div className="mb-2">
        <label htmlFor="task" className="form-label">
          Task:
        </label>
        <input
          type="text"
          id="task"
          name="task"
          className="form-control form-control-sm"
          defaultValue={lastActivity?.task}
        />
      </div>
      <div className="mb-2">
        <label htmlFor="notes" className="form-label">
          Notes:
        </label>
        <input
          type="text"
          id="notes"
          name="notes"
          className="form-control form-control-sm"
          defaultValue={lastActivity?.notes}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm w-100">
        Log
      </button>
    </form>
  );
}
