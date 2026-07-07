// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import FormInputComponent from "./form_input.component";
import FormSelectComponent from "./form_select.component";
import type { SubmitEvent } from "react";

export function ActivityFormComponent({
  client,
  project,
  task,
  notes,
  category,
  categories,
  isDisabled,
  onClientChange,
  onProjectChange,
  onTaskChange,
  onNotesChange,
  onCategoryChange,
  onSubmit,
}: {
  client: string;
  project: string;
  task: string;
  notes: string;
  category: string;
  categories: string[];
  isDisabled: boolean;
  onClientChange: (client: string) => void;
  onProjectChange: (project: string) => void;
  onTaskChange: (task: string) => void;
  onNotesChange: (notes: string) => void;
  onCategoryChange: (category: string) => void;
  onSubmit: () => void;
}) {
  const isSubmitDisabled = isDisabled || client.trim().length + project.trim().length + task.trim().length === 0;

  const submitForm = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submitForm}>
      <FormInputComponent
        name="client"
        title="Client"
        value={client}
        isRequired
        isDisabled={isDisabled}
        onTextChange={(text) => onClientChange(text)}
      />
      <FormInputComponent
        name="project"
        title="Project"
        value={project}
        isRequired
        isDisabled={isDisabled}
        onTextChange={(text) => onProjectChange(text)}
      />
      <FormInputComponent
        name="task"
        title="Task"
        value={task}
        isRequired
        isDisabled={isDisabled}
        onTextChange={(text) => onTaskChange(text)}
      />
      <FormInputComponent
        name="notes"
        title="Notes"
        value={notes}
        isDisabled={isDisabled}
        onTextChange={(text) => onNotesChange(text)}
      />
      <FormSelectComponent
        name="category"
        title="Category"
        options={categories}
        value={category}
        isDisabled={isDisabled}
        onOptionChange={(option) => onCategoryChange(option)}
      />
      <button type="submit" disabled={isSubmitDisabled} className="btn btn-primary btn-sm w-100">
        Log
      </button>
    </form>
  );
}

export default ActivityFormComponent;
