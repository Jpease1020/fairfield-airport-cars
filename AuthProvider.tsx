'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';
import { authService, User, logout as authLogout } from '@/lib/services/auth-service';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isDriver: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      return await authService.getUserRole(uid);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Update user roles based on profile
  const updateUserRoles = (userProfile: User | null) => {
    if (!userProfile) {
      setIsAdmin(false);
      setIsCustomer(false);
      setIsDriver(false);
      return;
    }

    setIsAdmin(userProfile.role === 'admin');
    setIsCustomer(userProfile.role === 'customer');
    setIsDriver(userProfile.role === 'driver');
  };

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setUser(userProfile);
        updateUserRoles(userProfile);
      } else {
        setUser(null);
        updateUserRoles(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // This will trigger the onAuthStateChanged listener
      // which will fetch the user profile
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      setFirebaseUser(null);
      updateUserRoles(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      const userProfile = await fetchUserProfile(firebaseUser.uid);
      setUser(userProfile);
      updateUserRoles(userProfile);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isLoggedIn: !!user,
    isAdmin,
    isCustomer,
    isDriver,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 