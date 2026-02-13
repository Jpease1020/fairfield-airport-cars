/**
 * Customer Service
 *
 * Handles CRUD operations for the `customers` Firestore collection.
 * Customers are separate from Firebase Auth users - they get linked
 * when they verify via SMS OTP.
 */

import { getAdminDb } from '@/lib/utils/firebase-admin';
import {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerImport,
  CustomerImportResult,
} from '@/types/customer';

const COLLECTION = 'customers';

/**
 * Normalize phone number to 10 digits (US format)
 * - Removes all non-digits
 * - Strips leading 1 if 11 digits
 * - Returns null if invalid (< 10 digits after normalization)
 */
export function normalizePhone(phone: string): string | null {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');

  // If 11 digits and starts with 1, strip leading 1
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1);
  }

  // Must be exactly 10 digits
  if (digits.length !== 10) {
    return null;
  }

  return digits;
}

/**
 * Format phone number for display: (203) 555-1234
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone; // Return original if can't format
}

/**
 * Get a customer by their normalized phone number
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return null;
  }

  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .where('phone', '==', normalizedPhone)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return docToCustomer(doc);
}

/**
 * Get a customer by Firestore document ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return docToCustomer(doc);
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CustomerCreate): Promise<string> {
  const db = getAdminDb();

  const now = new Date();
  const customerData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(COLLECTION).add(customerData);
  return docRef.id;
}

/**
 * Update an existing customer
 */
export async function updateCustomer(id: string, data: CustomerUpdate): Promise<void> {
  const db = getAdminDb();

  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

/**
 * Update customer stats after a booking
 */
export async function updateCustomerStats(
  phone: string,
  bookingDate: Date,
  fare: number
): Promise<void> {
  const customer = await getCustomerByPhone(phone);
  if (!customer) {
    return; // Customer not in our system yet
  }

  const db = getAdminDb();
  await db.collection(COLLECTION).doc(customer.id).update({
    bookingCount: (customer.bookingCount || 0) + 1,
    lastBookingDate: bookingDate,
    totalSpent: (customer.totalSpent || 0) + fare,
    updatedAt: new Date(),
  });
}

/**
 * Bulk import customers from Excel data
 */
export async function bulkImportCustomers(
  customers: CustomerImport[],
  importSource: string = 'excel-import'
): Promise<CustomerImportResult> {
  const db = getAdminDb();
  const result: CustomerImportResult = {
    total: customers.length,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < customers.length; i++) {
    const row = i + 1; // 1-indexed for user-friendly error messages
    const customer = customers[i];

    // Normalize phone
    const normalizedPhone = normalizePhone(customer.phone);
    if (!normalizedPhone) {
      result.skipped++;
      result.errors.push({
        row,
        phone: customer.phone,
        reason: 'Invalid phone number (must be 10 digits)',
      });
      continue;
    }

    // Check for duplicate
    const existing = await getCustomerByPhone(normalizedPhone);
    if (existing) {
      result.skipped++;
      result.errors.push({
        row,
        phone: customer.phone,
        reason: `Duplicate: customer already exists (ID: ${existing.id})`,
      });
      continue;
    }

    // Create customer document
    try {
      const now = new Date();
      const customerData: Omit<Customer, 'id'> = {
        phone: normalizedPhone,
        phoneFormatted: formatPhone(normalizedPhone),
        firstName: customer.firstName.trim(),
        lastName: customer.lastName?.trim(),
        email: customer.email?.trim().toLowerCase(),
        address: customer.address,
        notes: customer.notes?.trim(),
        bookingCount: 0,
        totalSpent: 0,
        createdAt: now,
        updatedAt: now,
        importedFrom: `${importSource}-${now.toISOString().split('T')[0]}`,
      };

      await db.collection(COLLECTION).add(customerData);
      result.imported++;
    } catch (error) {
      result.skipped++;
      result.errors.push({
        row,
        phone: customer.phone,
        reason: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return result;
}

/**
 * Get all customers (for admin list view)
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .orderBy('lastName')
    .orderBy('firstName')
    .get();

  return snapshot.docs.map(docToCustomer);
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  const db = getAdminDb();

  // Try phone search first
  const normalizedPhone = normalizePhone(query);
  if (normalizedPhone) {
    const phoneSnapshot = await db
      .collection(COLLECTION)
      .where('phone', '==', normalizedPhone)
      .get();

    if (!phoneSnapshot.empty) {
      return phoneSnapshot.docs.map(docToCustomer);
    }
  }

  // Firestore doesn't support full-text search, so we fetch all and filter
  // For production, consider Algolia or similar
  const allCustomers = await getAllCustomers();
  const lowerQuery = query.toLowerCase();

  return allCustomers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(lowerQuery) ||
      c.lastName?.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query.replace(/\D/g, ''))
  );
}

// Helper: Convert Firestore doc to Customer type
function docToCustomer(doc: FirebaseFirestore.DocumentSnapshot): Customer {
  const data = doc.data()!;
  return {
    id: doc.id,
    phone: data.phone,
    phoneFormatted: data.phoneFormatted,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address,
    notes: data.notes,
    userId: data.userId,
    verifiedAt: data.verifiedAt?.toDate?.() ?? data.verifiedAt,
    bookingCount: data.bookingCount ?? 0,
    lastBookingDate: data.lastBookingDate?.toDate?.() ?? data.lastBookingDate,
    totalSpent: data.totalSpent ?? 0,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
    importedFrom: data.importedFrom,
  } as Customer;
}
