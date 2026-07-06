import { z } from "zod";

const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string({ required_error: "serviceId is required" }),
    scheduledAt: z.string({ required_error: "scheduledAt is required" }).refine(
      (val) => !isNaN(Date.parse(val)),
      "scheduledAt must be a valid date string"
    ),
    address: z.string().optional(),
  }),
});

export const bookingValidation = { createBookingSchema };
