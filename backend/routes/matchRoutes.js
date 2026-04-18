const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateMatches, getMyMatches, updateMatchStatus } = require("../controllers/matchController");

router.post("/generate", protect, generateMatches); // Idealmente solo admin
router.get("/", protect, getMyMatches);
router.put("/status", protect, updateMatchStatus);

module.exports = router;
