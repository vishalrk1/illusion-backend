import express from "express";
import * as categoryController from "../controllers/categoryControllers";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", categoryController.getCateories);
router.get("/:id", categoryController.getCategoryById);

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
