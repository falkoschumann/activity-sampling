// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export default function CategoryComponent({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value?: string;
  onChange: (category?: string) => void;
}) {
  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Select category">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {value ?? "All categories"}
      </button>
      <ul className="dropdown-menu">
        <li>
          <h6 className="dropdown-header">Category</h6>
        </li>
        <li>
          <button className="dropdown-item" onClick={() => onChange()}>
            All categories
          </button>
        </li>
        {categories.map((s) => (
          <li key={s}>
            <button className="dropdown-item" onClick={() => onChange(s)}>
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
