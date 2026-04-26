// backend/src/utils/generateOTP.js
const crypto = require("crypto");

/**
 * Generates a 6-digit numeric OTP and its expiry time (10 minutes)
 */
const generateOTP = () => {
  const otp     = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, expires };
};

module.exports = generateOTP;