import { z } from "zod";

const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    experience: z.number().int().min(0).optional(),
    location: z.string().optional(),
  }),
});

const updateAvailabilitySchema = z.object({
  body: z.object({
    slots: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          startTime: z.string().min(1),
          endTime: z.string().min(1),
          isAvailable: z.boolean().optional(),
        })
      )
      .min(1, "At least one availability slot is required"),
  }),
});

const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"], {
      errorMap: () => ({ message: "Invalid status transition" }),
    }),
  }),
});

export const technicianValidation = {
  updateProfileSchema,
  updateAvailabilitySchema,
  updateBookingStatusSchema,
};
