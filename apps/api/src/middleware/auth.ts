import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/token.js';
import { Role, ROLE_PERMISSIONS, Permission } from '@dealflow360/contracts';
import { db } from '@dealflow360/db';
import { AppError } from './errorHandler.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  permissions: Permission[];
  customerId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('AUTHENTICATION_REQUIRED', 'Missing or invalid Authorization header.', 401),
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    const role = payload.role as Role;
    const permissions = (ROLE_PERMISSIONS[role] ? [...ROLE_PERMISSIONS[role]] : []) as Permission[];

    let customerId: string | undefined = undefined;
    if (role === 'CUSTOMER') {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub);
        const dbUser = await db.user.findFirst({
          where: isUuid
            ? { OR: [{ id: payload.sub }, { email: payload.email }] }
            : { email: payload.email },
          select: { customerId: true },
        });
        if (dbUser?.customerId) {
          customerId = dbUser.customerId;
        }
      } catch {
        // Ignore DB query errors for synthetic test tokens
      }
    }

    req.user = {
      userId: payload.sub,
      email: payload.email,
      role,
      permissions,
      customerId,
    };

    next();
  } catch {
    next(new AppError('AUTHENTICATION_REQUIRED', 'Invalid or expired access token.', 401));
  }
}

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError('AUTHENTICATION_REQUIRED', 'User must be authenticated.', 401),
      );
    }

    if (!req.user.permissions.includes(permission)) {
      return next(
        new AppError(
          'FORBIDDEN',
          `Access denied. Permission '${permission}' is required.`,
          403,
        ),
      );
    }

    next();
  };
}

export function requireRole(roles: (Role | string)[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError('AUTHENTICATION_REQUIRED', 'User must be authenticated.', 401),
      );
    }

    const userRole = req.user.role as string;
    const isAllowed = roles.some((r) => {
      if (r === userRole) return true;
      if (
        (r === 'FINANCE' || r === 'FINANCE_OPERATIONS') &&
        (userRole === 'FINANCE' || userRole === 'FINANCE_OPERATIONS')
      ) {
        return true;
      }
      return false;
    });

    if (!isAllowed) {
      return next(
        new AppError('FORBIDDEN', 'Access denied for user role.', 403),
      );
    }

    next();
  };
}
