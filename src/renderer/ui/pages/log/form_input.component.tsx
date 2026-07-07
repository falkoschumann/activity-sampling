// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

function FormInputComponent({
  name,
  title,
  value,
  isRequired,
  isDisabled,
  onTextChange,
}: {
  name: string;
  title: string;
  value: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  onTextChange: (text: string) => void;
}) {
  return (
    <div className="row mb-1">
      <label htmlFor={name} className="col-sm-2 col-form-label">
        {title}
      </label>
      <div className="col-sm-10">
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          required={isRequired}
          disabled={isDisabled}
          className="form-control form-control-sm"
          onChange={(event) => onTextChange?.(event.currentTarget.value)}
        />
      </div>
    </div>
  );
}

export default FormInputComponent;
