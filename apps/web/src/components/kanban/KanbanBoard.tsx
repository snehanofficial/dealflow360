import React from 'react';
import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
  badge?: string | number;
  accentColor?: string; // e.g. 'border-purple-500', 'border-amber-500'
  badgeVariant?: 'default' | 'slate' | 'purple' | 'amber' | 'emerald' | 'rose' | 'blue';
  emptyText?: string;
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderCard: (item: T, columnId: string) => React.ReactNode;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCardClick?: (item: T) => void;
  cardCountFormatter?: (count: number) => string;
  className?: string;
}

export function KanbanBoard<T>({
  columns,
  renderCard,
  keyExtractor,
  isLoading = false,
  error = null,
  onRetry,
  onCardClick,
  cardCountFormatter = (count) => `${count}`,
  className = '',
}: KanbanBoardProps<T>) {
  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#714B67] mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading board view...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-rose-600" />
        <p className="text-sm font-medium text-rose-700">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
          </button>
        )}
      </div>
    );
  }

  const getBadgeStyle = (variant?: KanbanColumn<T>['badgeVariant']) => {
    switch (variant) {
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-200/80 text-slate-700 border-slate-300/80';
    }
  };

  return (
    <div
      className={`w-full overflow-x-auto pb-4 pt-1 flex gap-4 items-start scroll-smooth snap-x snap-mandatory focus:outline-none ${className}`}
      role="region"
      aria-label="Kanban board workflow stages"
      tabIndex={0}
    >
      {columns.map((col) => {
        const count = col.items.length;
        const formattedCount = cardCountFormatter(count);

        return (
          <div
            key={col.id}
            className={`min-w-[280px] max-w-[340px] sm:min-w-[300px] flex-1 shrink-0 bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col max-h-[calc(100vh-200px)] min-h-[420px] shadow-xs snap-start transition-all ${
              col.accentColor ? `border-t-4 ${col.accentColor}` : ''
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-200/70 shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 truncate">
                {col.title}
              </h2>

              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border shrink-0 ${getBadgeStyle(
                  col.badgeVariant,
                )}`}
              >
                {col.badge !== undefined ? col.badge : formattedCount}
              </span>
            </div>

            {/* Column Content */}
            <div
              className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar"
              role="list"
              aria-label={`${col.title} stage items`}
            >
              {count === 0 ? (
                <div className="h-44 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-4 text-center text-slate-400 my-auto">
                  <Inbox className="w-6 h-6 mb-1.5 text-slate-300 stroke-1" />
                  <p className="text-xs font-medium text-slate-500">
                    {col.emptyText || 'No items in stage'}
                  </p>
                </div>
              ) : (
                col.items.map((item) => {
                  const key = keyExtractor(item);
                  const isClickable = Boolean(onCardClick);

                  return (
                    <div
                      key={key}
                      role="listitem"
                      tabIndex={isClickable ? 0 : undefined}
                      onClick={() => onCardClick?.(item)}
                      onKeyDown={(e) => {
                        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onCardClick?.(item);
                        }
                      }}
                      className={`group transition-all duration-150 ${
                        isClickable
                          ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 rounded-lg'
                          : ''
                      }`}
                    >
                      {renderCard(item, col.id)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
