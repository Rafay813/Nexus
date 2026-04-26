// backend/src/validators/auth.validator.js
const { body, param } = require("express-validator");

// ── Register ──────────────────────────────────────────────────────────────────
const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters.")
    .escape(),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter.")
    .matches(/[a-z]/).withMessage("Must contain at least one lowercase letter.")
    .matches(/[0-9]/).withMessage("Must contain at least one number.")
    .matches(/[@$!%*?&#]/).withMessage("Must contain at least one special character (@$!%*?&#)."),

  body("role")
    .notEmpty().withMessage("Role is required.")
    .isIn(["investor", "entrepreneur"]).withMessage("Role must be investor or entrepreneur."),
];

// ── Login ─────────────────────────────────────────────────────────────────────
const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),
];

// ── Change Password ───────────────────────────────────────────────────────────
const changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required."),

  body("newPassword")
    .notEmpty().withMessage("New password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter.")
    .matches(/[a-z]/).withMessage("Must contain at least one lowercase letter.")
    .matches(/[0-9]/).withMessage("Must contain at least one number.")
    .matches(/[@$!%*?&#]/).withMessage("Must contain at least one special character."),
];

// ── OTP Verify ────────────────────────────────────────────────────────────────
const verifyOTPValidator = [
  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Invalid email.")
    .normalizeEmail(),

  body("otp")
    .trim()
    .notEmpty().withMessage("OTP is required.")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits.")
    .isNumeric().withMessage("OTP must be numeric."),
];

// ── Update Profile ────────────────────────────────────────────────────────────
const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters.")
    .escape(),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters.")
    .escape(),

  body("location")
    .optional()
    .trim()
    .escape(),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone().withMessage("Please provide a valid phone number."),

  body("avatar")
    .optional()
    .trim()
    .isURL().withMessage("Avatar must be a valid URL."),
];

// ── Mongo ID Param Validator ──────────────────────────────────────────────────
const mongoIdValidator = (paramName) => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required.`)
    .isMongoId().withMessage(`${paramName} must be a valid ID.`),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  verifyOTPValidator,
  updateProfileValidator,
  mongoIdValidator,
};