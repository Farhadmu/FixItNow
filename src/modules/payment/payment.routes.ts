import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { paymentValidation } from "./payment.validation";
import { paymentController } from "./payment.controller";

const router = express.Router();

router.post(
  "/create",
  auth(),
  authorizeRoles("CUSTOMER"),
  validateRequest(paymentValidation.createPaymentSchema),
  paymentController.createPayment
);

router.post(
  "/confirm",
  auth(),
  authorizeRoles("CUSTOMER"),
  validateRequest(paymentValidation.confirmPaymentSchema),
  paymentController.confirmPayment
);

router.get("/", auth(), authorizeRoles("CUSTOMER", "ADMIN"), paymentController.getMyPayments);
router.get("/:id", auth(), paymentController.getPaymentById);

export const paymentRoutes = router;

// NOTE: the raw Stripe webhook route is mounted separately in app.ts
// because it requires the raw request body (not JSON-parsed).
