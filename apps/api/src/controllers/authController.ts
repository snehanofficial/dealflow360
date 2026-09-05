import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import {
  SignupRequestSchema,
  LoginRequestSchema,
} from '@dealflow360/contracts';
import { getRefreshCookieOptions, REFRESH_COOKIE_NAME } from '../auth/token.js';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = SignupRequestSchema.parse(req.body);
    const meta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    const { authData, rawRefreshToken } = await authService.signup(validated, meta);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, getRefreshCookieOptions());

    res.status(201).json({
      success: true,
      data: authData,
      message: 'Account created successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = LoginRequestSchema.parse(req.body);
    const meta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    const { authData, rawRefreshToken } = await authService.login(validated, meta);

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, getRefreshCookieOptions());

    res.json({
      success: true,
      data: authData,
      message: 'Login successful.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    const meta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };

    const { authData, rawRefreshToken: newRawRefreshToken } = await authService.refresh(
      rawRefreshToken,
      meta,
    );

    res.cookie(REFRESH_COOKIE_NAME, newRawRefreshToken, getRefreshCookieOptions());

    res.json({
      success: true,
      data: authData,
      message: 'Session refreshed successfully.',
      meta: null,
    });
  } catch (error) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    await authService.logout(rawRefreshToken);

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });

    res.json({
      success: true,
      data: { success: true },
      message: 'Logged out successfully.',
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'AUTHENTICATION_REQUIRED', message: 'User unauthenticated.', details: {} },
      });
      return;
    }

    const userData = await authService.me(req.user.userId);

    res.json({
      success: true,
      data: userData,
      message: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
}
