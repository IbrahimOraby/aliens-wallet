import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters"),
    // .regex(/^[a-zA-Z0-9\s\-_]+$/, "Category name can only contain letters, numbers, spaces, hyphens, and underscores"),
  parentId: z
    .string()
    .optional()
    .refine((val) => val === "" || val === undefined || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Please select a valid parent category"
    })
});

export const categorySchema = categoryFormSchema.transform((data) => ({
  ...data,
  parentId: data.parentId === "" || data.parentId === undefined ? null : Number(data.parentId)
}));

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
