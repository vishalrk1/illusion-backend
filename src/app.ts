import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

// all routers
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productsRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoutes from "./routes/wishlistRoute";
import orderRouter from "./routes/orderRoutes";
import FeedbackRouter from "./routes/feedbackRoutes";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/order", orderRouter);
app.use("/api/feedback", FeedbackRouter);

export default app;
