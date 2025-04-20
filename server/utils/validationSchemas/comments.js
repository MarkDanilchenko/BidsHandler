import { z } from "zod";

const getBidCommentsListSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(0).default(0),
  }),
});

const createBidCommentSchema = z.object({
  body: z.object({
    message: z.string(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const editBidCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    commentId: z.string().uuid(),
  }),
  body: z.object({
    message: z.string(),
  }),
});

const deleteBidCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    commentId: z.string().uuid(),
  }),
});

export { getBidCommentsListSchema, createBidCommentSchema, editBidCommentSchema, deleteBidCommentSchema };
