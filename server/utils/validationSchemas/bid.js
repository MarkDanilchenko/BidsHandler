import { z } from "zod";

const createBidSchema = z.object({
  body: z.object({
    message: z.string(),
  }),
});

export { createBidSchema };
