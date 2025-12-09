import React from "react";

const InputField = ({ type, id, placeholder, value, onChange }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="input-label">
        {placeholder}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field"
      />
    </div>
  );
};

export default InputField;
