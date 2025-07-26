import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export { adminAuth, adminDb } from './firebase-admin';
export { db } from './firebase-client';
export { testFirebaseConnection } from './firebase-test';