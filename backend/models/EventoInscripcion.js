const mongoose = require("mongoose");

const eventoInscripcionSchema = new mongoose.Schema(
    {
        evento: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evento",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ["ofertante", "demandante"],
            required: true
        },
        estado: {
            type: String,
            enum: ["activa", "cancelada"],
            default: "activa"
        },
        fechaCancelacion: {
            type: Date
        }
    },
    { timestamps: true }
);

eventoInscripcionSchema.index({ evento: 1, user: 1 }, { unique: true });
eventoInscripcionSchema.index({ user: 1, estado: 1 });
eventoInscripcionSchema.index({ evento: 1, estado: 1 });

module.exports = mongoose.model("EventoInscripcion", eventoInscripcionSchema);
