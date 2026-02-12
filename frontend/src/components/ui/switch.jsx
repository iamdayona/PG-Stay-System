import React, { useState } from "react";

export const Switch = ({ defaultChecked = false }) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full 
        transition-colors duration-200 
        ${enabled ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white 
          transition-transform duration-200
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
};