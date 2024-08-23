import { Router } from "express";
import * as productsController from "../controllers/productsController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["user", "admin"]),
  productsController.getProducts
);
router.get("/:id", productsController.getProductById);

// Admin routers
router.post(
  "/create",
  authenticate,
  authorize(["admin"]),
  productsController.addProduct
);

router.put(
  "/update/:id",
  authenticate,
  authorize(["admin"]),
  productsController.updateProduct
);

router.put(
  "/remove/:id",
  authenticate,
  authorize(["admin"]),
  productsController.removeProduct
);

export default router;
