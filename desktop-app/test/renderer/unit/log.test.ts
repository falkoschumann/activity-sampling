// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  activityLogged,
  activitySelected,
  changeText,
  initialState,
  intervalElapsed,
  reducer,
  type State,
  timerStarted,
  timerStopped,
  timerTicked
} from "../../../src/renderer/domain/log";
import { Temporal } from "@js-temporal/polyfill";

describe("Timer", () => {
  describe("Change text", () => {
    it("should change text", () => {
      let state: State = initialState;

      state = reducer(
        state,
        changeText({ name: "client", text: "Test client" }),
      );

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          client: "Test client",
        },
      });
    });

    it("should enable log button when form is valid", () => {
      let state: State = initialState;

      state = reducer(
        state,
        changeText({ name: "client", text: "Test client" }),
      );
      expect(state.form.isLogButtonDisabled).toEqual(true);
      state = reducer(
        state,
        changeText({ name: "project", text: "Test project" }),
      );
      expect(state.form.isLogButtonDisabled).toEqual(true);
      state = reducer(state, changeText({ name: "task", text: "Test task" }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: false,
        },
      });
    });

    it("should disabled log button when form contains only whitespace", () => {
      let state: State = initialState;

      state = reducer(state, changeText({ name: "client", text: "   " }));
      state = reducer(state, changeText({ name: "project", text: " " }));
      state = reducer(state, changeText({ name: "task", text: "  " }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          client: "   ",
          project: " ",
          task: "  ",
          isLogButtonDisabled: true,
        },
      });
    });
  });

  describe("Activity logged", () => {
    it("should do nothing when countdown is not running", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: false,
        },
      };

      state = reducer(state, activityLogged());

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: false,
        },
      });
    });

    it("should disable form when countdown is running", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: false,
        },
        countdown: {
          ...initialState.countdown,
          remaining: Temporal.Duration.from("PT10M"),
          percentage: 50,
          isRunning: true,
        },
      };

      state = reducer(state, activityLogged());

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          remaining: Temporal.Duration.from("PT10M"),
          percentage: 50,
          isRunning: true,
        },
      });
    });
  });

  describe("Activity selected", () => {
    it("should update form data", () => {
      let state: State = initialState;

      state = reducer(
        state,
        activitySelected({
          client: "Test client",
          project: "Test project",
          task: "Test task",
          notes: "Test notes",
        }),
      );

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          notes: "Test notes",
        },
      });
    });
  });

  describe("Timer started", () => {
    it("should start countdown and disable form", () => {
      let state: State = initialState;

      state = reducer(state, timerStarted({ interval: "PT20M" }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT20M"),
          percentage: 0,
          isRunning: true,
        },
      });
    });
  });

  describe("Timer ticked", () => {
    it("should progress countdown", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT15M"),
          percentage: 25,
          isRunning: true,
        },
      };

      state = reducer(state, timerTicked({ duration: "PT1M" }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT14M"),
          percentage: 30,
          isRunning: true,
        },
      });
    });

    it("should do not get negative", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT0M"),
          percentage: 100,
          isRunning: true,
        },
      };

      state = reducer(state, timerTicked({ duration: "PT1M" }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT0S"),
          percentage: 100,
          isRunning: true,
        },
      });
    });
  });

  describe("Timer stopped", () => {
    it("should stop countdown and enable form", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT15M"),
          percentage: 25,
          isRunning: true,
        },
      };

      state = reducer(state, timerStopped());

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT15M"),
          percentage: 25,
          isRunning: false,
        },
      });
    });

    it("should enable log button when form is valid", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT15M"),
          percentage: 25,
          isRunning: true,
        },
      };

      state = reducer(state, timerStopped());

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: false,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT15M"),
          percentage: 25,
          isRunning: false,
        },
      });
    });
  });

  describe("Interval elapsed", () => {
    it("should reset countdown and enable form", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT0S"),
          percentage: 100,
          isRunning: true,
        },
        currentInterval: Temporal.Duration.from("PT30M"),
      };

      state = reducer(state, intervalElapsed({ interval: "PT20M" }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT20M"),
          percentage: 0,
          isRunning: true,
        },
        currentInterval: Temporal.Duration.from("PT20M"),
      });
    });

    it("should enable log button when form is valid", () => {
      let state: State = {
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: true,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: true,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT0S"),
          percentage: 100,
          isRunning: true,
        },
        currentInterval: Temporal.Duration.from("PT30M"),
      };

      state = reducer(state, intervalElapsed({ interval: "PT20M" }));

      expect(state).toEqual<State>({
        ...initialState,
        form: {
          ...initialState.form,
          isDisabled: false,
          client: "Test client",
          project: "Test project",
          task: "Test task",
          isLogButtonDisabled: false,
        },
        countdown: {
          ...initialState.countdown,
          interval: Temporal.Duration.from("PT20M"),
          remaining: Temporal.Duration.from("PT20M"),
          percentage: 0,
          isRunning: true,
        },
        currentInterval: Temporal.Duration.from("PT20M"),
      });
    });
  });
});
