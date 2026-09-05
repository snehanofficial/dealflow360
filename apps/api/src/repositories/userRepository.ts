import { db, User, RefreshSession, Role } from '@dealflow360/db';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: Role;
  }): Promise<User> {
    return db.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role ?? Role.SALES_REP,
      },
    });
  }

  async createRefreshSession(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshSession> {
    return db.refreshSession.create({
      data,
    });
  }

  async findRefreshSessionByHash(
    tokenHash: string,
  ): Promise<(RefreshSession & { user: User }) | null> {
    return db.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshSession(id: string): Promise<void> {
    await db.refreshSession.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await db.refreshSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}

export const userRepository = new UserRepository();
