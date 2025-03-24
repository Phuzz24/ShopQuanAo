import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

// TooltipProvider: Quản lý trạng thái tooltip cho toàn bộ ứng dụng
const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

// Tooltip: Component chính, quản lý trạng thái hiển thị
const Tooltip = ({ children, delayDuration = 300 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children({ isOpen, setIsOpen })}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.func.isRequired,
  delayDuration: PropTypes.number,
};

Tooltip.defaultProps = {
  delayDuration: 300,
};

// TooltipTrigger: Phần tử kích hoạt tooltip
const TooltipTrigger = ({ children }) => {
  return <>{children}</>;
};

TooltipTrigger.propTypes = {
  children: PropTypes.node.isRequired,
};

// TooltipContent: Nội dung của tooltip
const TooltipContent = ({ children, className, side = "top", align = "center" }) => {
  // Tính toán vị trí dựa trên side và align
  const positionStyles = {
    top: side === "top" ? "bottom-full mb-2" : side === "bottom" ? "top-full mt-2" : "",
    bottom: side === "bottom" ? "top-full mt-2" : "",
    left: side === "left" ? "right-full mr-2" : "",
    right: side === "right" ? "left-full ml-2" : "",
    transform:
      align === "center"
        ? "translateX(-50%)"
        : align === "start"
        ? "translateX(0)"
        : "translateX(-100%)",
  };

  return (
    <div
      className={`absolute z-50 rounded-md bg-gray-800 text-white text-sm px-3 py-1.5 shadow-lg transition-opacity duration-200 ${
        className || ""
      } ${positionStyles.top || positionStyles.bottom || positionStyles.left || positionStyles.right} ${
        positionStyles.transform
      }`}
      style={{ opacity: 1 }}
    >
      {children}
      {/* Mũi tên của tooltip */}
      <div
        className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
          side === "top" ? "bottom-[-4px] left-1/2 -translate-x-1/2" : ""
        } ${side === "bottom" ? "top-[-4px] left-1/2 -translate-x-1/2" : ""} ${
          side === "left" ? "right-[-4px] top-1/2 -translate-y-1/2" : ""
        } ${side === "right" ? "left-[-4px] top-1/2 -translate-y-1/2" : ""}`}
      />
    </div>
  );
};

TooltipContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  side: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  align: PropTypes.oneOf(["start", "center", "end"]),
};

TooltipContent.defaultProps = {
  className: "",
  side: "top",
  align: "center",
};

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };