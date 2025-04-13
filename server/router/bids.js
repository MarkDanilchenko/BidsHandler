import express from "express";
import bidsController from "../controllers/bids.js";
import commentsController from "../controllers/comments.js";
import validateJwt from "../middleware/jwtValidation.js";
import validateRequest from "../middleware/requestValidation.js";
import { createBidSchema } from "../utils/validationSchemas/bid.js";

const router = express.Router();

router
  .route("/")
  .get(validateJwt, bidsController.getBids)
  .post(validateJwt, validateRequest(createBidSchema), bidsController.createBid);

router.route("/:id").get(bidsController.getOneBid).patch(bidsController.processBid);

router.route("/:id/comments").get(commentsController.getComments).post(commentsController.createComment);

router
  .route("/:id/comments/:commentId")
  .patch(commentsController.patchComment)
  .delete(commentsController.deleteComment);

export default router;
