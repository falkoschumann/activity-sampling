// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { SettingsDto } from "../../../src/shared/infrastructure/settings";

describe("Settings", () => {
  describe("Validate", () => {
    it("should throw a type error when DTO is not valid", () => {
      const dto = {
        dataDir: false,
      };

      expect(() => SettingsDto.fromJson(dto)).toThrow(TypeError);
    });
  });
});
