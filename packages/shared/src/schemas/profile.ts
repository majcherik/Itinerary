import { z } from 'zod';

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .max(100, "Display name must be 100 characters or less")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// PREFERENCES SCHEMAS
// ============================================================================

export const updatePreferencesSchema = z.object({
  default_currency: z
    .enum([
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD',
      'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL',
      'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'MYR', 'PHP', 'CZK', 'AED', 'ILS'
    ])
    .optional(),
  notification_settings: z
    .object({
      email_trip_reminders: z.boolean().optional(),
      email_expense_updates: z.boolean().optional(),
      email_marketing: z.boolean().optional(),
    })
    .optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// ============================================================================
// ACCOUNT MANAGEMENT SCHEMAS
// ============================================================================

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const requestAccountDeletionSchema = z.object({
  reason: z
    .string()
    .max(1000, "Reason must be 1000 characters or less")
    .optional(),
  confirmEmail: z.string().email("Invalid email address"),
});

export type RequestAccountDeletionInput = z.infer<typeof requestAccountDeletionSchema>;

// Export data request (no input needed, returns JSON)
export const exportDataSchema = z.object({
  includeTrips: z.boolean().default(true),
  includeExpenses: z.boolean().default(true),
  includeProfile: z.boolean().default(true),
});

export type ExportDataInput = z.infer<typeof exportDataSchema>;
