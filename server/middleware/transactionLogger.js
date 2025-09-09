import { connectDB } from "../config/database.js";

export const transactionLogger = async (req, res, next) => {
  const startTime = Date.now();
  const originalJson = res.json;
  let responseData = null;

  res.json = function (data) {
    responseData = data;
    return originalJson.call(this, data);
  };

  next();

  res.on("finish", async () => {
    try {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      await connectDB.query(
        `
  INSERT INTO transaction_logs 
  (user_id, email, endpoint, http_method, status_code, response_time, error_message, ip_address, user_agent, request_body, response_body)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
          req.user?.userId ?? null,
          req.user?.email ?? null,
          req.originalUrl ?? null,
          req.method ?? null,
          res.statusCode ?? null,
          responseTime ?? null,
          res.statusCode >= 400
            ? responseData?.message ?? "Unknown error"
            : null,
          req.ip ?? req.connection?.remoteAddress ?? null,
          req.get("User-Agent") ?? null,
          req.method !== "GET" ? JSON.stringify(req.body ?? {}) : null,
          JSON.stringify(responseData ?? {}),
        ]
      );
    } catch (error) {
      console.error("Transaction logging error:", error);
    }
  });
};
