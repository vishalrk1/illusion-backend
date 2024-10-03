import express from "express";
import * as addressController from "../controllers/addressController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// router.get("/", authenticate, addressController.)
router.post("/add", authenticate, addressController.addAddress);
router.put("/:addressId", authenticate, addressController.updateAddress);
router.delete("/:addressId", authenticate, addressController.deleteAddress);

export default router;
