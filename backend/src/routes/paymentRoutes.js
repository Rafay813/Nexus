// backend/src/routes/paymentRoutes.js
const express  = require("express");
const router   = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
  createDeposit,
  confirmDeposit,
  withdraw,
  transfer,
  getTransactions,
  getBalance,
  getStripeKey,
} = require("../controllers/paymentController");

router.use(protect);

router.get(  "/stripe-key",       getStripeKey);      // GET  /api/payment/stripe-key
router.get(  "/balance",          getBalance);        // GET  /api/payment/balance
router.get(  "/transactions",     getTransactions);   // GET  /api/payment/transactions
router.post( "/deposit",          createDeposit);     // POST /api/payment/deposit
router.post( "/deposit/confirm",  confirmDeposit);    // POST /api/payment/deposit/confirm
router.post( "/withdraw",         withdraw);          // POST /api/payment/withdraw
router.post( "/transfer",         transfer);          // POST /api/payment/transfer
// backend/src/routes/paymentRoutes.js — add this route
const User        = require("../models/User");
const Transaction = require("../models/Transaction");

router.post("/deposit/mock", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Invalid amount." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: amount } },
      { new: true }
    );

    await Transaction.create({
      user:         req.user._id,
      type:         "deposit",
      amount,
      currency:     "usd",
      status:       "completed",
      description:  `Mock deposit of $${amount}`,
      balanceAfter: user.balance,
    });

    res.json({ success: true, data: { balance: user.balance } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;