import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = process.env.PORT || 3000;

// Connect to the database
connectDatabase().then(() => {
  console.log("Connected to database");
});

// Use this for local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// This is necessary for Vercel deployment
export default app;
