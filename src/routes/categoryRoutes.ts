import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";

import * as categoryController from "../controllers/categoryControllers";
import * as productsController from "../controllers/productsController";

const router = express.Router();

router.get("/", categoryController.getCateories);
router.get("/:id", categoryController.getCategoryById);
router.get(
  "/products/:id",
  authenticate,
  productsController.getProductsByCategory
);

// Admin
router.post(
  "/create",
  authenticate,
  authorize(["admin"]),
  categoryController.createCategory
);
router.put(
  "/update/:id",
  authenticate,
  authorize(["admin"]),
  categoryController.updateCategory
);
router.delete(
  "/remove/:id",
  authenticate,
  authorize(["admin"]),
  categoryController.deleteCategory
);

export default router;
