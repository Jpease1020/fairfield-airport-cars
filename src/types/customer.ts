/**
 * Customer type definitions for Fairfield Airport Cars
 *
 * Customers are stored in the `customers` Firestore collection.
 * They are separate from Firebase Auth users - a customer only gets
 * a linked `userId` when they verify via SMS OTP.
 */

export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  formatted?: string;  // Full address string for display
}

export interface Customer {
  id: string;                    // Firestore doc ID
  phone: string;                 // Normalized (digits only, e.g., "2035551234")
  phoneFormatted: string;        // Display format "(203) 555-1234"
  email?: string;
  firstName: string;
  lastName?: string;
  address?: CustomerAddress;
  notes?: string;                // Admin notes (from import or manual entry)

  // Auth linking (populated when customer verifies via SMS OTP)
  userId?: string;               // Firebase Auth UID
  verifiedAt?: Date;

  // Stats (updated on each booking)
  bookingCount: number;
  lastBookingDate?: Date;
  totalSpent: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  importedFrom?: string;         // e.g., "excel-import-2025-02-13"
}

/**
 * Input type for creating a new customer (without id and timestamps)
 */
export type CustomerCreate = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating a customer
 */
export type CustomerUpdate = Partial<Omit<Customer, 'id' | 'createdAt'>>;

/**
 * Input type for bulk import from Excel
 */
export interface CustomerImport {
  firstName: string;
  lastName?: string;
  phone: string;           // Raw phone from Excel (will be normalized)
  email?: string;
  address?: CustomerAddress;
  notes?: string;
}

/**
 * Result of bulk import operation
 */
export interface CustomerImportResult {
  total: number;
  imported: number;
  skipped: number;         // Duplicates or invalid
  errors: Array<{
    row: number;
    phone: string;
    reason: string;
  }>;
}
