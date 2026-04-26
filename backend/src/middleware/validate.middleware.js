const { validationResult } = require("express-validator");

/**
 * Runs after express-validator chains.
 * Returns 422 with structured errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: formatted,
    });
  }

  next();
};

module.exports = validate;