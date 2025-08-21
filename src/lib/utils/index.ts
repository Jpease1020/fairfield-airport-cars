import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export { getAdminAuth, getAdminDb, adminServices } from './firebase-admin';
export { db } from './firebase';
export { testFirebaseConnection } from './firebase-test';