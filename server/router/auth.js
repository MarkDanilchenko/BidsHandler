import express from "express";
import { uploadAvatar } from "../services/multerConfig.js";
import { validateRequest } from "../middleware/requestValidation.js";
import authController from "../controllers/auth.js";
import { signupSchema } from "../utils/validationSchemas/auth.js";

const router = express.Router();

router.post(
  "/signup",
  uploadAvatar.fields([{ name: "avatar", maxCount: 1 }]),
  validateRequest(signupSchema),
  authController.signup,
);
router.get("/signin", validateRequest());
router.post("/signout");
router.post("/refresh");

export default router;
