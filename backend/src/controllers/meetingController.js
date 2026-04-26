// backend/src/controllers/meetingController.js
const Meeting = require("../models/Meeting");
const User    = require("../models/User");

// ── Helper: check time conflict for a user ────────────────────────────────────
const hasConflict = async (userId, date, startTime, endTime, excludeId = null) => {
  const query = {
    date: new Date(date),
    status: { $in: ["pending", "accepted"] },
    $or: [{ organizer: userId }, { attendee: userId }],
    $and: [
      { startTime: { $lt: endTime } },
      { endTime:   { $gt: startTime } },
    ],
  };
  if (excludeId) query._id = { $ne: excludeId };
  const conflict = await Meeting.findOne(query);
  return !!conflict;
};

// ── @POST /api/meetings  — Schedule a meeting ─────────────────────────────────
const scheduleMeeting = async (req, res) => {
  try {
    const { title, description, attendeeId, date, startTime, endTime, notes } = req.body;
    const organizerId = req.user._id;

    // Basic validation
    if (!title || !attendeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: "Start time must be before end time." });
    }

    // Check attendee exists
    const attendee = await User.findById(attendeeId);
    if (!attendee) {
      return res.status(404).json({ success: false, message: "Attendee not found." });
    }

    // Conflict detection — both organizer and attendee
    const organizerConflict = await hasConflict(organizerId, date, startTime, endTime);
    if (organizerConflict) {
      return res.status(409).json({ success: false, message: "You already have a meeting at this time." });
    }

    const attendeeConflict = await hasConflict(attendeeId, date, startTime, endTime);
    if (attendeeConflict) {
      return res.status(409).json({ success: false, message: "The attendee already has a meeting at this time." });
    }

    const meeting = await Meeting.create({
      title,
      description,
      organizer: organizerId,
      attendee:  attendeeId,
      date:      new Date(date),
      startTime,
      endTime,
      notes,
    });

    await meeting.populate(["organizer", "attendee"], "name email role");

    res.status(201).json({ success: true, message: "Meeting scheduled successfully.", data: meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/meetings  — Get my meetings ────────────────────────────────────
const getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, from, to } = req.query;

    const filter = {
      $or: [{ organizer: userId }, { attendee: userId }],
    };

    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const meetings = await Meeting.find(filter)
      .populate("organizer", "name email role")
      .populate("attendee",  "name email role")
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/meetings/:id  — Get single meeting ─────────────────────────────
const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("organizer", "name email role")
      .populate("attendee",  "name email role");

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    // Only organizer or attendee can view
    const userId = req.user._id.toString();
    if (meeting.organizer._id.toString() !== userId && meeting.attendee._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @PATCH /api/meetings/:id/status  — Accept or Reject ──────────────────────
const updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id.toString();

    if (!["accepted", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    // Only attendee can accept/reject; organizer can cancel
    if (status === "cancelled" && meeting.organizer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the organizer can cancel." });
    }
    if (["accepted", "rejected"].includes(status) && meeting.attendee.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the attendee can accept or reject." });
    }

    meeting.status = status;
    await meeting.save();
    await meeting.populate(["organizer", "attendee"], "name email role");

    res.json({ success: true, message: `Meeting ${status}.`, data: meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @DELETE /api/meetings/:id  — Delete a meeting ────────────────────────────
const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    if (meeting.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the organizer can delete this meeting." });
    }

    await meeting.deleteOne();
    res.json({ success: true, message: "Meeting deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/meetings/users  — Get all users to invite ──────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("name email role");
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  scheduleMeeting,
  getMyMeetings,
  getMeetingById,
  updateMeetingStatus,
  deleteMeeting,
  getAllUsers,
};