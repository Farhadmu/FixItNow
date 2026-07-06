import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string({ required_error: "bookingId is required" }),
    rating: z.number({ required_error: "rating is required" }).int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = { createReviewSchema };
