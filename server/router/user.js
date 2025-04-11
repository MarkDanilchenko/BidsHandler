import express from "express";
import UserController from "../controllers/user.js";
import validateJwt from "../middleware/jwtValidation.js";
import validateRequest from "../middleware/requestValidation.js";
import { uploadAvatar } from "../services/multerConfig.js";
import { updateUserSchema, userRestoreSchema } from "../utils/validationSchemas/user.js";

const router = express.Router();

router
  .route("/profile")
  .get(validateJwt, UserController.retrieveProfile)
  .put(
    validateJwt,
    uploadAvatar.fields([{ name: "avatar", maxCount: 1 }]),
    validateRequest(updateUserSchema),
    UserController.updateProfile,
  )
  .delete(validateJwt, UserController.deleteProfile);

router.patch("/profile/restore", validateRequest(userRestoreSchema), UserController.restoreProfile);

export default router;
