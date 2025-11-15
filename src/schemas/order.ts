import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string({ required_error: "Customer name is required" })
    .min(1, "Customer name is required")
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name must be less than 100 characters"),
  customerEmail: z
    .string({ required_error: "Customer email is required" })
    .email("Please enter a valid email address"),
  customerPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Remove whitespace before validation
        const cleaned = val.replace(/\s+/g, '');
        // E.164 format: optional + followed by 1-15 digits (first digit 1-9)
        return /^\+?[1-9]\d{1,14}$/.test(cleaned);
      },
      {
        message: "Please enter a valid phone number (e.g., +1234567890)",
      }
    ),
  serviceAccountType: z.enum(["EXISTING", "NEW"]).optional(),
  serviceAccountEmail: z
    .string()
    .email("Please enter a valid service account email")
    .optional(),
  serviceAccountPassword: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      {
        message: "Password must be at least 8 characters if provided",
      }
    ),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

