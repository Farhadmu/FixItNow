import { z } from "zod";

const createServiceSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }).min(2),
    description: z.string().optional(),
    price: z.number({ required_error: "Price is required" }).positive("Price must be positive"),
    categoryId: z.string({ required_error: "categoryId is required" }),
    location: z.string().optional(),
  }),
});

const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().optional(),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const serviceValidation = { createServiceSchema, updateServiceSchema };
