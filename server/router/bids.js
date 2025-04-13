import express from "express";
import bidsController from "../controllers/bids.js";
import commentsController from "../controllers/comments.js";

const router = express.Router();

router.route("/bids").get(bidsController.getBids).post(bidsController.createBid);

router.route("/bids/:id").get(bidsController.getOneBid).patch(bidsController.processBid);

router.route("/bids/:id/comments").get(commentsController.getComments).post(commentsController.createComment);

router
  .route("/bids/:bidId/comments/:commentId")
  .patch(commentsController.patchComment)
  .delete(commentsController.deleteComment);

export default router;
