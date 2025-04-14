import { z } from "zod";

const createBidSchema = z.object({
  body: z.object({
    message: z.string(),
  }),
});

const getBidsListSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .refine((value) => parseInt(value) > 0)
      .default("10"),
    offset: z
      .string()
      .refine((value) => parseInt(value) >= 0)
      .default("0"),
  }),
});

export { createBidSchema, getBidsListSchema };
