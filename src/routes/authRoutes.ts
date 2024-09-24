import express from "express";
import * as authController from "../controllers/authController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/update", authenticate, authController.updateProfile);
router.get("/profile", authenticate, authController.getUser);

// Protected route example
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "Access granted to protected route", user: req.user });
});

// Admin-only route example
router.get("/admin", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Access granted to admin route", user: req.user });
});

export default router;
