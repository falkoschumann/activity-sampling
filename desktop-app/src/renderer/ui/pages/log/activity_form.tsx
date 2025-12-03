// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type FormEvent, memo } from "react";

import type { ActivityTemplate } from "../../../domain/log";

const MemoizedActivityFormComponent = memo(ActivityFormComponent);

export default MemoizedActivityFormComponent;

function ActivityFormComponent({
  isDisabled = false,
  client,
  project,
  task,
  notes,
  category,
  onTextChange,
  onSubmit,
}: {
  isDisabled: boolean;
  client: string;
  project: string;
  task: string;
  notes: string;
  category: string;
  onTextChange: (name: keyof ActivityTemplate, text: string) => void;
  onSubmit: () => void;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormInputComponent
        name="client"
        title="Client"
        value={client}
        isRequired
        isDisabled={isDisabled}
        onTextChange={(text) => onTextChange("client", text)}
      />
      <FormInputComponent
        name="project"
        title="Project"
        value={project}
        isRequired
        isDisabled={isDisabled}
        onTextChange={(text) => onTextChange("project", text)}
      />
      <FormInputComponent
        name="task"
        title="Task"
        value={task}
        isRequired
        isDisabled={isDisabled}
        onTextChange={(text) => onTextChange("task", text)}
      />
      <FormInputComponent
        name="notes"
        title="Notes"
        value={notes}
        isDisabled={isDisabled}
        onTextChange={(text) => onTextChange("notes", text)}
      />
      <FormSelectComponent
        name="category"
        title="Category"
        options={["", "Feature", "Rework", "Meeting", "Training"]}
        value={category}
        isDisabled={isDisabled}
        onOptionChange={(option) => onTextChange("category", option)}
      />
      <button type="submit" disabled={isDisabled} className="btn btn-primary btn-sm w-100">
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
  isDisabled,
  onTextChange,
}: {
  name: string;
  title: string;
  value: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  onTextChange: (text: string) => void;
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
          value={value}
          required={isRequired}
          disabled={isDisabled}
          className="form-control form-control-sm"
          onChange={(event) => onTextChange?.(event.currentTarget.value)}
        />
      </div>
    </div>
  );
}

function FormSelectComponent({
  name,
  title,
  options,
  value,
  isRequired,
  isDisabled,
  onOptionChange,
}: {
  name: string;
  title: string;
  options: string[];
  value: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  onOptionChange: (text: string) => void;
}) {
  return (
    <div className="row mb-1">
      <label htmlFor={name} className="col-sm-2 col-form-label">
        {title}
      </label>
      <div className="col-sm-10">
        <select
          id={name}
          value={value}
          required={isRequired}
          disabled={isDisabled}
          className="form-select form-select-sm"
          onChange={(event) => onOptionChange(event.currentTarget.value)}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
