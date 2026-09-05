import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { Role } from '@dealflow360/contracts';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function generateRefreshToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashRefreshToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashRefreshToken(rawToken: string): string {
  return crypto
    .createHmac('sha256', env.JWT_REFRESH_SECRET)
    .update(rawToken)
    .digest('hex');
}

export const REFRESH_COOKIE_NAME = 'df360_refresh_token';

export function getRefreshCookieOptions() {
  const expires = new Date();
  expires.setDate(expires.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/v1/auth',
    expires,
  };
}
