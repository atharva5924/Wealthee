import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../config/database.js";
import { validateRegistration, validateLogin } from "../utils/validators.js";
import aiService from "../services/aiService.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import crypto from "crypto";

export class AuthController {
  async register(req, res) {
    try {
      const { error, value } = validateRegistration(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { first_name, last_name, email, password, risk_appetite } = value;

      const existingUser = await connectDB.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const passwordAnalysis = await aiService.analyzePasswordStrength(
        password
      );

      if (passwordAnalysis.score < 60) {
        return res.status(400).json({
          success: false,
          message: "Password is too weak",
          passwordAnalysis: {
            strength: passwordAnalysis.strength,
            score: passwordAnalysis.score,
            suggestions: passwordAnalysis.suggestions,
          },
        });
      }

      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      await connectDB.query(
        `
        INSERT INTO users (first_name, last_name, email, password_hash, risk_appetite)
        VALUES (?, ?, ?, ?, ?)
      `,
        [first_name, last_name, email, password_hash, risk_appetite]
      );

      const newUser = await connectDB.query(
        "SELECT id, first_name, last_name, email, risk_appetite, balance, created_at FROM users WHERE email = ?",
        [email]
      );

      const token = jwt.sign(
        {
          userId: newUser[0].id,
          email: newUser[0].email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: newUser[0],
          token,
          passwordAnalysis: {
            strength: passwordAnalysis.strength,
            score: passwordAnalysis.score,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { error, value } = validateLogin(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { email, password } = value;

      const users = await connectDB.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const user = users[0];

      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const { password_hash, ...userResponse } = user;

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await connectDB.query(
        `
        SELECT id, first_name, last_name, email, risk_appetite, balance, created_at, updated_at, role
        FROM users 
        WHERE id = ?
      `,
        [req.user.userId]
      );

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: { user: user[0] },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { first_name, last_name, risk_appetite } = req.body;
      const userId = req.user.userId;

      if (
        risk_appetite &&
        !["low", "moderate", "high"].includes(risk_appetite)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid risk appetite. Must be low, moderate, or high",
        });
      }

      await connectDB.query(
        `
        UPDATE users 
        SET first_name = ?, last_name = ?, risk_appetite = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [first_name, last_name, risk_appetite, userId]
      );

      const updatedUser = await connectDB.query(
        `
        SELECT id, first_name, last_name, email, risk_appetite, balance, created_at, updated_at
        FROM users 
        WHERE id = ?
      `,
        [userId]
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser[0] },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const users = await connectDB.query(
        "SELECT id, first_name, email FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.json({
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent.",
        });
      }

      const user = users[0];

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 30 * 60000);

      await connectDB.query(
        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
        [resetToken, resetTokenExpiry, user.id]
      );

      const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetToken}`;

      await sendPasswordResetEmail(user.email, resetUrl, user.first_name);

      res.json({
        success: true,
        message: "Password reset link sent to your email.",
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required.",
        });
      }

      const users = await connectDB.query(
        "SELECT id, reset_token_expiry FROM users WHERE reset_token = ?",
        [token]
      );

      if (users.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired token." });
      }

      const user = users[0];

      if (
        !user.reset_token_expiry ||
        new Date() > new Date(user.reset_token_expiry)
      ) {
        return res.status(400).json({
          success: false,
          message: "Token expired. Please request a new password reset.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await connectDB.query(
        "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
        [hashedPassword, user.id]
      );

      res.json({
        success: true,
        message:
          "Password reset successful. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

export default new AuthController();
