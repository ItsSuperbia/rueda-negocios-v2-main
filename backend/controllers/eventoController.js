const Evento = require("../models/Evento");

exports.crearEvento = async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            durationDays,
            location,
            modalidad,
            cupos,
            valorInscripcion,
            enfoque
        } = req.body;

        const evento = await Evento.create({
            createdBy: req.user.id,
            title,
            description,
            startDate,
            endDate,
            durationDays,
            location,
            modalidad,
            cupos,
            valorInscripcion,
            enfoque,
            estadoEvento: "pendiente"
        });

        res.status(201).json({
            message: "Evento creado",
            evento
        });

    } catch (error) {
        console.error("Error creando evento:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Eventos pendientes
// ========================
exports.getEventosPendientes = async (req, res) => {
    try {
        const eventos = await Evento.find({ estadoEvento: "pendiente" });

        res.json(eventos);
    } catch (error) {
        console.error("Error obteniendo eventos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Detalle de evento
// ========================
exports.getEventoById = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);

        if (!evento)
            return res.status(404).json({ message: "Evento no encontrado" });

        res.json(evento);
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
};

// ========================
// Cambiar estado evento
// ========================
exports.cambiarEstadoEvento = async (req, res) => {
    try {
        const { estado } = req.body;

        if (!["aprobado", "rechazado"].includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        const evento = await Evento.findById(req.params.id);
        if (!evento)
            return res.status(404).json({ message: "Evento no encontrado" });

        evento.estadoEvento = estado;
        await evento.save();

        res.json({
            message: `Evento ${estado}`,
            evento
        });

    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ message: "Error interno" });
    }
};
