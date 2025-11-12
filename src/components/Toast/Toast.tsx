// src/components/Toast.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

// ======================
// Types
// ======================
type ToastType = "success" | "error";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // 0 = no auto-dismiss
}

interface ToastContextProps {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

// ======================
// Context
// ======================
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

// ======================
// Toast Provider
// ======================
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ToastStyles />
    </ToastContext.Provider>
  );
};

// ======================
// Toast Container
// ======================
const ToastContainer: React.FC<{
  toasts: Toast[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 space-y-3">
    {toasts.map((toast) => (
      <ToastItem
        key={toast.id}
        toast={toast}
        onClose={() => removeToast(toast.id)}
      />
    ))}
  </div>
);

// ======================
// Single Toast Item
// ======================
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const isSuccess = toast.type === "success";

  useEffect(() => {
    if (toast.duration === 0) return;
    const timer = setTimeout(onClose, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div className="max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-slide-in-right">
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0">
          {isSuccess ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 inline-flex text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {toast.duration !== 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className={`h-full ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
            style={{
              animation: `shrink ${toast.duration || 5000}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// ======================
// Global Toast Helpers
// ======================
let toastContext: ToastContextProps | null = null;
export const initToastGlobals = (context: ToastContextProps) => {
  toastContext = context;
};

export const showSuccess = (
  title: string,
  message?: string,
  durationMs = 5000
) => {
  toastContext?.addToast({
    type: "success",
    title,
    message,
    duration: durationMs,
  });
};

export const showError = (
  title: string,
  message?: string,
  durationMs = 7000
) => {
  toastContext?.addToast({
    type: "error",
    title,
    message,
    duration: durationMs,
  });
};

// ======================
// Global Styles / Animations
// ======================
const ToastStyles = () => (
  <style>
    {`
      @keyframes slide-in-right {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.4s ease-out;
      }
    `}
  </style>
);
