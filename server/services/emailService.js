import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (toEmail, resetUrl, userName) => {
  const mailOptions = {
    from: `"GripInvest Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "GripInvest Password Reset Request",
    html: `
      <p>Hi ${userName || "User"},</p>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to reset your password. This link will expire in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <br/>
      <p>Thank you,<br/>GripInvest Team</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
