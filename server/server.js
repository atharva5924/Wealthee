import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database.js";
import { transactionLogger } from "./middleware/transactionLogger.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import investmentRoutes from "./routes/investments.js";
import transactionLogRoutes from "./routes/transaction-logs.js";
import { pool } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(transactionLogger);

app.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    await pool.execute("SELECT 1");
    dbStatus = "connected";
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Wealthee-backend",
      version: "1.0.0",
      database: dbStatus,
    });
  } catch (error) {
    dbStatus = "disconnected";
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      service: "Wealthee-backend",
      database: dbStatus,
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/transaction-logs", transactionLogRoutes);

const startServer = async () => {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
