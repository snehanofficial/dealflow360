// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { KanbanBoard, KanbanColumn } from './KanbanBoard.js';

afterEach(() => {
  cleanup();
});

interface TestItem {
  id: string;
  name: string;
  stage: string;
}

describe('KanbanBoard Component', () => {
  const sampleColumns: KanbanColumn<TestItem>[] = [
    {
      id: 'col-1',
      title: 'Draft',
      items: [
        { id: 'item-1', name: 'Quote A', stage: 'col-1' },
        { id: 'item-2', name: 'Quote B', stage: 'col-1' },
      ],
      badge: 2,
    },
    {
      id: 'col-2',
      title: 'In Review',
      items: [],
      emptyText: 'No items under review',
    },
  ];

  it('renders all column headers and badges', () => {
    render(
      <KanbanBoard<TestItem>
        columns={sampleColumns}
        keyExtractor={(item) => item.id}
        renderCard={(item) => <div data-testid={`card-${item.id}`}>{item.name}</div>}
      />,
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders card items using renderCard prop', () => {
    render(
      <KanbanBoard<TestItem>
        columns={sampleColumns}
        keyExtractor={(item) => item.id}
        renderCard={(item) => <div data-testid={`card-${item.id}`}>{item.name}</div>}
      />,
    );

    expect(screen.getByTestId('card-item-1')).toHaveTextContent('Quote A');
    expect(screen.getByTestId('card-item-2')).toHaveTextContent('Quote B');
  });

  it('renders custom empty state when column has no items', () => {
    render(
      <KanbanBoard<TestItem>
        columns={sampleColumns}
        keyExtractor={(item) => item.id}
        renderCard={(item) => <div>{item.name}</div>}
      />,
    );

    expect(screen.getByText('No items under review')).toBeInTheDocument();
  });

  it('triggers onCardClick callback when card is clicked', () => {
    const handleCardClick = vi.fn();

    render(
      <KanbanBoard<TestItem>
        columns={sampleColumns}
        keyExtractor={(item) => item.id}
        onCardClick={handleCardClick}
        renderCard={(item) => <div data-testid={`card-${item.id}`}>{item.name}</div>}
      />,
    );

    fireEvent.click(screen.getByTestId('card-item-1'));
    expect(handleCardClick).toHaveBeenCalledTimes(1);
    expect(handleCardClick).toHaveBeenCalledWith(sampleColumns[0].items[0]);
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <KanbanBoard<TestItem>
        columns={sampleColumns}
        keyExtractor={(item) => item.id}
        isLoading={true}
        renderCard={(item) => <div>{item.name}</div>}
      />,
    );

    expect(screen.getByText('Loading board view...')).toBeInTheDocument();
  });

  it('renders error state and handles retry button', () => {
    const handleRetry = vi.fn();

    render(
      <KanbanBoard<TestItem>
        columns={sampleColumns}
        keyExtractor={(item) => item.id}
        error="Failed to load items"
        onRetry={handleRetry}
        renderCard={(item) => <div>{item.name}</div>}
      />,
    );

    expect(screen.getByText('Failed to load items')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry loading/i }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
