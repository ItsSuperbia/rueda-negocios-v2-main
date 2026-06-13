const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: false,
        },
        evento: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evento",
        },
        tableReservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TableReservation",
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        tableNumber: {
            type: Number,
            min: 1,
        },
        dayKey: {
            type: String,
            trim: true,
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
            enum: ["available", "reserved", "completed", "cancelled", "scheduled", "no_show"],
            default: "scheduled",
        },
        feedback: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

meetingSchema.index(
    { evento: 1, dayKey: 1, tableNumber: 1, startTime: 1 },
    {
        unique: true,
        partialFilterExpression: { evento: { $exists: true } }
    }
);
meetingSchema.index(
    { evento: 1, buyerId: 1, startTime: 1 },
    {
        unique: true,
        partialFilterExpression: { buyerId: { $exists: true }, status: "reserved" }
    }
);
meetingSchema.index({ evento: 1, supplierId: 1, dayKey: 1 });
meetingSchema.index({ matchId: 1, startTime: 1 });

module.exports = mongoose.model("Meeting", meetingSchema);
