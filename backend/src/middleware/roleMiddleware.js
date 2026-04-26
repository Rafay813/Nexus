// backend/src/middleware/roleMiddleware.js

/**
 * Restrict route to specific roles
 * Usage: restrictTo("investor") or restrictTo("investor", "entrepreneur")
 */
const restrictTo = (...roles) => {
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

module.exports = { restrictTo };