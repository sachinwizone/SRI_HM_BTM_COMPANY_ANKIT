import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from './db';
import { users, userSessions, userPermissions, type User, type UserSession } from '@shared/schema';
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
    employeeCode?: string;
    mobileNumber?: string;
    designation?: string;
    department?: string;
    workLocation?: string;
    role?: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'EMPLOYEE' | 'SALES_MANAGER' | 'SALES_EXECUTIVE' | 'OPERATIONS';
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Clean up empty strings to null for unique fields
    const cleanedData = {
      ...userData,
      employeeCode: userData.employeeCode?.trim() || null,
      mobileNumber: userData.mobileNumber?.trim() || null,
      designation: userData.designation?.trim() || null,
      department: userData.department?.trim() || null,
      workLocation: userData.workLocation?.trim() || null,
    };
    
    const [user] = await db.insert(users).values({
      ...cleanedData,
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
      // First, delete all existing permissions for this user
      await db.delete(userPermissions).where(eq(userPermissions.userId, userId));
      
      // Then insert the new permissions
      if (permissions.length > 0) {
        const permissionData = permissions.map(perm => ({
          userId,
          module: perm.module,
          action: perm.action,
          granted: perm.granted !== false
        }));
        
        await db.insert(userPermissions).values(permissionData);
        console.log('Permissions saved to database for user:', userId, permissionData.length, 'permissions');
      } else {
        console.log('All permissions cleared for user:', userId);
      }
    } catch (error) {
      console.error('Error setting user permissions:', error);
      throw error;
    }
  }

  // Method to clear user permissions
  static async clearUserPermissions(userId: string): Promise<void> {
    try {
      await db.delete(userPermissions).where(eq(userPermissions.userId, userId));
      console.log('Cleared all permissions for user:', userId);
    } catch (error) {
      console.error('Error clearing user permissions:', error);
      throw error;
    }
  }

  static async getUserPermissions(userId: string): Promise<Array<{module: string, action: string, granted: boolean}>> {
    try {
      // Fetch permissions from database
      const dbPermissions = await db.select({
        module: userPermissions.module,
        action: userPermissions.action,
        granted: userPermissions.granted,
      })
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId));
      
      if (dbPermissions.length > 0) {
        return dbPermissions;
      }
      
      // Fallback to role-based permissions for admin users or users without explicit permissions
      const user = await this.getUserById(userId);
      if (!user) return [];
      
      // For admin users, return all permissions
      if (user.role === 'ADMIN') {
        const modules = [
          'DASHBOARD', 'CLIENT_MANAGEMENT', 'ORDER_WORKFLOW', 'SALES', 'PURCHASE_ORDERS',
          'TASK_MANAGEMENT', 'FOLLOW_UP_HUB', 'LEAD_FOLLOW_UP', 'CREDIT_PAYMENTS',
          'CREDIT_AGREEMENTS', 'EWAY_BILLS', 'SALES_RATES', 'TEAM_PERFORMANCE',
          'TA_REPORTS', 'MASTER_DATA', 'USER_MANAGEMENT', 'PRICING', 'SALES_OPERATIONS',
          'CLIENT_TRACKING', 'TOUR_ADVANCE'
        ];
        const actions = ['VIEW', 'ADD', 'EDIT', 'DELETE'];
        const permissions: Array<{module: string, action: string, granted: boolean}> = [];
        
        modules.forEach(module => {
          actions.forEach(action => {
            permissions.push({ module, action, granted: true });
          });
        });
        
        return permissions;
      }
      
      // For non-admin users with no stored permissions, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }

  static async hasPermission(userId: string, module: string, action: string): Promise<boolean> {
    try {
      const [permission] = await db.select().from(userPermissions)
        .where(and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.module, module),
          eq(userPermissions.action, action),
          eq(userPermissions.granted, true)
        ));
      
      return !!permission;
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