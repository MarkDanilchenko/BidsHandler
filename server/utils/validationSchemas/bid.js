import { z } from "zod";

const createBidSchema = z.object({
  body: z.object({
    message: z.string(),
  }),
});

const getBidsListSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(0).default(0),
  }),
});

export { createBidSchema, getBidsListSchema };
