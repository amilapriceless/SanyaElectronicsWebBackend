// This file contains the validation logic
// for the Product schema using Zod.

import { z } from "zod";

const warrantySchema = z.object({
  period: z
    .number()
    .nonnegative("Warranty period cannot be negative"),

  unit: z
    .string()
    .min(1, "Warranty unit is required"),

  coverage: z
    .string()
    .min(1, "Warranty coverage is required"),
});

const productFields = {
  productCode: z
    .string()
    .min(2, "Product code must be at least 2 characters")
    .max(50, "Product code cannot exceed 50 characters")
    .trim(),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .trim(),

  brand: z
    .string()
    .min(2, "Brand must be at least 2 characters")
    .trim(),

  category: z
    .string()
    .min(2, "Category is required")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .trim(),

  powerConsumption: z
    .number()
    .nonnegative("Power consumption cannot be negative"),

  powerConsumptionUnit: z
    .string()
    .min(1, "Power consumption unit is required")
    .default("W"),

  technology: z
    .string()
    .min(2, "Technology is required")
    .trim(),

  prices: z.object({
    cash: z
      .number()
      .nonnegative("Cash price cannot be negative"),

    hire: z
      .number()
      .nonnegative("Hire price cannot be negative"),

    discount: z
      .number()
      .nonnegative("Discount price cannot be negative")
      .optional(),
  }),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),

  images: z
    .array(z.string().url("Invalid image URL"))
    .default([]),

  specifications: z
    .record(z.string(), z.any())
    .default({}),

  warranty: z
    .array(warrantySchema)
    .default([]),
};

export const createProductSchema = z.object(productFields);

export const updateProductSchema = z.object({
  productCode: productFields.productCode.optional(),

  name: productFields.name.optional(),

  brand: productFields.brand.optional(),

  category: productFields.category.optional(),

  description: productFields.description.optional(),

  powerConsumption: productFields.powerConsumption.optional(),

  powerConsumptionUnit:
    productFields.powerConsumptionUnit.optional(),

  technology: productFields.technology.optional(),

  prices: z
    .object({
      cash: z
        .number()
        .nonnegative("Cash price cannot be negative")
        .optional(),

      hire: z
        .number()
        .nonnegative("Hire price cannot be negative")
        .optional(),

      discount: z
        .number()
        .nonnegative("Discount price cannot be negative")
        .optional(),
    })
    .optional(),

  stock: productFields.stock.optional(),

  images: productFields.images.optional(),

  specifications: productFields.specifications.optional(),

  warranty: productFields.warranty.optional(),
});