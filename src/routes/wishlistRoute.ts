import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import * as wishlistController from "../controllers/wishlistController";

const router = Router();

router.get("/", authenticate, wishlistController.getWishlist);
router.post("/:productId", authenticate, wishlistController.addToWishlist);
router.post("/:productId", authenticate, wishlistController.removeFromWishlist);

export default router;
