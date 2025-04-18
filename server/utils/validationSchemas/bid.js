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

const getBidSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const processBidSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "resolved", "rejected"]),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export { createBidSchema, getBidsListSchema, getBidSchema, processBidSchema };
