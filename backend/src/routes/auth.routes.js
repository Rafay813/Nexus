const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  changePassword,
  sendOTP,
  verifyOTP,
  toggle2FA,
} = require("../controllers/auth.controller");

const { verifyOTPValidator } = require("../validators/auth.validator");

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret@123
 *               role:
 *                 type: string
 *                 enum: [investor, entrepreneur]
 *     responses:
 *       201:
 *         description: Account created successfully
 *       409:
 *         description: Email already in use
 *       422:
 *         description: Validation error
 */
router.post("/register", registerValidator, validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Secret@123
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidator, validate, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using cookie
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or missing refresh token
 */
router.post("/refresh", refreshAccessToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password incorrect
 */
router.put("/change-password", protect, changePasswordValidator, validate, changePassword);
// ── 2FA / OTP Routes ──────────────────────────────────────────────────────────
router.post("/otp/send",   protect, sendOTP);
router.post("/otp/verify", protect, verifyOTPValidator, validate, verifyOTP);
router.patch("/2fa/toggle", protect, toggle2FA);
module.exports = router;