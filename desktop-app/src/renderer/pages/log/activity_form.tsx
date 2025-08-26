// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { FormEvent } from "react";

export interface ActivityFormData {
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export default function ActivityFormComponent({
  client,
  project,
  task,
  notes,
  onSubmit,
}: {
  client?: string;
  project?: string;
  task?: string;
  notes?: string;
  onSubmit: ({ client, project, task, notes }: ActivityFormData) => void;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const client = formData.get("client")!.toString();
    const project = formData.get("project")!.toString();
    const task = formData.get("task")!.toString();
    const notes = formData.get("notes")?.toString() || undefined;
    onSubmit({ client, project, task, notes });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormInputComponent
        name="client"
        title="Client"
        value={client}
        isRequired
      />
      <FormInputComponent
        name="project"
        title="Project"
        value={project}
        isRequired
      />
      <FormInputComponent name="task" title="Task" value={task} isRequired />
      <FormInputComponent name="notes" title="Notes" value={notes} />
      <button type="submit" className="btn btn-primary btn-sm w-100">
        Log
      </button>
    </form>
  );
}

function FormInputComponent({
  name,
  title,
  value,
  isRequired,
}: {
  name: string;
  title: string;
  value?: string;
  isRequired?: boolean;
}) {
  return (
    <div className="row mb-1">
      <label htmlFor={name} className="col-sm-2 col-form-label">
        {title}
      </label>
      <div className="col-sm-10">
        <input
          type="text"
          id={name}
          name={name}
          defaultValue={value}
          required={isRequired}
          className="form-control form-control-sm"
        />
      </div>
    </div>
  );
}
