const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { validateTableReservation } = require("../middleware/validator");
const {
    scheduleMeeting,
    getSchedule,
    getRegisteredMeetingEvents,
    getSupplierEventWorkspace,
    reserveTable,
    getBuyerEventMarketplace,
    reserveSession
} = require("../controllers/meetingController");

router.post("/", protect, scheduleMeeting);
router.get("/", protect, getSchedule);
router.get("/eventos", protect, getRegisteredMeetingEvents);
router.get("/eventos/:eventoId/ofertante", protect, getSupplierEventWorkspace);
router.post("/eventos/:eventoId/mesas", protect, validateTableReservation, reserveTable);
router.get("/eventos/:eventoId/demandante", protect, getBuyerEventMarketplace);
router.post("/sesiones/:meetingId/reservar", protect, reserveSession);

module.exports = router;
