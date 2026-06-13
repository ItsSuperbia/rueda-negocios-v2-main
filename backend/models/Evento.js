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

        categoria: { type: String, default: "" },
        fechaLimiteInscripcion: { type: Date },
        horaInicio: { type: String, default: "" },
        horaFin: { type: String, default: "" },
        duracionReunionMin: { type: Number, default: 30 },
        mesas: { type: Number, default: 0 },
        esGratis: { type: Boolean, default: true },
        descuentoEarlyBird: { type: Number, default: 0 },
        emailContacto: { type: String, default: "" },
        telefonoContacto: { type: String, default: "" },
        organizador: { type: String, default: "" },
        ciudad: { type: String, default: "" },
        pais: { type: String, default: "Colombia" },
        linkVirtual: { type: String, default: "" },

        modalidad: { 
            type: String, 
            enum: ["presencial", "virtual", "mixto"],
            required: true 
        },

        cupos: { type: Number, required: true },
        inscritos: { type: Number, default: 0 },
        valorInscripcion: { type: Number, required: true },

        enfoque: { type: String, required: true },

        estadoEvento: {
            type: String,
            enum: ["borrador", "pendiente", "aprobado", "rechazado"],
            default: "pendiente"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Evento", eventoSchema);
