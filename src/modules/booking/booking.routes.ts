import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { bookingValidation } from "./booking.validation";
import { bookingController } from "./booking.controller";

const router = express.Router();

router.post(
  "/",
  auth(),
  authorizeRoles("CUSTOMER"),
  validateRequest(bookingValidation.createBookingSchema),
  bookingController.createBooking
);

router.get("/", auth(), authorizeRoles("CUSTOMER"), bookingController.getMyBookings);
router.get("/:id", auth(), bookingController.getBookingById);
router.patch("/:id/cancel", auth(), authorizeRoles("CUSTOMER"), bookingController.cancelBooking);

export const bookingRoutes = router;
