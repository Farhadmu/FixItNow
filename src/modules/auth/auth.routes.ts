import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validate.middleware";
import { authValidation } from "./auth.validation";
import auth from "../../middlewares/auth.middleware";

const router = express.Router();

router.post(
  "/register",
  validateRequest(authValidation.registerSchema),
  authController.register
);

router.post(
  "/login",
  validateRequest(authValidation.loginSchema),
  authController.login
);

router.get("/me", auth(), authController.getMe);

export const authRoutes = router;
