import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { technicianValidation } from "./technician.validation";
import { technicianController } from "./technician.controller";

const router = express.Router();

// Public
router.get("/", technicianController.getAllTechnicians);
router.get("/:id", technicianController.getTechnicianById);

// Technician-only (self-management)
router.put(
  "/profile/me",
  auth(),
  authorizeRoles("TECHNICIAN"),
  validateRequest(technicianValidation.updateProfileSchema),
  technicianController.updateProfile
);

router.put(
  "/availability/me",
  auth(),
  authorizeRoles("TECHNICIAN"),
  validateRequest(technicianValidation.updateAvailabilitySchema),
  technicianController.updateAvailability
);

router.get(
  "/bookings/me",
  auth(),
  authorizeRoles("TECHNICIAN"),
  technicianController.getMyBookings
);

router.patch(
  "/bookings/:id",
  auth(),
  authorizeRoles("TECHNICIAN"),
  validateRequest(technicianValidation.updateBookingStatusSchema),
  technicianController.updateBookingStatus
);

export const technicianRoutes = router;
