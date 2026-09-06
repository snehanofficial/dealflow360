import { userRepository, UserRepository } from '../repositories/userRepository.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../auth/token.js';
import {
  Role,
  ROLE_PERMISSIONS,
  SignupRequest,
  LoginRequest,
  UserDto,
  AuthResponseData,
  UserMeResponseData,
} from '@dealflow360/contracts';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { recordAuditEvent } from './auditService.js';

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async signup(
    input: SignupRequest,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ authData: AuthResponseData; rawRefreshToken: string }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError('DUPLICATE_RESOURCE', 'Email address is already registered.', 409);
    }

    const passwordHash = await hashPassword(input.password);

    // Public signup strictly defaults to SALES_REP (no arbitrary privileged role assignment allowed!)
    const user = await this.userRepo.createUser({
      email: input.email,
      name: input.name,
      passwordHash,
      role: 'SALES_REP',
    });

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const { rawToken: rawRefreshToken, tokenHash } = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

    await this.userRepo.createRefreshSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    const userDto = this.mapUserToDto(user);

    return {
      authData: { user: userDto, accessToken },
      rawRefreshToken,
    };
  }

  async login(
    input: LoginRequest,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ authData: AuthResponseData; rawRefreshToken: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('FORBIDDEN', 'User account is deactivated.', 403);
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const { rawToken: rawRefreshToken, tokenHash } = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

    await this.userRepo.createRefreshSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    const userDto = this.mapUserToDto(user);

    await recordAuditEvent({
      eventType: 'USER_LOGGED_IN',
      action: `User ${user.email} (${user.role}) logged in successfully`,
      entityType: 'User',
      entityId: user.id,
      actor: { id: user.id, name: user.name, role: user.role as Role },
      metadata: { ipAddress: meta?.ipAddress, userAgent: meta?.userAgent },
    });

    return {
      authData: { user: userDto, accessToken },
      rawRefreshToken,
    };
  }

  async refresh(
    rawRefreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<{ authData: AuthResponseData; rawRefreshToken: string }> {
    if (!rawRefreshToken) {
      throw new AppError('AUTHENTICATION_REQUIRED', 'Refresh token is missing.', 401);
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const session = await this.userRepo.findRefreshSessionByHash(tokenHash);

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new AppError('AUTHENTICATION_REQUIRED', 'Invalid or expired refresh token session.', 401);
    }

    const user = session.user;
    if (!user || !user.isActive) {
      throw new AppError('FORBIDDEN', 'User account is inactive or missing.', 403);
    }

    // Rotate refresh token: revoke current session & issue new one
    await this.userRepo.revokeRefreshSession(session.id);

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const { rawToken: newRawRefreshToken, tokenHash: newTokenHash } =
      generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

    await this.userRepo.createRefreshSession({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    const userDto = this.mapUserToDto(user);

    return {
      authData: { user: userDto, accessToken },
      rawRefreshToken: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const session = await this.userRepo.findRefreshSessionByHash(tokenHash);
    if (session) {
      await this.userRepo.revokeRefreshSession(session.id);
    }
  }

  async me(userId: string): Promise<UserMeResponseData> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('AUTHENTICATION_REQUIRED', 'User not found or inactive.', 401);
    }

    const role = user.role as Role;
    const permissions = ROLE_PERMISSIONS[role] ? [...ROLE_PERMISSIONS[role]] : [];

    return {
      user: this.mapUserToDto(user),
      role,
      permissions,
    };
  }

  private mapUserToDto(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    customerId?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      customerId: user.customerId || null,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
