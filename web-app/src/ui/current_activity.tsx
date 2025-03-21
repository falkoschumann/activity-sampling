// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  changeClient,
  changeNotes,
  changeProject,
  changeTask,
  logActivity,
  selectCurrentActivity,
} from "../application/activities_slice";
import { AppDispatch } from "../application/store";

export default function CurrentActivity() {
  const currentActivity = useSelector(selectCurrentActivity);
  const dispatch = useDispatch<AppDispatch>();

  function handleSubmitted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(logActivity({}));
  }

  return (
    <form onSubmit={handleSubmitted}>
      <div className="row mb-2">
        <label htmlFor="client" className="col-sm-2 col-form-label">
          Client:
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            id="client"
            name="client"
            className="form-control form-control-sm"
            disabled={currentActivity.isFormDisabled}
            value={currentActivity.client}
            onChange={(e) => dispatch(changeClient({ text: e.target.value }))}
          />
        </div>
      </div>
      <div className="row mb-2">
        <label htmlFor="project" className="col-sm-2 col-form-label">
          Project:
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            id="project"
            name="project"
            className="form-control form-control-sm"
            disabled={currentActivity.isFormDisabled}
            value={currentActivity.project}
            onChange={(e) => dispatch(changeProject({ text: e.target.value }))}
          />
        </div>
      </div>
      <div className="row mb-2">
        <label htmlFor="task" className="col-sm-2 col-form-label">
          Task:
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            id="task"
            name="task"
            className="form-control form-control-sm"
            disabled={currentActivity.isFormDisabled}
            value={currentActivity.task}
            onChange={(e) => dispatch(changeTask({ text: e.target.value }))}
          />
        </div>
      </div>
      <div className="row mb-2">
        <label htmlFor="notes" className="col-sm-2 col-form-label">
          Notes:
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            id="notes"
            name="notes"
            className="form-control form-control-sm"
            disabled={currentActivity.isFormDisabled}
            value={currentActivity.notes}
            onChange={(e) => dispatch(changeNotes({ text: e.target.value }))}
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-sm w-100"
        disabled={currentActivity.isFormDisabled || currentActivity.isLogDisabled}
      >
        Log
      </button>
    </form>
  );
}
