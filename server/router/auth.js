import express from "express";
import { uploadAvatar } from "../services/multerConfig.js";
import validateRequest from "../middleware/requestValidation.js";
import validateJwt from "../middleware/jwtValidation.js";
import authController from "../controllers/auth.js";
import { signinSchema, signupSchema } from "../utils/validationSchemas/auth.js";

const router = express.Router();

router.post(
  "/signup",
  uploadAvatar.fields([{ name: "avatar", maxCount: 1 }]),
  validateRequest(signupSchema),
  authController.signup,
);
router.get("/signin", validateRequest(signinSchema), authController.signin);
router.post("/signout", validateJwt, authController.signout);
router.post("/refresh", authController.refresh); // Presence of access token is checked in controller;

export default router;
