// src/components/ui/dialog.jsx
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils"; // Giả sử bạn đã có hàm cn để quản lý className

// Dialog Context để quản lý trạng thái mở/đóng
const DialogContext = React.createContext();

const Dialog = ({ children, open, onOpenChange }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          {children}
        </div>
      )}
    </DialogContext.Provider>
  );
};

// DialogTrigger: Thành phần kích hoạt dialog (nếu cần)
const DialogTrigger = ({ asChild, children }) => {
  const { onOpenChange } = React.useContext(DialogContext);
  return asChild ? (
    React.cloneElement(children, { onClick: () => onOpenChange(true) })
  ) : (
    <button onClick={() => onOpenChange(true)}>{children}</button>
  );
};

// DialogContent: Nội dung chính của dialog
const DialogContent = ({ children, className }) => {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div
      className={cn(
        "relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6",
        className
      )}
    >
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <X className="h-5 w-5" />
      </button>
      {children}
    </div>
  );
};

// DialogHeader: Phần tiêu đề của dialog
const DialogHeader = ({ children, className }) => {
  return <div className={cn("mb-4", className)}>{children}</div>;
};

// DialogTitle: Tiêu đề của dialog
const DialogTitle = ({ children, className }) => {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-gray-900 dark:text-gray-100",
        className
      )}
    >
      {children}
    </h2>
  );
};

// DialogFooter: Phần chân của dialog (thường chứa các nút)
const DialogFooter = ({ children, className }) => {
  return (
    <div
      className={cn(
        "mt-6 flex justify-end gap-2",
        className
      )}
    >
      {children}
    </div>
  );
};

// Xuất các thành phần
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter };