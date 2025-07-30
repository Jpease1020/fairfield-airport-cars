'use client';

import { auth, db } from '@/lib/utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

export interface UserRole {
  uid: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'customer';
  permissions: string[];
  createdAt: Date;
  lastLogin: Date;
  name?: string;
  phone?: string;
  preferences?: {
    defaultPickupLocation?: string;
    defaultDropoffLocation?: string;
    preferredPaymentMethod?: string;
  };
}

export interface CustomerProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  createdAt: Date;
  lastLogin: Date;
  totalBookings: number;
  totalSpent: number;
  preferences: {
    defaultPickupLocation?: string;
    defaultDropoffLocation?: string;
    preferredPaymentMethod?: string;
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
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

// Customer-specific auth functions
export const createCustomerAccount = async (email: string, password: string, name: string, phone: string) => {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create customer profile in Firestore
    const customerProfile: CustomerProfile = {
      uid: user.uid,
      email: email,
      name: name,
      phone: phone,
      createdAt: new Date(),
      lastLogin: new Date(),
      totalBookings: 0,
      totalSpent: 0,
      preferences: {
        notifications: {
          email: true,
          sms: true
        }
      }
    };

    await setDoc(doc(db, 'customers', user.uid), customerProfile);

    // Also create user role document for consistency
    const userRole: UserRole = {
      uid: user.uid,
      email: email,
      role: 'customer',
      permissions: ['read', 'book'],
      createdAt: new Date(),
      lastLogin: new Date(),
      name: name,
      phone: phone
    };

    await setDoc(doc(db, 'users', user.uid), userRole);

    return user;
  } catch (error) {
    console.error('Error creating customer account:', error);
    throw error;
  }
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const getCustomerProfile = async (uid: string): Promise<CustomerProfile | null> => {
  try {
    const customerDoc = await getDoc(doc(db, 'customers', uid));
    if (!customerDoc.exists()) {
      return null;
    }
    return customerDoc.data() as CustomerProfile;
  } catch (error) {
    console.error('Error getting customer profile:', error);
    return null;
  }
};

export const updateCustomerProfile = async (uid: string, updates: Partial<CustomerProfile>) => {
  try {
    await setDoc(doc(db, 'customers', uid), updates, { merge: true });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
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
      if (!userDoc.exists()) {
        console.log('User document does not exist for uid:', uid);
        return null;
      }
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

    // If no user role document exists, we could create one or return false
    // For now, let's return false and log this for debugging
    console.log('No user role document found for uid:', uid);
    return false;
  }

  async isCustomer(uid: string): Promise<boolean> {
    if (!uid) return false;
    
    const userRole = await this.getUserRole(uid);
    return userRole?.role === 'customer';
  }

  async canEdit(uid: string): Promise<boolean> {
    if (!uid) return false;
    
    const userRole = await this.getUserRole(uid);
    return userRole?.permissions.includes('write') || userRole?.role === 'admin';
  }

  async logUserActivity(uid: string, action: string, details?: any): Promise<void> {
    try {
      const activityRef = doc(db, 'user_activity', `${uid}_${Date.now()}`);
      await setDoc(activityRef, {
        uid,
        action,
        details,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }
}

export const authService = AuthService.getInstance();
