import { Router } from "express";
import * as statisticsController from "../controllers/statisticsController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/user",
  authenticate,
  authorize(["admin"]),
  statisticsController.getUserStats
);

export default router;
