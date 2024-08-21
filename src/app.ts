import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

// all routers
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";

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

export default app;
