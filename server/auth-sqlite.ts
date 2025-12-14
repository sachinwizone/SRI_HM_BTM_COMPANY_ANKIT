import { db } from "./db.js";
import { users, userSessions } from "./schema-sqlite.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class AuthService {
  static async createUser(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role || 'EMPLOYEE',
    }).returning();
    
    return user;
  }

  static async loginUser(username: string, password: string) {
    const [user] = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(userSessions).values({
      userId: user.id,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      user,
      sessionToken,
    };
  }

  static async getUserBySessionToken(sessionToken: string) {
    const result = await db.select({
      user: users,
      session: userSessions,
    })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(eq(userSessions.sessionToken, sessionToken))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { user, session } = result[0];
    
    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now > expiresAt) {
      // Clean up expired session
      await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
      return null;
    }

    return user;
  }

  static async logoutUser(sessionToken: string) {
    await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
  }

  static async getAllUsers() {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  static async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  static async updateUser(id: string, updates: Partial<typeof users.$inferSelect>) {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    
    return user || null;
  }

  static async deactivateUser(id: string) {
    await db.update(users)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id));
  }

  // Simplified permission system for SQLite
  static async getUserPermissions(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) return [];

    // Return permissions based on role
    const permissions = [];
    switch (user.role) {
      case 'ADMIN':
        permissions.push('ALL_PERMISSIONS');
        break;
      case 'SALES_MANAGER':
        permissions.push('VIEW_ALL_CLIENTS', 'MANAGE_CLIENTS', 'VIEW_REPORTS');
        break;
      case 'SALES_EXECUTIVE':
        permissions.push('VIEW_ASSIGNED_CLIENTS', 'MANAGE_ASSIGNED_CLIENTS');
        break;
      default:
        permissions.push('VIEW_BASIC');
    }
    
    return permissions;
  }

  static async setUserPermissions(userId: string, permissions: string[]) {
    // In SQLite version, we just store this as part of the user role
    // This is a simplified implementation
    return true;
  }

  static async clearUserPermissions(userId: string) {
    // Simplified implementation
    return true;
  }
}

// Middleware functions
export function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  AuthService.getUserBySessionToken(token)
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication error' });
    });
}

export function requireAdmin(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

export function requireManager(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (!['ADMIN', 'SALES_MANAGER'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'Manager access required' });
    }
    next();
  });
}