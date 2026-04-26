// backend/src/routes/meetingRoutes.js
const express = require("express");
const router  = express.Router();

const {
  scheduleMeeting,
  getMyMeetings,
  getMeetingById,
  updateMeetingStatus,
  deleteMeeting,
  getAllUsers,
} = require("../controllers/meetingController");

const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.use(protect);

router.get("/users",        getAllUsers);          // GET  /api/meetings/users
router.get("/",             getMyMeetings);        // GET  /api/meetings
router.post("/",            scheduleMeeting);      // POST /api/meetings
router.get("/:id",          getMeetingById);       // GET  /api/meetings/:id
router.patch("/:id/status", updateMeetingStatus);  // PATCH /api/meetings/:id/status
router.delete("/:id",       deleteMeeting);        // DELETE /api/meetings/:id

module.exports = router;