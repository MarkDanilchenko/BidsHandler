import express from "express";
import UserController from "../controllers/user.js";
import validateJwt from "../middleware/jwtValidation.js";
import validateRequest from "../middleware/requestValidation.js";

const router = express.Router();

router
  .route("/profile")
  .get(validateJwt, UserController.retrieveProfile)
  .put(validateJwt, UserController.updateProfile)
  .delete(validateJwt, UserController.deleteProfile);
router.patch("/profile/restore", UserController.restoreProfile);

export default router;
