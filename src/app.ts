import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from './routes/authRoutes'
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json())

app.use('/api/auth', authRoutes);

export default app;
