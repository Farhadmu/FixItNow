import express from "express";
import auth from "../../middlewares/auth.middleware";
import authorizeRoles from "../../middlewares/role.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { categoryValidation } from "./category.validation";
import { categoryController } from "./category.controller";

const router = express.Router();

router.get("/", categoryController.getAllCategories);

router.post(
  "/",
  auth(),
  authorizeRoles("ADMIN"),
  validateRequest(categoryValidation.createCategorySchema),
  categoryController.createCategory
);

router.patch(
  "/:id",
  auth(),
  authorizeRoles("ADMIN"),
  validateRequest(categoryValidation.updateCategorySchema),
  categoryController.updateCategory
);

router.delete("/:id", auth(), authorizeRoles("ADMIN"), categoryController.deleteCategory);

export const categoryRoutes = router;
