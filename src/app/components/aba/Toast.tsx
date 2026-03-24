import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

interface ToastProps {
  id: string;
  message: string;
  variant: 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss: (id: string) => void;
}

interface ToastContextType {
  showToast: (message: string, variant: 'success' | 'warning' | 'error', duration?: number) => void;
}

let toastId = 0;

export function Toast({ id, message, variant, duration = 3000, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const variantStyles = {
    success: {
      bg: 'bg-aba-success-50 border-aba-success-main',
      icon: <CheckCircle2 className="w-5 h-5 text-aba-success-main flex-shrink-0" />,
      text: 'text-aba-success-main',
    },
    warning: {
      bg: 'bg-aba-warning-50 border-aba-warning-main',
      icon: <AlertTriangle className="w-5 h-5 text-aba-warning-main flex-shrink-0" />,
      text: 'text-aba-warning-main',
    },
    error: {
      bg: 'bg-aba-error-50 border-aba-error-main',
      icon: <XCircle className="w-5 h-5 text-aba-error-main flex-shrink-0" />,
      text: 'text-aba-error-main',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${styles.bg} shadow-lg animate-in slide-in-from-top-5 duration-300`}
    >
      {styles.icon}
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className={`p-0.5 rounded-lg hover:bg-black/5 transition-colors ${styles.text}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; variant: 'success' | 'warning' | 'error' }>>([]);

  useEffect(() => {
    (window as any).__showToast = (message: string, variant: 'success' | 'warning' | 'error', duration?: number) => {
      const id = `toast-${toastId++}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
    };

    return () => {
      delete (window as any).__showToast;
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 max-w-[390px] mx-auto pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  );
}

// Helper function to show toasts
export function showToast(message: string, variant: 'success' | 'warning' | 'error' = 'success', duration?: number) {
  if ((window as any).__showToast) {
    (window as any).__showToast(message, variant, duration);
  }
}
