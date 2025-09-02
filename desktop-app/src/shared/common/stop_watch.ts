// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface TaskInfo {
  taskName: string;
  timeSeconds: number;
}

export class StopWatch {
  static create(id?: string): StopWatch {
    return new StopWatch(id, Date);
  }

  static createNull(id?: string): StopWatch {
    return new StopWatch(id, DateStub as unknown as typeof Date);
  }

  #id: string;
  #dateClass: typeof Date;
  #taskCount = 0;
  #taskList?: TaskInfo[] = [];
  #totalTimeMillis = 0;
  #currentTaskName?: string;
  #startTimeMillis = 0;
  #lastTaskInfo?: TaskInfo;

  private constructor(id = "", dateClass: typeof Date) {
    this.#id = id;
    this.#dateClass = dateClass;
  }

  start(taskName = "") {
    if (this.#currentTaskName != null) {
      throw new Error("Cannot start StopWatch: it is already running.");
    }

    this.#currentTaskName = taskName;
    this.#startTimeMillis = this.#dateClass.now();
  }

  stop() {
    if (this.#currentTaskName == null) {
      throw new Error("Cannot stop StopWatch: it is not running.");
    }

    const lastTime = this.#dateClass.now() - this.#startTimeMillis;
    this.#totalTimeMillis += lastTime;
    this.#lastTaskInfo = {
      taskName: this.#currentTaskName!,
      timeSeconds: lastTime / 1000,
    };
    this.#taskList?.push(this.#lastTaskInfo);
    this.#taskCount++;
    this.#currentTaskName = undefined;
  }

  getId(): string {
    return this.#id;
  }

  setKeepTaskList(keepTaskList: boolean) {
    this.#taskList = keepTaskList ? [] : undefined;
  }

  currentTaskName(): string | undefined {
    return this.#currentTaskName;
  }

  lastTaskInfo(): TaskInfo | undefined {
    return this.#lastTaskInfo;
  }

  isRunning() {
    return this.#currentTaskName != null;
  }

  getTaskCount() {
    return this.#taskCount;
  }

  getTaskInfo(): TaskInfo[] {
    if (this.#taskList == null) {
      throw new Error("Task info is not being kept.");
    }

    return this.#taskList;
  }

  getTotalTimeMillis() {
    return this.#totalTimeMillis;
  }

  getTotalTimeSeconds() {
    return this.getTotalTimeMillis() / 1000;
  }
}

class DateStub {
  static #timestamp = 0;

  static now(): number {
    const now = this.#timestamp;
    this.#timestamp += 1000; // Simulate 1 second per call
    return now;
  }
}
