import { AlertCircle, CheckCircle, X, Info } from "lucide-react";

interface Props {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Alert({ type = "error", title, message, closable = true, onClose, action }: Props) {
  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getColors()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}

          <p className="text-sm">{message}</p>

          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium rounded-md px-3 py-2 transition-colors
                ${
                  type === "error"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : type === "success"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : type === "warning"
                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {action.label}
            </button>
          )}
        </div>

        {closable && onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
