// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ChangeEvent } from "react";

function CategoryComponent({
  categories,
  // WORKAROUND: set categories and value same, when value is not provided
  //   categories value must not be [] to get this working
  value,
  onChange,
}: {
  categories: string[];
  value: string[];
  onChange: (categories: string[]) => void;
}) {
  let title = "All categories";
  if (value.length === 1) {
    title = value[0]!.length === 0 ? "No category" : value[0]!;
  } else if (value.length > 1 && value.length < categories.length) {
    title = `${value.length} categories`;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>, category: string) {
    const newValue = [...value];
    if (event.target.checked) {
      newValue.push(category);
    } else {
      newValue.splice(newValue.indexOf(category), 1);
    }
    onChange(newValue);
  }

  return (
    <>
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
      >
        {title}
      </button>
      <div className="dropdown-menu">
        <h6 className="dropdown-item">Categories</h6>
        {categories.map((category) => (
          <div key={`category-${category}`} className="dropdown-item">
            <div className="form-check">
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
          </div>
        ))}
      </div>
    </>
  );
}

export default CategoryComponent;
