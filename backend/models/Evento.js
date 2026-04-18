const mongoose = require("mongoose");

const eventoSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: { type: String, required: true },
        description: { type: String, required: true },

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        durationDays: { type: Number, required: true },

        location: { type: String, required: true },

        modalidad: { 
            type: String, 
            enum: ["presencial", "virtual", "mixto"],
            required: true 
        },

        cupos: { type: Number, required: true },
        valorInscripcion: { type: Number, required: true },

        enfoque: { type: String, required: true },

        estadoEvento: {
            type: String,
            enum: ["pendiente", "aprobado", "rechazado"],
            default: "pendiente"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Evento", eventoSchema);
