import { z } from "zod";

const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string({ required_error: "bookingId is required" }),
  }),
});

const confirmPaymentSchema = z.object({
  body: z.object({
    sessionId: z.string({ required_error: "sessionId is required" }),
  }),
});

export const paymentValidation = { createPaymentSchema, confirmPaymentSchema };
