import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "gripinvest_db",
  charset: "utf8mb4",
  timezone: "Z",
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

export const connectDB = {
  async query(sql, params = []) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },

  async transaction(callback) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async ping() {
    try {
      await pool.execute("SELECT 1");
      return true;
    } catch (error) {
      throw new Error("Database connection failed");
    }
  },
};

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database tables...");

    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        risk_appetite ENUM('low','moderate','high') DEFAULT 'moderate',
        balance DECIMAL(12,2) DEFAULT 10000.00,
        reset_token VARCHAR(255) NULL,
        reset_token_expiry DATETIME NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_reset_token (reset_token)
      ) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create investment_products table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS investment_products (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        investment_type ENUM('bond','fd','mf','etf','other') NOT NULL,
        tenure_months INT NOT NULL,
        annual_yield DECIMAL(5,2) NOT NULL,
        risk_level ENUM('low','moderate','high') NOT NULL,
        min_investment DECIMAL(12,2) DEFAULT 1000.00,
        max_investment DECIMAL(12,2),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type_risk (investment_type, risk_level),
        INDEX idx_yield (annual_yield),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create investments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS investments (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        invested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active','matured','cancelled') DEFAULT 'active',
        expected_return DECIMAL(12,2),
        maturity_date DATE,
        actual_return DECIMAL(12,2) NULL,
        notes TEXT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES investment_products(id) ON DELETE CASCADE,
        INDEX idx_user_status (user_id, status),
        INDEX idx_maturity (maturity_date),
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create transaction_logs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transaction_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id CHAR(36),
        email VARCHAR(255),
        endpoint VARCHAR(255) NOT NULL,
        http_method ENUM('GET','POST','PUT','DELETE','PATCH') NOT NULL,
        status_code INT NOT NULL,
        response_time INT DEFAULT 0,
        error_message TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_body JSON,
        response_body JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_date (user_id, created_at),
        INDEX idx_endpoint_status (endpoint, status_code),
        INDEX idx_status_date (status_code, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const userCount = await pool.execute("SELECT COUNT(*) as count FROM users");
    if (userCount[0][0].count === 0) {
      await insertSampleData();
    }

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

// Insert sample data
const insertSampleData = async () => {
  try {
    console.log("Inserting sample data...");

    const products = [
      {
        name: "Government Bond Fund",
        type: "bond",
        tenure: 12,
        yield: 4.5,
        risk: "low",
        min: 1000,
        max: 100000,
        description: "Secure government-backed bonds with guaranteed returns.",
      },
      {
        name: "Balanced Growth Fund",
        type: "mf",
        tenure: 36,
        yield: 8.9,
        risk: "moderate",
        min: 1000,
        max: 500000,
        description:
          "Well-balanced mutual fund investing in both equity and debt securities.",
      },
      {
        name: "Technology Sector ETF",
        type: "etf",
        tenure: 24,
        yield: 15.6,
        risk: "high",
        min: 1500,
        max: 750000,
        description: "Exchange-traded fund tracking top technology companies.",
      },
    ];

    for (const product of products) {
      await pool.execute(
        `
        INSERT INTO investment_products 
        (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          product.name,
          product.type,
          product.tenure,
          product.yield,
          product.risk,
          product.min,
          product.max,
          product.description,
        ]
      );
    }

    console.log("Sample data inserted successfully");
  } catch (error) {
    console.error("Failed to insert sample data:", error);
  }
};

export default { pool, connectDB, initializeDatabase };
