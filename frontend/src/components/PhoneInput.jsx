import { useState } from "react";

export default function PhoneInput({ value, onChange, disabled = false }) {
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Determine display value
  const displayValue = value || "";

  // Masked shadow format
  const maskValue = "+91 XXXXXXXXXX";

  // Calculate character to show - if editing or partial input, show what user typed; otherwise show real number
  const showShadow = !displayValue || (isEditing && displayValue.length < 10);

  const handleChange = (e) => {
    let input = e.target.value;

    // Remove +91 prefix if user tries to type it
    if (input.startsWith("+91")) {
      input = input.substring(3).trim();
    }

    // Allow only numeric characters
    input = input.replace(/[^0-9]/g, "");

    // Limit to 10 digits
    if (input.length > 10) {
      input = input.slice(0, 10);
    }

    // Update state and call onChange
    onChange(input);

    // Real-time validation
    if (input.length > 0 && input.length < 10) {
      setError(`Phone number must be exactly 10 digits (${input.length}/10)`);
    } else {
      setError("");
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    setError("");
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Validate on blur
    if (displayValue.length > 0 && displayValue.length !== 10) {
      setError("Phone number must be exactly 10 digits");
    }
  };

  // Format phone for display with country code
  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    return `+91 ${phone}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* Shadow/Placeholder Layer - shows masked format when editing or no value */}
        {showShadow && (
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              fontSize: "0.95rem",
              fontWeight: "500",
              color: "rgba(200, 200, 220, 0.4)",
              pointerEvents: "none",
              paddingLeft: isEditing ? "12px" : "12px",
              paddingTop: "10px",
              paddingBottom: "10px",
              fontFamily: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`,
              zIndex: 0,
              maxWidth: "100%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "clip",
            }}
          >
            {maskValue}
          </div>
        )}

        {/* Real Input Field */}
        <input
          type="tel"
          className="clay-input"
          value={formatPhoneDisplay(displayValue)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={showShadow ? "" : ""}
          maxLength={14}
          style={{
            flex: 1,
            position: "relative",
            zIndex: 1,
            backgroundColor: "transparent",
            backgroundImage: showShadow
              ? `linear-gradient(90deg, transparent 0%, rgba(200, 200, 220, 0.2) 50%, transparent 100%)`
              : "none",
            ...(error && {
              borderColor: "#ef5350",
              boxShadow: "0 0 0 2px rgba(239, 83, 80, 0.1)",
            }),
          }}
        />
      </div>

      {error && (
        <span style={{ fontSize: "0.75rem", color: "#ef5350", fontWeight: "600" }}>
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}
