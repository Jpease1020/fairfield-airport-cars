import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { adminAuth, adminDb } from './firebase-admin';
export { db } from './firebase-client';
export { testFirebaseConnection } from './firebase-test';