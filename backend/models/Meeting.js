const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            default: "Mesa Asignada", // Puede ser número de mesa o link virtual
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled", "no_show"],
            default: "scheduled",
        },
        feedback: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
