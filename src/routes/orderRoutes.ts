import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";

import * as orderController from "../controllers/orderController";

const router = Router();

router.get("/", authenticate, orderController.getOrders);
router.get("/:orderId", authenticate, orderController.getIndividualOrder);
router.post("/create", authenticate, orderController.createOrder);
router.post("/:orderId/cancel", authenticate, orderController.cancelOrder);

// Admin routes
router.get(
  "/admin",
  authenticate,
  authorize(["admin"]),
  orderController.getAllOrders
);
router.put(
  "/admin/:orderId",
  authenticate,
  authorize(["admin"]),
  orderController.updateOrder
);
export default router;
