// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function ActivityFormComponent({
  client,
  project,
  task,
  notes,
}: {
  client?: string;
  project?: string;
  task?: string;
  notes?: string;
}) {
  return (
    <form>
      <FormInputComponent name="client" title="Client" value={client} />
      <FormInputComponent name="project" title="Project" value={project} />
      <FormInputComponent name="task" title="Task" value={task} />
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
}: {
  name: string;
  title: string;
  value?: string;
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
          className="form-control form-control-sm"
        />
      </div>
    </div>
  );
}
