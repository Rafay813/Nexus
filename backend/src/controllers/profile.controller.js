const User = require("../models/User");

// ─── Get My Profile ───────────────────────────────────────────────────────────
/**
 * @route   GET /api/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      data: { profile: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update My Profile ────────────────────────────────────────────────────────
/**
 * @route   PUT /api/profile/me
 * @access  Private
 */
const updateMyProfile = async (req, res, next) => {
  try {
    // Fields that are allowed to be updated
    const allowedFields = [
      "name",
      "bio",
      "location",
      "phone",
      "avatar",
      "investorProfile",
      "entrepreneurProfile",
    ];

    // Build update object (only whitelisted fields)
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Role-specific: only allow relevant profile to be updated
    const user = await User.findById(req.user._id);
    if (user.role === "investor" && updates.entrepreneurProfile) {
      delete updates.entrepreneurProfile;
    }
    if (user.role === "entrepreneur" && updates.investorProfile) {
      delete updates.investorProfile;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { profile: updatedUser.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Any Public Profile by ID ─────────────────────────────────────────────
/**
 * @route   GET /api/profile/:id
 * @access  Private
 */
const getProfileById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Strip role-specific profile that doesn't match
    const profile = user.toPublicJSON();
    if (profile.role === "investor") {
      delete profile.entrepreneurProfile;
    } else {
      delete profile.investorProfile;
    }

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Users (with role filter & pagination) ────────────────────────────
/**
 * @route   GET /api/profile
 * @access  Private
 * @query   role, page, limit, search
 */
const getAllProfiles = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    const filter = { isActive: true };
    if (role && ["investor", "entrepreneur"].includes(role)) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "investorProfile.firmName": { $regex: search, $options: "i" } },
        { "entrepreneurProfile.startupName": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("name email role avatar bio location investorProfile entrepreneurProfile createdAt")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        profiles: users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Deactivate My Account ────────────────────────────────────────────────────
/**
 * @route   DELETE /api/profile/me
 * @access  Private
 */
const deactivateMyAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isActive: false,
      refreshToken: "",
    });

    return res.status(200).json({
      success: true,
      message: "Account deactivated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  getAllProfiles,
  deactivateMyAccount,
};