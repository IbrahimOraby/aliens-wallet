import { z } from "zod";

export const productVariationFormSchema = z.object({
  name: z
    .string({ required_error: "Variation name is required" })
    .min(1, "Variation name is required")
    .min(2, "Variation name must be at least 2 characters")
    .max(100, "Variation name must be less than 100 characters"),
  price: z
    .number({ required_error: "Price is required" })
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price must be less than 1,000,000"),
  duration: z
    .number({ required_error: "Duration is required" })
    .min(1, "Duration must be at least 1 day")
    .max(3650, "Duration must be less than 10 years")
    .optional(),
  maxUsers: z
    .number({ required_error: "Max users is required" })
    .min(1, "Max users must be at least 1")
    .max(100, "Max users must be less than 100")
    .optional(),
  availableCount: z
    .number({ required_error: "Available count is required" })
    .min(0, "Available count must be 0 or greater")
    .max(999999, "Available count must be less than 1,000,000")
    .default(0),
  isUnlimited: z.boolean().default(true),
  regionId: z
    .string({ required_error: "Region is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please select a valid region"
    })
});

export const productFormSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  basePrice: z
    .number({ required_error: "Base price is required" })
    .min(0.01, "Base price must be greater than 0")
    .max(999999.99, "Base price must be less than 1,000,000"),
  isActive: z.boolean().default(true),
  kind: z
    .enum(["GIFTCARD", "SERVICE"], { required_error: "Product kind is required" }),
  code: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 3, {
      message: "Code must be at least 3 characters if provided"
    })
    .refine((val) => !val || val.length <= 20, {
      message: "Code must be less than 20 characters if provided"
    }),
  photoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  productTypeId: z
    .string({ required_error: "Product type is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please select a valid product type"
    }),
  categoryId: z
    .string({ required_error: "Category is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please select a valid category"
    }),
  variations: z
    .array(productVariationFormSchema)
    .max(10, "Maximum 10 variations allowed")
    .optional()
});

export const productSchema = productFormSchema.transform((data) => ({
  ...data,
  productTypeId: Number(data.productTypeId),
  categoryId: Number(data.categoryId),
  photoUrl: data.photoUrl === "" ? undefined : data.photoUrl,
  code: data.code === "" ? undefined : data.code,
  variations: data.variations?.map(v => ({
    ...v,
    regionId: Number(v.regionId)
  }))
}));

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type ProductVariationFormData = z.infer<typeof productVariationFormSchema>;
