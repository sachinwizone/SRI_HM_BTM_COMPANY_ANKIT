import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from './db';
import { users, userSessions, type User, type UserSession } from '@shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate session token
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create user
  static async createUser(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'EMPLOYEE' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'OPERATIONS';
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'EMPLOYEE',
    }).returning();

    return user;
  }

  // Login user
  static async loginUser(username: string, password: string): Promise<{ user: User; sessionToken: string } | null> {
    // Find user by username
    const [user] = await db.select().from(users).where(
      and(
        eq(users.username, username),
        eq(users.isActive, true)
      )
    );

    if (!user) return null;

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) return null;

    // Generate session token
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    // Create session
    await db.insert(userSessions).values({
      userId: user.id,
      sessionToken,
      expiresAt,
    });

    // Update last login
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return { user, sessionToken };
  }

  // Verify session
  static async verifySession(sessionToken: string): Promise<User | null> {
    const [session] = await db.select({
      user: users,
      session: userSessions
    })
    .from(userSessions)
    .innerJoin(users, eq(userSessions.userId, users.id))
    .where(
      and(
        eq(userSessions.sessionToken, sessionToken),
        gt(userSessions.expiresAt, new Date()),
        eq(users.isActive, true)
      )
    );

    return session ? session.user : null;
  }

  // Logout user
  static async logoutUser(sessionToken: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
  }

  // Clean expired sessions
  static async cleanExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(
      lt(userSessions.expiresAt, new Date())
    );
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.id, userId),
        eq(users.isActive, true)
      )
    );
    return user || null;
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }

    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || null;
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<void> {
    await db.update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Remove all sessions for this user
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  // User Permissions Management
  static async setUserPermissions(userId: string, permissions: Array<{module: string, action: string, granted?: boolean}>): Promise<void> {
    try {
      // First, delete existing permissions for this user
      // When database is ready, uncomment this:
      // await db.delete(userPermissions).where(eq(userPermissions.userId, userId));

      // Insert new permissions
      if (permissions.length > 0) {
        const permissionData = permissions.map(perm => ({
          userId,
          module: perm.module,
          action: perm.action,
          granted: perm.granted !== false
        }));
        
        // When database is ready, uncomment this:
        // await db.insert(userPermissions).values(permissionData);
        console.log('Permissions would be saved:', permissionData);
      }
    } catch (error) {
      console.error('Error setting user permissions:', error);
      throw error;
    }
  }

  static async getUserPermissions(userId: string): Promise<Array<{module: string, action: string, granted: boolean}>> {
    try {
      // When database is ready, uncomment this:
      // const permissions = await db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
      // return permissions;
      
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }

  static async hasPermission(userId: string, module: string, action: string): Promise<boolean> {
    try {
      // When database is ready, uncomment this:
      // const [permission] = await db.select().from(userPermissions)
      //   .where(and(
      //     eq(userPermissions.userId, userId),
      //     eq(userPermissions.module, module),
      //     eq(userPermissions.action, action),
      //     eq(userPermissions.granted, true)
      //   ));
      // return !!permission;
      
      // For now, return true for testing
      return true;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }
}

// Middleware to check authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                      req.cookies?.sessionToken;



  if (!sessionToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  AuthService.verifySession(sessionToken)
    .then(user => {

      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      (req as any).user = user;
      next();
    })
    .catch(error => {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication error' });
    });
}

// Middleware to check specific role (includes auth check)
export function requireRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                        req.cookies?.sessionToken;



    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = await AuthService.verifySession(sessionToken);

      
      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  };
}

// Middleware to check admin role
export const requireAdmin = requireRole(['ADMIN']);

// Middleware to check manager role (admin, manager, or sales manager)
export const requireManager = requireRole(['ADMIN', 'MANAGER', 'SALES_MANAGER']);