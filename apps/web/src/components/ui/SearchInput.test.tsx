// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { SearchInput } from './SearchInput.js';

describe('SearchInput Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders input with default placeholder', () => {
    render(<SearchInput placeholder="Search placeholder..." />);
    const input = screen.getByPlaceholderText('Search placeholder...');
    expect(input).toBeDefined();
  });

  it('updates input value immediately on change while debouncing onDebouncedChange', () => {
    const handleDebouncedChange = vi.fn();
    const handleValueChange = vi.fn();

    render(
      <SearchInput
        placeholder="Search acme..."
        debounceMs={300}
        onDebouncedChange={handleDebouncedChange}
        onValueChange={handleValueChange}
      />,
    );

    const input = screen.getByPlaceholderText('Search acme...') as HTMLInputElement;

    // Simulate typing "acme"
    fireEvent.change(input, { target: { value: 'acme' } });

    // Immediate typing check
    expect(input.value).toBe('acme');
    expect(handleValueChange).toHaveBeenCalledWith('acme');
    expect(handleDebouncedChange).not.toHaveBeenCalled();

    // Fast-forward timer by 290ms - still not triggered
    act(() => {
      vi.advanceTimersByTime(290);
    });
    expect(handleDebouncedChange).not.toHaveBeenCalled();

    // Fast-forward past 300ms threshold
    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(handleDebouncedChange).toHaveBeenCalledTimes(1);
    expect(handleDebouncedChange).toHaveBeenCalledWith('acme');
  });

  it('clears input immediately when clear button is clicked', () => {
    const handleDebouncedChange = vi.fn();

    render(
      <SearchInput
        value="initial search"
        onDebouncedChange={handleDebouncedChange}
        placeholder="Search initial..."
      />,
    );

    const clearButton = screen.getByLabelText('Clear search input');
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);

    const input = screen.getByPlaceholderText('Search initial...') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(handleDebouncedChange).toHaveBeenCalledWith('');
  });

  it('clears input when Escape key is pressed', () => {
    const handleDebouncedChange = vi.fn();

    render(
      <SearchInput
        value="test query"
        onDebouncedChange={handleDebouncedChange}
        placeholder="Search escape..."
      />,
    );

    const input = screen.getByPlaceholderText('Search escape...') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    expect(input.value).toBe('');
    expect(handleDebouncedChange).toHaveBeenCalledWith('');
  });

  it('renders keyboard shortcut hint when showKbdShortcut is true and query is empty', () => {
    render(<SearchInput placeholder="Search shortcut..." showKbdShortcut kbdShortcutText="⌘K" />);
    expect(screen.getByText('⌘K')).toBeDefined();
  });
});
