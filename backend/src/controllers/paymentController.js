// backend/src/controllers/paymentController.js
const stripe      = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");
const User        = require("../models/User");

// ── @POST /api/payment/deposit — Create Stripe Payment Intent ────────────────
const createDeposit = async (req, res) => {
  try {
    const { amount, currency = "usd" } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Amount must be at least $1." });
    }

    // Create Stripe Payment Intent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString() },
    });

    // Create pending transaction
    const transaction = await Transaction.create({
      user:                  req.user._id,
      type:                  "deposit",
      amount,
      currency,
      status:                "pending",
      stripePaymentIntentId: paymentIntent.id,
      description:           `Deposit of $${amount}`,
      balanceAfter:          req.user.balance + amount,
    });

    res.status(201).json({
      success: true,
      message: "Payment intent created.",
      data: {
        clientSecret: paymentIntent.client_secret,
        transaction,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/payment/deposit/confirm — Confirm deposit after Stripe ─────────
const confirmDeposit = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "Payment Intent ID required." });
    }

    // Verify with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      // Mark transaction as failed
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Payment not successful." });
    }

    const amount = paymentIntent.amount / 100;

    // Update user balance
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: amount } },
      { new: true }
    );

    // Mark transaction as completed
    const transaction = await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status: "completed", balanceAfter: user.balance },
      { new: true }
    );

    res.json({
      success: true,
      message: `$${amount} deposited successfully.`,
      data: { transaction, balance: user.balance },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/payment/withdraw ───────────────────────────────────────────────
const withdraw = async (req, res) => {
  try {
    const { amount, description = "" } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Amount must be at least $1." });
    }

    const user = await User.findById(req.user._id);

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance." });
    }

    // Deduct balance
    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      user:         req.user._id,
      type:         "withdraw",
      amount,
      currency:     "usd",
      status:       "completed",
      description:  description || `Withdrawal of $${amount}`,
      balanceAfter: user.balance,
    });

    res.status(201).json({
      success: true,
      message: `$${amount} withdrawn successfully.`,
      data: { transaction, balance: user.balance },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/payment/transfer ───────────────────────────────────────────────
const transfer = async (req, res) => {
  try {
    const { amount, recipientEmail, description = "" } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Amount must be at least $1." });
    }

    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: "Recipient email is required." });
    }

    const sender    = await User.findById(req.user._id);
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found." });
    }

    if (recipient._id.toString() === sender._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot transfer to yourself." });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance." });
    }

    // Deduct from sender
    sender.balance -= amount;
    await sender.save();

    // Add to recipient
    recipient.balance += amount;
    await recipient.save();

    // Sender transaction
    const senderTx = await Transaction.create({
      user:         sender._id,
      type:         "transfer",
      amount,
      currency:     "usd",
      status:       "completed",
      recipient:    recipient._id,
      description:  description || `Transfer to ${recipient.name}`,
      balanceAfter: sender.balance,
    });

    // Recipient transaction
    await Transaction.create({
      user:         recipient._id,
      type:         "deposit",
      amount,
      currency:     "usd",
      status:       "completed",
      description:  `Transfer received from ${sender.name}`,
      balanceAfter: recipient.balance,
    });

    res.status(201).json({
      success: true,
      message: `$${amount} transferred to ${recipient.name}.`,
      data: { transaction: senderTx, balance: sender.balance },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/payment/transactions — Get my transaction history ───────────────
const getTransactions = async (req, res) => {
  try {
    const { type, status, limit = 20, page = 1 } = req.query;

    const filter = { user: req.user._id };
    if (type)   filter.type   = type;
    if (status) filter.status = status;

    const skip  = (page - 1) * limit;
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .populate("recipient", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count:   transactions.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / limit),
      data:    transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/payment/balance — Get my balance ────────────────────────────────
const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("balance name email");
    res.json({ success: true, data: { balance: user.balance } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/payment/stripe-key — Get publishable key ───────────────────────
const getStripeKey = async (_req, res) => {
  res.json({
    success: true,
    data: { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY },
  });
};

module.exports = {
  createDeposit,
  confirmDeposit,
  withdraw,
  transfer,
  getTransactions,
  getBalance,
  getStripeKey,
};