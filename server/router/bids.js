import express from "express";
import bidsController from "../controllers/bids.js";
import commentsController from "../controllers/comments.js";
import validateJwt from "../middleware/jwtValidation.js";
import validateRequest from "../middleware/requestValidation.js";
import { createBidSchema, getBidSchema, getBidsListSchema, processBidSchema } from "../utils/validationSchemas/bid.js";
import {
  createBidCommentSchema,
  deleteBidCommentSchema,
  editBidCommentSchema,
  getBidCommentsListSchema,
} from "../utils/validationSchemas/comments.js";

const router = express.Router();

router
  .route("/")
  .get(validateJwt, validateRequest(getBidsListSchema), bidsController.getBids)
  .post(validateJwt, validateRequest(createBidSchema), bidsController.createBid);

router
  .route("/:id")
  .get(validateJwt, validateRequest(getBidSchema), bidsController.getOneBid)
  .patch(validateJwt, validateRequest(processBidSchema), bidsController.processBid);

router
  .route("/:id/comments")
  .get(validateJwt, validateRequest(getBidCommentsListSchema), commentsController.getComments)
  .post(validateJwt, validateRequest(createBidCommentSchema), commentsController.createComment);

router
  .route("/:id/comments/:commentId")
  .patch(validateJwt, validateRequest(editBidCommentSchema), commentsController.editComment)
  .delete(validateJwt, validateRequest(deleteBidCommentSchema), commentsController.deleteComment);

export default router;
