import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { serviceValidation } from "./service.validation";
import { serviceController } from "./service.controller";

const router = express.Router();

router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);

router.post(
  "/",
  auth(),
  authorizeRoles("TECHNICIAN"),
  validateRequest(serviceValidation.createServiceSchema),
  serviceController.createService
);

router.patch(
  "/:id",
  auth(),
  authorizeRoles("TECHNICIAN"),
  validateRequest(serviceValidation.updateServiceSchema),
  serviceController.updateService
);

router.delete("/:id", auth(), authorizeRoles("TECHNICIAN"), serviceController.deleteService);

export const serviceRoutes = router;
