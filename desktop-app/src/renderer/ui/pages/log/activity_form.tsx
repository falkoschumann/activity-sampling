// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import type { FormEvent } from "react";

export interface ActivityFormData {
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export default function ActivityFormComponent({
  isDisabled = false,
  client,
  project,
  task,
  notes,
  onSubmit,
}: {
  isDisabled?: boolean;
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
        isDisabled={isDisabled}
      />
      <FormInputComponent
        name="project"
        title="Project"
        value={project}
        isRequired
        isDisabled={isDisabled}
      />
      <FormInputComponent
        name="task"
        title="Task"
        value={task}
        isRequired
        isDisabled={isDisabled}
      />
      <FormInputComponent
        name="notes"
        title="Notes"
        value={notes}
        isDisabled={isDisabled}
      />
      <button
        type="submit"
        disabled={isDisabled}
        className="btn btn-primary btn-sm w-100"
      >
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
  isDisabled = false,
}: {
  name: string;
  title: string;
  value?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
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
          disabled={isDisabled}
          className="form-control form-control-sm"
        />
      </div>
    </div>
  );
}
