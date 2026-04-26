const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  getAllProfiles,
  deactivateMyAccount,
} = require("../controllers/profile.controller");

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { updateProfileValidator, mongoIdValidator } = require("../validators/auth.validator");

// All profile routes require authentication
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get all user profiles (with optional filters)
 *     tags: [Profile]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [investor, entrepreneur]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of profiles with pagination
 */
router.get("/", getAllProfiles);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get my own profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Current user's profile
 */
router.get("/me", getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Profile]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               investorProfile:
 *                 type: object
 *               entrepreneurProfile:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/me", updateProfileValidator, validate, updateMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   delete:
 *     summary: Deactivate my account
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Account deactivated
 */
router.delete("/me", deactivateMyAccount);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get a public profile by user ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
router.get("/:id", mongoIdValidator("id"), validate, getProfileById);

module.exports = router;