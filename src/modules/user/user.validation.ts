import { z } from "zod";

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "BANNED"], {
      errorMap: () => ({ message: "Status must be ACTIVE or BANNED" }),
    }),
  }),
});

export const userValidation = { updateUserStatusSchema };
