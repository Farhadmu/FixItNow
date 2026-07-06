import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { reviewValidation } from "./review.validation";
import { reviewController } from "./review.controller";

const router = express.Router();

router.post(
  "/",
  auth(),
  authorizeRoles("CUSTOMER"),
  validateRequest(reviewValidation.createReviewSchema),
  reviewController.createReview
);

export const reviewRoutes = router;
