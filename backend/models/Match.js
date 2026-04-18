const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
    {
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        score: {
            type: Number,
            default: 0, // Puntuación de afinidad
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Evitar duplicados de pares
matchSchema.index({ supplierId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);
