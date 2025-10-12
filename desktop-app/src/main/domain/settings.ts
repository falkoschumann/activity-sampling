// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class Settings {
  static create({ dataDir }: { dataDir: string }): Settings {
    return new Settings(dataDir);
  }

  static createDefault(): Settings {
    return new Settings("data");
  }

  dataDir: string;

  private constructor(dataDir: string) {
    this.dataDir = dataDir;
  }
}
