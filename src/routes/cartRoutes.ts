import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import * as cartController from "../controllers/cartController";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["user", "admin"]),
  cartController.getCart
);
router.post(
  "/add",
  authenticate,
  cartController.addProductToCart
);
router.put(
  "/update",
  authenticate,
  authorize(["user", "admin"]),
  cartController.updateCartItem
);
router.delete(
  "/remove/:productId",
  authenticate,
  authorize(["user", "admin"]),
  cartController.removeCartItem
);

export default router;
