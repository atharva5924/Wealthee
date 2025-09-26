import { connectDB } from "../config/database.js";
import aiService from "../services/aiService.js";
import { validateInvestment } from "../utils/validators.js";

export class InvestmentController {
  async createInvestment(req, res) {
    try {
      const { error, value } = validateInvestment(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { product_id, amount } = value;
      const userId = req.user.userId;

      const products = await connectDB.query(
        "SELECT * FROM investment_products WHERE id = ? AND is_active = TRUE",
        [product_id]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const product = products[0];

      if (amount < product.min_investment) {
        return res.status(400).json({
          success: false,
          message: `Minimum investment amount is $${product.min_investment}`,
        });
      }

      if (product.max_investment && amount > product.max_investment) {
        return res.status(400).json({
          success: false,
          message: `Maximum investment amount is $${product.max_investment}`,
        });
      }

      const users = await connectDB.query(
        "SELECT balance FROM users WHERE id = ?",
        [userId]
      );

      if (users[0].balance < amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
      }

      const expectedReturn =
        amount *
        (1 + ((product.annual_yield / 100) * product.tenure_months) / 12);
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + product.tenure_months);

      await connectDB.transaction(async (connection) => {
        await connection.execute(
          `
          INSERT INTO investments 
          (user_id, product_id, amount, expected_return, maturity_date)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            userId,
            product_id,
            amount,
            expectedReturn,
            maturityDate.toISOString().split("T")[0],
          ]
        );

        await connection.execute(
          "UPDATE users SET balance = balance - ? WHERE id = ?",
          [amount, userId]
        );
      });

      const investments = await connectDB.query(
        `
        SELECT i.*, p.name as product_name, p.investment_type, p.risk_level, p.annual_yield
        FROM investments i
        JOIN investment_products p ON i.product_id = p.id
        WHERE i.user_id = ? AND i.product_id = ?
        ORDER BY i.invested_at DESC LIMIT 1
      `,
        [userId, product_id]
      );

      res.status(201).json({
        success: true,
        message: "Investment created successfully",
        data: { investment: investments[0] },
      });
    } catch (error) {
      console.error("Create investment error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getUserInvestments(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit, status } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const offsetNum = (pageNum - 1) * limitNum;

      const query = `
  SELECT i.*, p.name as product_name, p.investment_type, p.risk_level, p.annual_yield
  FROM investments i
  JOIN investment_products p ON i.product_id = p.id
  WHERE i.user_id = ?
  ORDER BY i.invested_at DESC
  LIMIT ${limitNum} OFFSET ${offsetNum}
`;

      const params = [userId];

      const investments = await connectDB.query(query, params);

      let countQuery =
        "SELECT COUNT(*) as total FROM investments WHERE user_id = ?";
      const countParams = [userId];

      if (status) {
        countQuery += " AND status = ?";
        countParams.push(status);
      }

      const [{ total }] = await connectDB.query(countQuery, countParams);

      res.json({
        success: true,
        data: {
          investments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get investments error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getPortfolio(req, res) {
    try {
      const userId = req.user.userId;

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

      const portfolioSummary = await connectDB.query(
        `
        SELECT 
          COUNT(*) as totalInvestments,
          SUM(amount) as totalInvested,
          SUM(expected_return) as totalExpectedReturns,
          AVG(p.annual_yield) as averageYield,
          SUM(CASE WHEN i.status = 'active' THEN 1 ELSE 0 END) as activeInvestments,
          SUM(CASE WHEN i.status = 'matured' THEN 1 ELSE 0 END) as maturedInvestments,
           SUM(CASE WHEN i.invested_at >= ? THEN 1 ELSE 0 END) as newThisMonth
        FROM investments i
        JOIN investment_products p ON i.product_id = p.id
        WHERE i.user_id = ?
      `,
        [firstDayStr, userId]
      );

      const summary = portfolioSummary[0];

      res.json({
        success: true,
        data: {
          totalValue: summary.totalInvested || 0,
          expectedReturns: summary.totalExpectedReturns || 0,
          totalGains:
            summary.totalInvested > 0
              ? ((summary.totalExpectedReturns - summary.totalInvested) /
                  summary.totalInvested) *
                100
              : 0,
          averageYield: summary.averageYield || 0,
          activeInvestments: summary.activeInvestments || 0,
          maturedInvestments: summary.maturedInvestments || 0,
          newThisMonth: summary.newThisMonth || 0,
        },
      });
    } catch (error) {
      console.error("Get portfolio error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getPortfolioInsights(req, res) {
    try {
      const userId = req.user.userId;

      const investments = await connectDB.query(
        `
        SELECT i.*, p.name as product_name, p.investment_type, p.risk_level, p.annual_yield
        FROM investments i
        JOIN investment_products p ON i.product_id = p.id
        WHERE i.user_id = ? AND i.status = 'active'
      `,
        [userId]
      );

      if (!investments || investments.length === 0) {
        return res.json({
          success: true,
          data: {
            message: "No active investments",
            totalValue: 0,
            expectedReturns: 0,
            totalGains: 0,
            averageYield: 0,
            riskDistribution: {},
            portfolioStrategy: "",
            riskWarnings: [],
          },
        });
      } 

      const userProfile = {
        risk_appetite: req.user.risk_appetite,
        userId: userId,
      };

      const insights = await aiService.generatePortfolioInsights(
        investments,
        userProfile
      );

      res.json({
        success: true,
        data: insights,
      });
    } catch (error) {
      console.error("Get portfolio insights error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new InvestmentController();
