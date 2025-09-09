import { connectDB } from "../config/database.js";
import aiService from "../services/aiService.js";
import { validateProduct } from "../utils/validators.js";

export class ProductController {
  async getAllProducts(req, res) {
    try {
      const {
        type,
        risk_level,
        min_yield,
        max_yield,
        sort_by = "annual_yield",
        order = "DESC",
        page = 1,
        limit = 20,
      } = req.query;

      let query = "SELECT * FROM investment_products WHERE is_active = TRUE";
      const params = [];

      if (type) {
        query += " AND investment_type = ?";
        params.push(type);
      }

      if (risk_level) {
        query += " AND risk_level = ?";
        params.push(risk_level);
      }

      if (min_yield) {
        query += " AND annual_yield >= ?";
        params.push(parseFloat(min_yield));
      }

      if (max_yield) {
        query += " AND annual_yield <= ?";
        params.push(parseFloat(max_yield));
      }

      // Add sorting
      const validSortFields = [
        "annual_yield",
        "risk_level",
        "min_investment",
        "created_at",
        "name",
      ];
      const sortField = validSortFields.includes(sort_by)
        ? sort_by
        : "annual_yield";
      const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      query += ` ORDER BY ${sortField} ${sortOrder}`;

      const pageNum =
        Number.isInteger(parseInt(page)) && parseInt(page) > 0
          ? parseInt(page)
          : 1;
      const limitNum =
        Number.isInteger(parseInt(limit)) && parseInt(limit) > 0
          ? parseInt(limit)
          : 20;
      const offsetNum = (pageNum - 1) * limitNum;

      query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

      const products = await connectDB.query(query, params);

      let countQuery =
        "SELECT COUNT(*) as total FROM investment_products WHERE is_active = TRUE";
      const countParams = [];

      if (type) {
        countQuery += " AND investment_type = ?";
        countParams.push(type);
      }

      if (risk_level) {
        countQuery += " AND risk_level = ?";
        countParams.push(risk_level);
      }

      if (min_yield) {
        countQuery += " AND annual_yield >= ?";
        countParams.push(parseFloat(min_yield));
      }

      if (max_yield) {
        countQuery += " AND annual_yield <= ?";
        countParams.push(parseFloat(max_yield));
      }

      const [{ total }] = await connectDB.query(countQuery, countParams);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const products = await connectDB.query(
        "SELECT * FROM investment_products WHERE id = ? AND is_active = TRUE",
        [id]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: { product: products[0] },
      });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getRecommendations(req, res) {
    try {
      const userId = req.user.userId;
      const userRiskAppetite = req.user.risk_appetite;

      const products = await connectDB.query(
        "SELECT * FROM investment_products WHERE is_active = TRUE ORDER BY annual_yield DESC"
      );

      const recommendations = await aiService.getProductRecommendations(
        userRiskAppetite,
        products,
        30,
        "Long-term wealth building"
      );

      res.json({
        success: true,
        data: {
          recommendations: recommendations.recommendations,
          portfolioStrategy: recommendations.portfolioStrategy,
          riskWarnings: recommendations.riskWarnings,
          userProfile: {
            riskAppetite: userRiskAppetite,
          },
        },
      });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create product (admin only)
  async createProduct(req, res) {
    try {
      const { error, value } = validateProduct(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const {
        name,
        investment_type,
        tenure_months,
        annual_yield,
        risk_level,
        min_investment,
        max_investment,
        description, 
      } = value;

      let finalDescription = description;

      if (!finalDescription || finalDescription.trim() === "") {
        finalDescription = await aiService.generateProductDescription(value);
      }
      await connectDB.query(
        `
        INSERT INTO investment_products 
        (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          name,
          investment_type,
          tenure_months,
          annual_yield,
          risk_level,
          min_investment,
          max_investment,
          finalDescription,
        ]
      );

      const newProducts = await connectDB.query(
        "SELECT * FROM investment_products WHERE name = ? AND investment_type = ? ORDER BY created_at DESC LIMIT 1",
        [name, investment_type]
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product: newProducts[0] },
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new ProductController();
