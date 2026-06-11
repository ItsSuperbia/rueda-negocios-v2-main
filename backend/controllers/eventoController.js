const mongoose = require("mongoose");
const Evento = require("../models/Evento");
const Meeting = require("../models/Meeting");

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
            enfoque,
            categoria,
            fechaLimiteInscripcion,
            horaInicio,
            horaFin,
            duracionReunionMin,
            mesas,
            esGratis,
            descuentoEarlyBird,
            emailContacto,
            telefonoContacto,
            organizador,
            ciudad,
            pais,
            linkVirtual
        } = req.body;
        const esBorrador = req.body.esBorrador === true || req.body.esBorrador === "true";

        const categoriaFinal = categoria || enfoque;
        const enfoqueFinal = enfoque || categoriaFinal;
        const modalidadFinal = modalidad === "hibrido" ? "mixto" : modalidad;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const limiteObj = fechaLimiteInscripcion ? new Date(fechaLimiteInscripcion) : null;
        const cuposNum = Number(cupos);
        const mesasNum = typeof mesas === "undefined" || mesas === null || mesas === "" ? null : Number(mesas);
        const duracionReunion = duracionReunionMin ? Number(duracionReunionMin) : 30;
        const esGratisBool = esGratis === true || esGratis === "true";
        const valorNum = Number(valorInscripcion);
        const descuentoNum = descuentoEarlyBird ? Number(descuentoEarlyBird) : 0;

        if (!title || !description || !startDate || !endDate || !location || !modalidadFinal || !categoriaFinal || !emailContacto) {
            return res.status(400).json({ message: "Faltan campos obligatorios para crear el evento" });
        }

        if (!["presencial", "virtual", "mixto"].includes(modalidadFinal)) {
            return res.status(400).json({ message: "Modalidad inválida" });
        }

        if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(endDateObj.getTime())) {
            return res.status(400).json({ message: "Fechas de inicio o fin inválidas" });
        }

        if (endDateObj < startDateObj) {
            return res.status(400).json({ message: "La fecha de finalización debe ser posterior a la fecha de inicio" });
        }

        if (limiteObj && Number.isNaN(limiteObj.getTime())) {
            return res.status(400).json({ message: "La fecha límite de inscripción es inválida" });
        }

        if (limiteObj && limiteObj > startDateObj) {
            return res.status(400).json({ message: "La fecha límite debe ser anterior o igual a la fecha de inicio" });
        }

        if (!Number.isFinite(cuposNum) || cuposNum < 10) {
            return res.status(400).json({ message: "Los cupos deben ser al menos 10" });
        }

        if (mesasNum !== null && (!Number.isFinite(mesasNum) || mesasNum < 1)) {
            return res.status(400).json({ message: "El número de mesas debe ser al menos 1" });
        }

        if ((modalidadFinal === "virtual" || modalidadFinal === "mixto") && !linkVirtual) {
            return res.status(400).json({ message: "Debe incluir un link virtual para esta modalidad" });
        }

        if (!esGratisBool && (!Number.isFinite(valorNum) || valorNum <= 0)) {
            return res.status(400).json({ message: "El valor de inscripción es obligatorio" });
        }

        const durationDaysNum = Number(durationDays);
        const durationDaysFinal = Number.isFinite(durationDaysNum) && durationDaysNum > 0
            ? durationDaysNum
            : Math.max(1, Math.floor((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1);

        const evento = await Evento.create({
            createdBy: req.user.id,
            title,
            description,
            startDate,
            endDate,
            durationDays: durationDaysFinal,
            location,
            modalidad: modalidadFinal,
            cupos: cuposNum,
            valorInscripcion: esGratisBool ? 0 : valorNum,
            enfoque: enfoqueFinal,
            categoria: categoriaFinal,
            fechaLimiteInscripcion: limiteObj,
            horaInicio,
            horaFin,
            duracionReunionMin: duracionReunion,
            mesas: mesasNum ?? 0,
            esGratis: esGratisBool,
            descuentoEarlyBird: descuentoNum,
            emailContacto,
            telefonoContacto,
            organizador,
            ciudad,
            pais,
            linkVirtual,
            estadoEvento: esBorrador ? "borrador" : "pendiente"
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

// ========================
// Eventos adminEvento (listado con filtros)
// ========================
exports.getAdminEventos = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            page = "1",
            limit = "6",
            estado = "todos",
            search = "",
            sort = "recent"
        } = req.query;

        const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
        const limitNum = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 6));
        const filters = { createdBy: userId };

        if (search) {
            filters.title = { $regex: search, $options: "i" };
        }

        const now = new Date();

        switch (estado) {
            case "pendiente":
                filters.estadoEvento = "pendiente";
                break;
            case "activo":
                filters.estadoEvento = "aprobado";
                filters.endDate = { $gte: now };
                break;
            case "finalizado":
                filters.estadoEvento = "aprobado";
                filters.endDate = { $lt: now };
                break;
            case "cancelado":
                filters.estadoEvento = "rechazado";
                break;
            case "borrador":
                filters.estadoEvento = "borrador";
                break;
            case "aprobado":
            case "rechazado":
                filters.estadoEvento = estado;
                break;
            default:
                break;
        }

        const sortMap = {
            recent: { createdAt: -1 },
            oldest: { createdAt: 1 },
            startDate: { startDate: 1 }
        };

        const sortBy = sortMap[sort] ?? sortMap.recent;

        const [total, eventos] = await Promise.all([
            Evento.countDocuments(filters),
            Evento.find(filters)
                .sort(sortBy)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean()
        ]);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);

        res.json({
            data: eventos,
            meta: {
                page: pageNum,
                pageSize: limitNum,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error("Error obteniendo eventos adminEvento:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Dashboard adminEvento
// ========================
exports.getAdminEventoDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        const [eventosActivos, totalInscritosAgg, reunionesGeneradas, proximoEvento, recientes] = await Promise.all([
            Evento.countDocuments({
                createdBy: userId,
                estadoEvento: "aprobado",
                endDate: { $gte: now }
            }),
            Evento.aggregate([
                { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, total: { $sum: "$inscritos" } } }
            ]),
            Meeting.countDocuments(),
            Evento.findOne({
                createdBy: userId,
                estadoEvento: "aprobado",
                startDate: { $gte: now }
            })
                .sort({ startDate: 1 })
                .select("title startDate endDate cupos inscritos estadoEvento enfoque categoria modalidad")
                .lean(),
            Evento.find({ createdBy: userId })
                .sort({ createdAt: -1 })
                .limit(4)
                .select("title startDate endDate cupos inscritos estadoEvento enfoque categoria modalidad")
                .lean()
        ]);

        res.json({
            stats: {
                eventosActivos,
                totalInscritos: totalInscritosAgg[0]?.total ?? 0,
                reunionesGeneradas,
                proximoEvento: proximoEvento ?? null
            },
            recientes
        });
    } catch (error) {
        console.error("Error obteniendo dashboard adminEvento:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
