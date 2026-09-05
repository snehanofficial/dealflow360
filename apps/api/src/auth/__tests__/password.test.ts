import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../password.js';

describe('Password Hashing & Verification (Argon2id)', () => {
  it('should hash a password and verify successfully', async () => {
    const plain = 'Password123!';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plain);
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await verifyPassword(hash, plain);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const plain = 'Password123!';
    const wrong = 'WrongPassword456!';
    const hash = await hashPassword(plain);

    const isValid = await verifyPassword(hash, wrong);
    expect(isValid).toBe(false);
  });

  it('should handle malformed hashes gracefully', async () => {
    const isValid = await verifyPassword('invalid_hash_string', 'Password123!');
    expect(isValid).toBe(false);
  });
});
