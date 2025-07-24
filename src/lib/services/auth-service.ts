'use client';

import { auth, db } from '@/lib/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword
} from 'firebase/auth';

export interface UserRole {
  uid: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  createdAt: Date;
  lastLogin: Date;
}

// Legacy auth functions for backward compatibility
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export class AuthService {
  private static instance: AuthService;
  private currentUser: UserRole | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateAdminAccess(uid: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data() as UserRole;
      return userData?.role === 'admin';
    } catch (error) {
      console.error('Error validating admin access:', error);
      return false;
    }
  }

  async getUserRole(uid: string): Promise<UserRole | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.data() as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async isAdmin(uid: string): Promise<boolean> {
    if (!uid) return false;
    
    // Check if we already have the user cached
    if (this.currentUser?.uid === uid) {
      return this.currentUser.role === 'admin';
    }

    // Fetch from database
    const userRole = await this.getUserRole(uid);
    if (userRole) {
      this.currentUser = userRole;
      return userRole.role === 'admin';
    }

    return false;
  }

  async canEdit(uid: string): Promise<boolean> {
    const userRole = await this.getUserRole(uid);
    if (!userRole) return false;

    // Admins can edit everything
    if (userRole.role === 'admin') return true;

    // Editors can edit content but not settings
    if (userRole.role === 'editor') {
      const restrictedFields = ['pricing', 'business', 'settings'];
      return !restrictedFields.some(field => field.includes(field));
    }

    return false;
  }

  async logUserActivity(uid: string, action: string, details?: any): Promise<void> {
    try {
      // Log user activity for audit trail
      const activity = {
        uid,
        action,
        details,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      };
      
      // In a real app, you'd save this to Firestore
      console.log('User activity:', activity);
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }
}

export const authService = AuthService.getInstance();
