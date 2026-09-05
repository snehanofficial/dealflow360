import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../token.js';
import { Role } from '@dealflow360/contracts';

describe('JWT Access & Refresh Token Utilities', () => {
  it('should generate and verify a valid access token', () => {
    const payload = {
      sub: 'user-uuid-123',
      email: 'test@dealflow360.com',
      role: 'SALES_REP' as Role,
    };

    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toEqual(payload.sub);
    expect(decoded.email).toEqual(payload.email);
    expect(decoded.role).toEqual(payload.role);
  });

  it('should throw an error for invalid access token', () => {
    expect(() => verifyAccessToken('invalid.token.structure')).toThrow();
  });

  it('should generate unique raw refresh tokens and deterministic hashes', () => {
    const { rawToken, tokenHash } = generateRefreshToken();
    expect(rawToken).toBeDefined();
    expect(tokenHash).toBeDefined();

    const expectedHash = hashRefreshToken(rawToken);
    expect(tokenHash).toEqual(expectedHash);

    const secondRun = generateRefreshToken();
    expect(secondRun.rawToken).not.toEqual(rawToken);
  });
});
