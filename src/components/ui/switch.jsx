import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Switch = ({ checked, onCheckedChange, className, disabled, ...props }) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange(newChecked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin ${
        isChecked ? "bg-admin" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      {...props}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
          isChecked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

Switch.defaultProps = {
  checked: false,
  className: "",
  disabled: false,
};

export { Switch };