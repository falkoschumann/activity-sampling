// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ChangeEvent } from "react";

export default function CategoryComponent({
  categories,
  value = [...categories],
  onChange,
}: {
  categories: string[];
  value?: string[];
  onChange: (categories: string[]) => void;
}) {
  let title = "All categories";
  if (value.length === 1) {
    title = value[0].length === 0 ? "No category" : value[0];
  } else if (value.length > 1 && value.length < categories.length) {
    title = `${value.length} categories`;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>, category: string) {
    const filter = value;
    if (event.target.checked) {
      filter.push(category);
    } else {
      filter.splice(filter.indexOf(category), 1);
    }
    onChange(filter);
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
      >
        {title}
      </button>
      <div className="dropdown-menu p-4">
        <h6>Categories</h6>
        <div className="mb-3">
          {categories.map((category) => (
            <div key={`category-${category}`} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`category-${category}`}
                name={`category-${category}`}
                checked={value.includes(category)}
                onChange={(event) => handleChange(event, category)}
              />
              <label className="form-check-label text-nowrap" htmlFor={`category-${category}`}>
                {category.length === 0 ? <em>No category</em> : category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
