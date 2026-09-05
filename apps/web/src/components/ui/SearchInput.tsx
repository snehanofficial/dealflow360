import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'size'> {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
  showClear?: boolean;
  showKbdShortcut?: boolean;
  kbdShortcutText?: string;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onValueChange,
      onDebouncedChange,
      onSearch,
      debounceMs = 300,
      isLoading = false,
      showClear = true,
      showKbdShortcut = false,
      kbdShortcutText = '⌘K',
      containerClassName = '',
      size = 'md',
      placeholder = 'Search...',
      className = '',
      disabled = false,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    // Internal state for instant keystroke rendering (0ms input latency)
    const [query, setQuery] = useState<string>(value !== undefined ? value : defaultValue);
    const [isDebouncing, setIsDebouncing] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync internal query with external controlled value prop
    useEffect(() => {
      if (value !== undefined) {
        setQuery(value);
      }
    }, [value]);

    const triggerDebouncedChange = useCallback(
      (val: string) => {
        setIsDebouncing(false);
        if (onDebouncedChange) {
          onDebouncedChange(val);
        }
        if (onSearch) {
          onSearch(val);
        }
      },
      [onDebouncedChange, onSearch],
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setQuery(newVal);

      if (onChange) {
        onChange(e);
      }
      if (onValueChange) {
        onValueChange(newVal);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsDebouncing(true);
      timeoutRef.current = setTimeout(() => {
        triggerDebouncedChange(newVal);
      }, debounceMs);
    };

    const handleClear = () => {
      if (disabled) return;
      setQuery('');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (onValueChange) {
        onValueChange('');
      }
      triggerDebouncedChange('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && query) {
        e.preventDefault();
        handleClear();
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const sizePaddingStyles = {
      sm: showKbdShortcut && !query ? 'pl-8 pr-14' : 'pl-8 pr-7',
      md: showKbdShortcut && !query ? 'pl-9 pr-16' : 'pl-9 pr-8',
      lg: showKbdShortcut && !query ? 'pl-10 pr-20' : 'pl-10 pr-10',
    };

    const sizeTextStyles = {
      sm: 'py-1.5 text-xs',
      md: 'py-2 text-sm',
      lg: 'py-2.5 text-base',
    };

    const iconPositionStyles = {
      sm: 'left-2.5',
      md: 'left-3',
      lg: 'left-3.5',
    };

    const iconSizeClass = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

    const showSpinner = isLoading || isDebouncing;

    return (
      <div className={`relative w-full min-w-0 ${containerClassName}`}>
        <div className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-400 ${iconPositionStyles[size]}`}>
          {showSpinner ? (
            <Loader2 className={`${iconSizeClass} animate-spin text-[#714B67]`} />
          ) : (
            <Search className={iconSizeClass} />
          )}
        </div>

        <input
          ref={ref}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${sizeTextStyles[size]} ${sizePaddingStyles[size]} ${className}`}
          {...props}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1.5">
          {showClear && query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {showKbdShortcut && !query && (
            <div className="hidden sm:flex items-center pointer-events-none">
              <span className="text-slate-400 border border-slate-200 rounded px-1.5 bg-white text-xs font-mono select-none">
                {kbdShortcutText}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
