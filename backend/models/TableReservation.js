const mongoose = require("mongoose");

const tableReservationSchema = new mongoose.Schema(
    {
        evento: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evento",
            required: true
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        tableNumber: {
            type: Number,
            required: true,
            min: 1
        },
        dayKey: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["reserved", "cancelled"],
            default: "reserved"
        }
    },
    { timestamps: true }
);

tableReservationSchema.index(
    { evento: 1, dayKey: 1, tableNumber: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "reserved" }
    }
);
tableReservationSchema.index(
    { evento: 1, dayKey: 1, supplierId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "reserved" }
    }
);
tableReservationSchema.index({ evento: 1, supplierId: 1, status: 1 });

module.exports = mongoose.model("TableReservation", tableReservationSchema);
