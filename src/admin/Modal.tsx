import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: string; // e.g., "max-w-md", "max-w-2xl"
  icon?: ReactNode; // Optional custom icon in header
  zIndex?: number; // Accept dynamic z-index
}

export default function Modal({
  title,
  children,
  onClose,
  width = "max-w-lg",
  icon,
  zIndex = 50,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <>
      {/* Bluish Blur Overlay */}
      <div
        className="fixed inset-0 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-300"
        style={{ zIndex }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto"
        style={{ zIndex }}
      >
        <div
          className={`${width} w-full bg-white rounded-2xl shadow-2xl border border-gray-200 
            animate-in fade-in slide-in-from-bottom-10 duration-300 ease-out
            max-h-screen overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {icon && <div className="p-2 bg-blue-100 rounded-xl">{icon}</div>}
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">{children}</div>
        </div>
      </div>
    </>
  );
}
