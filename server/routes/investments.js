import express from "express";
import investmentController from "../controllers/investmentController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, investmentController.createInvestment);
router.get("/", authenticateToken, investmentController.getUserInvestments);
router.get("/portfolio", authenticateToken, investmentController.getPortfolio);
router.get(
  "/portfolio/insights",
  authenticateToken,
  investmentController.getPortfolioInsights
);

export default router;
