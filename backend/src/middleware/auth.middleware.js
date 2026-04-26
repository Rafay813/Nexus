const { verifyToken } = require("../utils/jwt.utils");
const User = require("../models/User");

/**
 * Protect middleware — verifies Bearer token and attaches user to req
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyToken(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid token.";
      return res.status(401).json({ success: false, message });
    }

    // 3. Check user still exists & is active
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists or has been deactivated.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * Usage: authorize("investor")  or  authorize("investor", "entrepreneur")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(" or ")} can access this resource.`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };