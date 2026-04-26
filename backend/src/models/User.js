const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const investorProfileSchema = new mongoose.Schema(
  {
    firmName: { type: String, trim: true },
    investmentStages: {
      type: [String],
      enum: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth"],
      default: [],
    },
    industriesOfInterest: { type: [String], default: [] },
    portfolioSize: { type: Number, default: 0 },
    minInvestment: { type: Number, default: 0 },
    maxInvestment: { type: Number, default: 0 },
    investmentHistory: [
      {
        companyName: String,
        amount: Number,
        year: Number,
        stage: String,
      },
    ],
    preferredRegions: { type: [String], default: [] },
    linkedIn: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false },
);

const entrepreneurProfileSchema = new mongoose.Schema(
  {
    startupName: { type: String, trim: true },
    startupStage: {
      type: String,
      enum: ["Idea", "MVP", "Pre-Seed", "Seed", "Series A", "Growth"],
    },
    industry: { type: String, trim: true },
    fundingGoal: { type: Number, default: 0 },
    fundingRaised: { type: Number, default: 0 },
    teamSize: { type: Number, default: 1 },
    pitchDeck: { type: String }, // URL to uploaded pitch deck
    businessModel: { type: String, trim: true },
    revenueModel: { type: String, trim: true },
    traction: { type: String, trim: true }, // Brief traction description
    linkedIn: { type: String, trim: true },
    website: { type: String, trim: true },
    githubRepo: { type: String, trim: true },
  },
  { _id: false },
);

// ─── Main User Schema ────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // ── Core fields ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["investor", "entrepreneur"],
      required: [true, "Role is required"],
    },
    // Add this field to your existing User schema
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ── Common profile fields ────────────────────────────────────────────────
    avatar: { type: String, default: "" },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    location: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },

    // ── Role-specific profiles ───────────────────────────────────────────────
    investorProfile: {
      type: investorProfileSchema,
      default: () => ({}),
    },
    entrepreneurProfile: {
      type: entrepreneurProfileSchema,
      default: () => ({}),
    },

    // ── Account status ───────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // ── Security ─────────────────────────────────────────────────────────────
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    twoFASecret: { type: String, select: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpVerified: { type: Boolean, default: false },
    isTwoFAEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (strip sensitive fields)
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.twoFASecret;
  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
