import { connectDB } from "../config/database.js";
import aiService from "../services/aiService.js";

export class TransactionController {
  async getTransactionLogs(req, res) {
    try {
      const { page, limit, status_code, email, userId: queryUserId  } = req.query;
      const finalUserId = queryUserId || req.user.userId;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const offsetNum = (pageNum - 1) * limitNum;

      let query = `
  SELECT id, endpoint, http_method, status_code, response_time, error_message, created_at
  FROM transaction_logs
  WHERE user_id = ?
`;

      let params = [finalUserId];
      if (queryUserId) {
        query += " AND user_id = ?";
        params.push(queryUserId);
      }

      if (email) {
        query += " AND email = ?";
        params.push(email);
      }
      if (status_code) {
        query += " AND status_code = ?";
        params.push(parseInt(status_code));
      }
      query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
      let logs = await connectDB.query(query, params);
      let countQuery =
        "SELECT COUNT(*) as total FROM transaction_logs WHERE user_id = ?";
      let countParams = [finalUserId];

      if (status_code) {
        countQuery += " AND status_code = ?";
        countParams.push(parseInt(status_code));
      }

      const [{ total }] = await connectDB.query(countQuery, countParams);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get transaction logs error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get AI error summary
  async getErrorSummary(req, res) {
    try {
      const userId = req.user.userId;

      const errorLogs = await connectDB.query(
        `
        SELECT endpoint, http_method, status_code, error_message, created_at
        FROM transaction_logs 
        WHERE user_id = ? AND status_code >= 400
        ORDER BY created_at DESC 
        LIMIT 100
      `,
        [userId]
      );

      const summary = await aiService.summarizeUserErrors(errorLogs);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get error summary error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default new TransactionController();
