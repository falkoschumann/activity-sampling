// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type SubmitEvent, useEffect, useState } from "react";

import {
  createGetSettingsQuery,
  type GetSettingsQueryResult,
} from "../../../../shared/domain/read_models/get_settings.query";
import { createChangeSettingsCommand } from "../../../../shared/domain/settings/change_settings.command";

export default function SettingsPage() {
  const [capacity, setCapacity] = useState(40);
  const [categories, setCategories] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const getSettingsAsync = async () => {
      const result = await window.activitySampling.routeMessage<GetSettingsQueryResult>(createGetSettingsQuery());
      setCapacity(Temporal.Duration.from(result.capacity).total("hours"));
      setCategories(result.categories);
      setFirstName(result.firstName ?? "");
      setLastName(result.lastName ?? "");
    };

    void getSettingsAsync();
  }, []);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await window.activitySampling.routeMessage(
      createChangeSettingsCommand({
        capacity: Temporal.Duration.from({ hours: capacity }),
        categories,
        firstName,
        lastName,
      }),
    );
  }

  return (
    <main className="container my-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="capacity" className="form-label">
            Capacity in hours per week
          </label>
          <input
            id="capacity"
            type="number"
            className="form-control"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="categories" className="form-label">
            Categories
          </label>
          <input
            id="categories"
            type="text"
            className="form-control"
            value={categories}
            onChange={(e) => setCategories(e.target.value.split(",").map((c) => c.trim()))}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>
    </main>
  );
}
