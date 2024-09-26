import express from "express";
import * as feedbackController from "../controllers/feedbackController";
import { authenticate, authorize } from "middleware/authMiddleware";

const router = express.Router();

router.get("/", feedbackController.getFeedBacks);
router.post(
  "/",
  authenticate,
  authorize(["user"]),
  feedbackController.createFeedback
);

export default router;
