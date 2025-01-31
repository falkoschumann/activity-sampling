// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Activity } from "../domain/model";

interface CurrentActivityProps {
  lastActivity?: Activity;
}

export default function CurrentActivity({ lastActivity }: CurrentActivityProps) {
  return (
    <form>
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
