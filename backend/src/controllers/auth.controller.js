const generateOTP        = require("../utils/generateOTP");
const { sendOTPEmail }   = require("../utils/sendEmail");
const User = require("../models/User");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/jwt.utils");

// ─── Register ─────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ name, email, password, role });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set refresh token as HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: user.toPublicJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password (select: false by default)
    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact support.",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Update refresh token & last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        user: user.toPublicJSON(),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token in DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });

    // Clear cookie
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Access Token ─────────────────────────────────────────────────────
/**
 * @route   POST /api/auth/refresh
 * @access  Public (uses refresh token cookie)
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided.",
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    // Find user and verify stored token matches
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Session invalid. Please login again.",
      });
    }

    // Issue new access token
    const accessToken = generateAccessToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User (Me) ────────────────────────────────────────────────────
/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
/**
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
// ─── Send OTP ─────────────────────────────────────────────────────────────────
const sendOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const { otp, expires } = generateOTP();

    // Save OTP to user
    user.otpCode    = otp;
    user.otpExpires = expires;
    await user.save({ validateBeforeSave: false });

    // Send email
    await sendOTPEmail(user.email, otp);

    return res.json({
      success: true,
      message: `OTP sent to ${user.email}. Valid for 10 minutes.`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select("+otpCode +otpExpires");

    if (!user.otpCode || !user.otpExpires) {
      return res.status(400).json({ success: false, message: "No OTP requested. Please request a new one." });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Mark as verified
    user.otpVerified    = true;
    user.isEmailVerified = true;
    user.otpCode        = undefined;
    user.otpExpires     = undefined;
    await user.save({ validateBeforeSave: false });

    return res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle 2FA ───────────────────────────────────────────────────────────────
const toggle2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isTwoFAEnabled = !user.isTwoFAEnabled;
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: `2FA ${user.isTwoFAEnabled ? "enabled" : "disabled"}.`,
      data: { isTwoFAEnabled: user.isTwoFAEnabled },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  changePassword,
  sendOTP,
  verifyOTP,
  toggle2FA,
};
