import express from "express";
import productController from "../controllers/productController.js";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.js";
import { connectDB } from "../config/database.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateToken, productController.getAllProducts);
router.get(
  "/recommendations",
  authenticateToken,
  productController.getRecommendations
);
router.get("/:id", authenticateToken, productController.getProductById);
router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  productController.createProduct
);
router.put("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      investment_type,
      annual_yield,
      risk_level,
      tenure_months,
      min_investment,
      description,
    } = req.body;

    // Check if product exists
    const [existingProduct] = await connectDB.query(
      "SELECT * FROM investment_products WHERE id = ?",
      [id]
    );
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const query = `
      UPDATE investment_products 
      SET name = ?, investment_type = ?, annual_yield = ?, risk_level = ?, 
          tenure_months = ?, min_investment = ?, description = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await connectDB.query(query, [
      name,
      investment_type,
      annual_yield,
      risk_level,
      tenure_months,
      min_investment,
      description,
      id,
    ]);

    // Get the updated product
    const [updatedProduct] = await connectDB.query(
      "SELECT * FROM investment_products WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// DELETE product (admin only)
router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProduct] = await connectDB.query(
      "SELECT * FROM investment_products WHERE id = ?",
      [id]
    );
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await connectDB.query("DELETE FROM investment_products WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

// AI Generate Description (admin only)
router.post(
  "/ai-generate-description",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const {
        name,
        investment_type,
        annual_yield,
        risk_level,
        tenure_months,
        min_investment,
      } = req.body;

      // Simple description generation (you can integrate with OpenAI API here)
      const description = `Invest in ${name}, a ${risk_level}-risk ${investment_type} offering ${annual_yield}% annual returns. With a minimum investment of $${min_investment} and a tenure of ${tenure_months} months, this product is designed for investors seeking ${
        risk_level === "low"
          ? "stable"
          : risk_level === "medium"
          ? "balanced"
          : "aggressive"
      } growth opportunities.`;

      res.json({
        success: true,
        description,
      });
    } catch (error) {
      console.error("Error generating description:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate description",
        error: error.message,
      });
    }
  }
);

export default router;
