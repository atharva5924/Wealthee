import express from "express";
import transactionController from "../controllers/transactionController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, transactionController.getTransactionLogs);
router.get(
  "/error-summary",
  authenticateToken,
  transactionController.getErrorSummary
);

export default router;
