import { z } from "zod";

export const addItemToCartSchema = z.object({
  variationId: z
    .number({ required_error: "Variation ID is required" })
    .int("Variation ID must be an integer")
    .positive("Variation ID must be positive"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity must be less than 999"),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity must be less than 999"),
});

export type AddItemToCartFormData = z.infer<typeof addItemToCartSchema>;
export type UpdateCartItemQuantityFormData = z.infer<typeof updateCartItemQuantitySchema>;

