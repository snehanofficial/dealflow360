import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const typeStyles = {
    info: 'bg-sky-50 border-sky-200 text-sky-900 icon-sky',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 icon-emerald',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 icon-amber',
    danger: 'bg-red-50 border-red-200 text-red-900 icon-red',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-3.5 border rounded-lg text-sm ${typeStyles[type]} ${className}`}
      role="alert"
    >
      {icons[type]}
      <div className="space-y-0.5">
        {title && <h4 className="font-semibold text-sm leading-tight">{title}</h4>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
