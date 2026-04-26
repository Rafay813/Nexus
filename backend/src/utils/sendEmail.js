// backend/src/utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   process.env.SMTP_PORT   || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Nexus Platform" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 32px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 48px; height: 48px; background: #6366f1; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: white;">N</div>
        <h2 style="color: #f1f5f9; margin-top: 12px;">Nexus Platform</h2>
      </div>
      <h3 style="color: #a5b4fc; text-align: center;">Your Verification Code</h3>
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #6366f1; margin: 0;">${otp}</p>
      </div>
      <p style="color: #94a3b8; font-size: 14px; text-align: center;">This code expires in <strong style="color: #f1f5f9;">10 minutes</strong>.</p>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject: "Nexus — Your OTP Verification Code", html });
};

module.exports = { sendEmail, sendOTPEmail };