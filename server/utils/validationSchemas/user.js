import { z } from "zod";

const updateUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .regex(/^[a-zA-Z0-9-_.]{2,16}$/gi)
      .optional(),
    firstName: z
      .string()
      .regex(/^[a-zA-Z-]{2,32}$/gi)
      .optional(),
    lastName: z
      .string()
      .regex(/^[a-zA-Z-]{2,32}$/gi)
      .optional(),
    gender: z.enum(["male", "female"]).optional(),
    isAdmin: z
      .string()
      .refine((value) => {
        return value === "true" || value === "false";
      })
      .transform((value) => {
        return value === "true";
      })
      .optional(),
  }),
  files: z
    .object({
      avatar: z.any(),
    })
    .optional(), // files are validated via server/services/multerConfig.js
});

const userRestoreSchema = z.object({
  body: z
    .object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().min(8),
    })
    .refine((data) => data.username || data.email, {
      message: "Username or email is required!",
    }),
});

export { updateUserSchema, userRestoreSchema };
