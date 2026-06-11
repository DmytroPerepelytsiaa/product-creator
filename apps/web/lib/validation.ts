import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  // The form registers price with `valueAsNumber`, so an empty field is NaN.
  price: z
    .number()
    .refine((value) => !Number.isNaN(value), "Price is required")
    .min(0, "Price cannot be negative")
    .max(99_999_999.99, "Price is too large")
    .refine(
      (value) => Number.isInteger(Math.round(value * 100)),
      "Price supports at most 2 decimal places",
    ),
});

export type CreateProductValues = z.infer<typeof createProductSchema>;
