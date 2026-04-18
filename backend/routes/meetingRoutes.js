const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { scheduleMeeting, getSchedule } = require("../controllers/meetingController");

router.post("/", protect, scheduleMeeting);
router.get("/", protect, getSchedule);

module.exports = router;
