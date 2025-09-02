// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { StopWatch } from "../../src/shared/common/stop_watch";

describe("Stop watch", () => {
  it("Measure an unnamed task", () => {
    const watch = StopWatch.createNull();
    expect(watch.isRunning()).toEqual(false);

    watch.start();
    expect(watch.currentTaskName()).toEqual("");
    expect(watch.isRunning()).toEqual(true);

    watch.stop();
    expect(watch.isRunning()).toEqual(false);
    expect(watch.lastTaskInfo()).toEqual({ taskName: "", timeSeconds: 1 });
    expect(watch.getTotalTimeSeconds()).toEqual(1);
    expect(watch.getTaskInfo()).toEqual([{ taskName: "", timeSeconds: 1 }]);
  });

  it("Measure a named task", () => {
    const watch = StopWatch.createNull();

    watch.start("Test Task");
    expect(watch.currentTaskName()).toEqual("Test Task");

    watch.stop();
    expect(watch.lastTaskInfo()).toEqual({
      taskName: "Test Task",
      timeSeconds: 1,
    });
    expect(watch.getTotalTimeSeconds()).toEqual(1);
    expect(watch.getTaskInfo()).toEqual([
      { taskName: "Test Task", timeSeconds: 1 },
    ]);
  });

  it("Measure multiple tasks", () => {
    const watch = StopWatch.createNull();

    watch.start("Task 1");
    expect(watch.currentTaskName()).toEqual("Task 1");
    watch.stop();
    watch.start("Task 2");
    expect(watch.currentTaskName()).toEqual("Task 2");
    watch.stop();
    watch.start("Task 3");
    expect(watch.currentTaskName()).toEqual("Task 3");
    watch.stop();

    expect(watch.lastTaskInfo()).toEqual({
      taskName: "Task 3",
      timeSeconds: 1,
    });
    expect(watch.getTaskCount()).toEqual(3);
    expect(watch.getTotalTimeSeconds()).toEqual(3);
    expect(watch.getTaskInfo()).toEqual([
      { taskName: "Task 1", timeSeconds: 1 },
      { taskName: "Task 2", timeSeconds: 1 },
      { taskName: "Task 3", timeSeconds: 1 },
    ]);
  });

  it("Disable task list", () => () => {
    const watch = StopWatch.createNull();

    watch.setKeepTaskList(false);
    watch.start("Task 1");
    watch.stop();
    watch.start("Task 2");
    watch.stop();
    watch.start("Task 3");
    watch.stop();

    expect(watch.lastTaskInfo()).toEqual({
      taskName: "Task 3",
      timeSeconds: 1,
    });
    expect(watch.getTaskCount()).toEqual(3);
    expect(watch.getTotalTimeSeconds()).toEqual(3);
    expect(watch.getTaskInfo()).toThrow("Task info is not being kept.");
  });

  it("Creates a stop watch without an ID", () => {
    const watch = StopWatch.createNull();

    expect(watch.getId()).toEqual("");
  });

  it("Creates a stop watch with an ID", () => {
    const watch = StopWatch.createNull("test-watch");

    expect(watch.getId()).toEqual("test-watch");
  });

  it("Fails to start when already running", () => {
    const watch = StopWatch.createNull();

    watch.start("Task 1");

    expect(() => watch.start("Task 2")).toThrow(
      "Cannot start StopWatch: it is already running.",
    );
  });

  it("Fails to stop when not running", () => {
    const watch = StopWatch.createNull();

    expect(() => watch.stop()).toThrow(
      "Cannot stop StopWatch: it is not running.",
    );
  });
});
