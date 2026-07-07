// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

function FormSelectComponent({
  name,
  title,
  options,
  value,
  isRequired,
  isDisabled,
  onOptionChange,
}: {
  name: string;
  title: string;
  options: string[];
  value: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  onOptionChange: (text: string) => void;
}) {
  return (
    <div className="row mb-1">
      <label htmlFor={name} className="col-sm-2 col-form-label">
        {title}
      </label>
      <div className="col-sm-10">
        <select
          id={name}
          value={value}
          required={isRequired}
          disabled={isDisabled}
          className="form-select form-select-sm"
          onChange={(event) => onOptionChange(event.currentTarget.value)}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FormSelectComponent;
