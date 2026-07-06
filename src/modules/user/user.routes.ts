import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { userValidation } from "./user.validation";
import { userController } from "./user.controller";
import { categoryController } from "../category/category.controller";
import { categoryValidation } from "../category/category.validation";

const router = express.Router();

router.use(auth(), authorizeRoles("ADMIN"));

router.get("/users", userController.getAllUsers);
router.patch("/users/:id", validateRequest(userValidation.updateUserStatusSchema), userController.updateUserStatus);
router.get("/bookings", userController.getAllBookings);

// Convenience aliases (same handlers as /api/categories, admin-only, kept
// here too because README/spec lists them under /api/admin/categories)
router.get("/categories", categoryController.getAllCategories);
router.post(
  "/categories",
  validateRequest(categoryValidation.createCategorySchema),
  categoryController.createCategory
);

export const adminRoutes = router;

