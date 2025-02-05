// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";

import { Activity } from "../domain/activities.ts";

interface CurrentActivityProps {
  lastActivity?: Activity;
  onLogActivity?: (activity: { client: string; project: string; task: string; notes: string }) => void;
}

export default function CurrentActivity({ lastActivity, onLogActivity }: CurrentActivityProps) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const client = form.elements.namedItem("client") as HTMLInputElement;
    const project = form.elements.namedItem("project") as HTMLInputElement;
    const task = form.elements.namedItem("task") as HTMLInputElement;
    const notes = form.elements.namedItem("notes") as HTMLInputElement;
    onLogActivity?.({
      client: client.value,
      project: project.value,
      task: task.value,
      notes: notes.value,
    });
  }

  return (
    <form onSubmit={submit}>
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
