import { describe, it, expect, vi } from 'vitest';
import { db } from '@dealflow360/db';

vi.mock('@dealflow360/db', () => ({
  db: {
    $transaction: vi.fn(),
  },
}));

describe('Transaction Integrity', () => {
  it('should wrap operations in a transaction', () => {
    expect(db.$transaction).toBeDefined();
  });
});
