const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { generateMatches, getMyMatches, updateMatchStatus } = require("../controllers/matchController");

router.post("/generate", protect, adminOnly, generateMatches);
router.get("/", protect, getMyMatches);
router.put("/status", protect, updateMatchStatus);

module.exports = router;
