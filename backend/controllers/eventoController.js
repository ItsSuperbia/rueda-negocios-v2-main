const mongoose = require("mongoose");
const Evento = require("../models/Evento");
const EventoInscripcion = require("../models/EventoInscripcion");
const Meeting = require("../models/Meeting");

const empresaRoles = ["ofertante", "demandante"];

const isEmpresaRole = (role) => empresaRoles.includes(role);

const getInscripcionMetaByEventos = async (eventos, userId) => {
    if (!userId || eventos.length === 0) return new Map();

    const eventoIds = eventos.map((evento) => evento._id);
    const inscripciones = await EventoInscripcion.find({
        evento: { $in: eventoIds },
        user: userId,
        estado: "activa"
    }).lean();

    return new Map(inscripciones.map((inscripcion) => [String(inscripcion.evento), inscripcion]));
};

const withInscripcionMeta = (evento, inscripcionMap) => {
    const inscripcion = inscripcionMap.get(String(evento._id));

    return {
        ...evento,
        estaInscrito: Boolean(inscripcion),
        inscripcionEstado: inscripcion?.estado ?? null
    };
};

const buildInscripcionesResumen = (aggResults) => {
    let ofertantes = 0;
    let demandantes = 0;

    for (const row of aggResults) {
        if (row._id === "ofertante") ofertantes = row.count;
        if (row._id === "demandante") demandantes = row.count;
    }

    return { total: ofertantes + demandantes, ofertantes, demandantes };
};

const getInscripcionesStatsForEvento = async (eventoId) => {
    const eventoObjectId = new mongoose.Types.ObjectId(String(eventoId));
    const agg = await EventoInscripcion.aggregate([
        { $match: { evento: eventoObjectId, estado: "activa" } },
        { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    return buildInscripcionesResumen(agg);
};

const getInscripcionesResumenMapByEventos = async (eventoIds) => {
    if (!eventoIds.length) return new Map();

    const objectIds = eventoIds.map((id) => new mongoose.Types.ObjectId(String(id)));
    const agg = await EventoInscripcion.aggregate([
        { $match: { evento: { $in: objectIds }, estado: "activa" } },
        { $group: { _id: { evento: "$evento", role: "$role" }, count: { $sum: 1 } } }
    ]);

    const map = new Map();

    for (const eventoId of eventoIds) {
        map.set(String(eventoId), { total: 0, ofertantes: 0, demandantes: 0 });
    }

    for (const row of agg) {
        const eventoKey = String(row._id.evento);
        const resumen = map.get(eventoKey) ?? { total: 0, ofertantes: 0, demandantes: 0 };

        if (row._id.role === "ofertante") resumen.ofertantes = row.count;
        if (row._id.role === "demandante") resumen.demandantes = row.count;
        resumen.total = resumen.ofertantes + resumen.demandantes;
        map.set(eventoKey, resumen);
    }

    return map;
};

const attachInscripcionesResumen = async (eventos) => {
    if (!eventos.length) return eventos;

    const resumenMap = await getInscripcionesResumenMapByEventos(eventos.map((evento) => evento._id));

    return eventos.map((evento) => ({
        ...evento,
        inscripcionesResumen: resumenMap.get(String(evento._id)) ?? { total: 0, ofertantes: 0, demandantes: 0 }
    }));
};

const canViewEventoInscripciones = async (evento, user) => {
    if (user.role === "adminEvento" && String(evento.createdBy) === String(user.id)) {
        return true;
    }

    if (isEmpresaRole(user.role)) {
        const inscripcion = await EventoInscripcion.findOne({
            evento: evento._id,
            user: user.id,
            estado: "activa"
        }).lean();

        return Boolean(inscripcion);
    }

    return false;
};

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
        const evento = await Evento.findById(req.params.id).lean();

        if (!evento)
            return res.status(404).json({ message: "Evento no encontrado" });

        const role = req.user.role;
        const userId = req.user.id;

        const canSeeEvento =
            role === "adminSistema" ||
            (role === "adminEvento" && String(evento.createdBy) === String(userId)) ||
            (isEmpresaRole(role) && evento.estadoEvento === "aprobado");

        if (!canSeeEvento) {
            return res.status(403).json({ message: "No autorizado para ver este evento" });
        }

        if (isEmpresaRole(role)) {
            const inscripcionMap = await getInscripcionMetaByEventos([evento], userId);
            let response = withInscripcionMeta(evento, inscripcionMap);

            if (response.estaInscrito) {
                const inscripcionesResumen = await getInscripcionesStatsForEvento(evento._id);
                response = { ...response, inscripcionesResumen };
            }

            return res.json(response);
        }

        if (role === "adminEvento" && String(evento.createdBy) === String(userId)) {
            const inscripcionesResumen = await getInscripcionesStatsForEvento(evento._id);
            return res.json({ ...evento, inscripcionesResumen });
        }

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
        const eventosConResumen = await attachInscripcionesResumen(eventos);

        res.json({
            data: eventosConResumen,
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
// Catalogo de eventos para empresas
// ========================
exports.getEventosCatalogoEmpresa = async (req, res) => {
    try {
        if (!isEmpresaRole(req.user.role)) {
            return res.status(403).json({ message: "Acceso permitido solo para empresas" });
        }

        const {
            page = "1",
            limit = "6",
            search = "",
            categoria = "todos",
            modalidad = "todos",
            estado = "proximos",
            sort = "startDate"
        } = req.query;

        const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
        const limitNum = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 6));
        const now = new Date();
        const filters = { estadoEvento: "aprobado" };

        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { ciudad: { $regex: search, $options: "i" } }
            ];
        }

        if (categoria && categoria !== "todos") {
            filters.categoria = categoria;
        }

        if (modalidad && modalidad !== "todos") {
            filters.modalidad = modalidad === "hibrido" ? "mixto" : modalidad;
        }

        if (estado === "finalizados") {
            filters.endDate = { $lt: now };
        } else if (estado !== "todos") {
            filters.endDate = { $gte: now };
        }

        const sortMap = {
            recent: { createdAt: -1 },
            startDate: { startDate: 1 },
            inscriptionLimit: { fechaLimiteInscripcion: 1 }
        };
        const sortBy = sortMap[sort] ?? sortMap.startDate;

        const [total, eventos] = await Promise.all([
            Evento.countDocuments(filters),
            Evento.find(filters)
                .sort(sortBy)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean()
        ]);

        const inscripcionMap = await getInscripcionMetaByEventos(eventos, req.user.id);
        const eventosConResumen = await attachInscripcionesResumen(eventos);

        res.json({
            data: eventosConResumen.map((evento) => withInscripcionMeta(evento, inscripcionMap)),
            meta: {
                page: pageNum,
                pageSize: limitNum,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Error obteniendo catalogo de eventos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Eventos inscritos por empresa
// ========================
exports.getMisEventosInscritos = async (req, res) => {
    try {
        if (!isEmpresaRole(req.user.role)) {
            return res.status(403).json({ message: "Acceso permitido solo para empresas" });
        }

        const {
            page = "1",
            limit = "6",
            search = "",
            categoria = "todos",
            modalidad = "todos",
            estado = "todos",
            sort = "startDate"
        } = req.query;

        const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
        const limitNum = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 6));
        const now = new Date();

        const inscripciones = await EventoInscripcion.find({
            user: req.user.id,
            estado: "activa"
        }).select("evento estado").lean();
        const eventoIds = inscripciones.map((inscripcion) => inscripcion.evento);

        if (eventoIds.length === 0) {
            return res.json({
                data: [],
                meta: {
                    page: pageNum,
                    pageSize: limitNum,
                    total: 0,
                    totalPages: 0
                }
            });
        }

        const filters = {
            _id: { $in: eventoIds },
            estadoEvento: "aprobado"
        };

        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { ciudad: { $regex: search, $options: "i" } }
            ];
        }

        if (categoria && categoria !== "todos") {
            filters.categoria = categoria;
        }

        if (modalidad && modalidad !== "todos") {
            filters.modalidad = modalidad === "hibrido" ? "mixto" : modalidad;
        }

        if (estado === "proximos") {
            filters.endDate = { $gte: now };
        } else if (estado === "finalizados") {
            filters.endDate = { $lt: now };
        }

        const sortMap = {
            recent: { createdAt: -1 },
            startDate: { startDate: 1 },
            inscriptionLimit: { fechaLimiteInscripcion: 1 }
        };
        const sortBy = sortMap[sort] ?? sortMap.startDate;

        const [total, eventos] = await Promise.all([
            Evento.countDocuments(filters),
            Evento.find(filters)
                .sort(sortBy)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean()
        ]);

        const inscripcionMap = await getInscripcionMetaByEventos(eventos, req.user.id);
        const eventosConResumen = await attachInscripcionesResumen(eventos);

        res.json({
            data: eventosConResumen.map((evento) => withInscripcionMeta(evento, inscripcionMap)),
            meta: {
                page: pageNum,
                pageSize: limitNum,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Error obteniendo eventos inscritos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Inscripcion de empresa a evento
// ========================
exports.inscribirseEvento = async (req, res) => {
    try {
        if (!isEmpresaRole(req.user.role)) {
            return res.status(403).json({ message: "Acceso permitido solo para empresas" });
        }

        const evento = await Evento.findById(req.params.id);

        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }

        if (evento.estadoEvento !== "aprobado") {
            return res.status(400).json({ message: "Solo puedes inscribirte a eventos aprobados" });
        }

        const now = new Date();

        if (evento.endDate < now) {
            return res.status(400).json({ message: "El evento ya finalizó" });
        }

        if (evento.fechaLimiteInscripcion) {
            const limite = new Date(evento.fechaLimiteInscripcion);
            limite.setHours(23, 59, 59, 999);

            if (limite < now) {
                return res.status(400).json({ message: "La fecha límite de inscripción ya pasó" });
            }
        }

        const inscripcionExistente = await EventoInscripcion.findOne({
            evento: evento._id,
            user: req.user.id
        });

        if (inscripcionExistente?.estado === "activa") {
            return res.json({
                message: "Ya estás inscrito en este evento",
                evento: withInscripcionMeta(evento.toObject(), new Map([[String(evento._id), inscripcionExistente.toObject()]]))
            });
        }

        const eventoActualizado = await Evento.findOneAndUpdate(
            {
                _id: evento._id,
                estadoEvento: "aprobado",
                inscritos: { $lt: evento.cupos }
            },
            { $inc: { inscritos: 1 } },
            { new: true }
        );

        if (!eventoActualizado) {
            return res.status(400).json({ message: "El evento no tiene cupos disponibles" });
        }

        let inscripcion;

        try {
            if (inscripcionExistente) {
                inscripcionExistente.estado = "activa";
                inscripcionExistente.fechaCancelacion = undefined;
                inscripcionExistente.role = req.user.role;
                inscripcion = await inscripcionExistente.save();
            } else {
                inscripcion = await EventoInscripcion.create({
                    evento: evento._id,
                    user: req.user.id,
                    role: req.user.role,
                    estado: "activa"
                });
            }
        } catch (error) {
            await Evento.updateOne({ _id: evento._id, inscritos: { $gt: 0 } }, { $inc: { inscritos: -1 } });

            if (error.code === 11000) {
                return res.status(409).json({ message: "Ya existe una inscripción para este evento" });
            }

            throw error;
        }

        res.status(201).json({
            message: "Inscripción realizada correctamente",
            evento: withInscripcionMeta(eventoActualizado.toObject(), new Map([[String(evento._id), inscripcion.toObject()]]))
        });
    } catch (error) {
        console.error("Error inscribiendo al evento:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Cancelar inscripcion de empresa
// ========================
exports.cancelarInscripcionEvento = async (req, res) => {
    try {
        if (!isEmpresaRole(req.user.role)) {
            return res.status(403).json({ message: "Acceso permitido solo para empresas" });
        }

        const inscripcion = await EventoInscripcion.findOne({
            evento: req.params.id,
            user: req.user.id,
            estado: "activa"
        });

        if (!inscripcion) {
            return res.status(404).json({ message: "No tienes una inscripción activa para este evento" });
        }

        inscripcion.estado = "cancelada";
        inscripcion.fechaCancelacion = new Date();
        await inscripcion.save();

        const evento = await Evento.findOneAndUpdate(
            { _id: req.params.id, inscritos: { $gt: 0 } },
            { $inc: { inscritos: -1 } },
            { new: true }
        ).lean();

        res.json({
            message: "Inscripción cancelada correctamente",
            evento: evento ? { ...evento, estaInscrito: false, inscripcionEstado: null } : null
        });
    } catch (error) {
        console.error("Error cancelando inscripción:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Inscripciones de un evento (listado por rol)
// ========================
exports.getEventoInscripciones = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id).lean();

        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }

        const authorized = await canViewEventoInscripciones(evento, req.user);

        if (!authorized) {
            return res.status(403).json({ message: "No autorizado para ver las inscripciones de este evento" });
        }

        const { role = "todos", page = "1", limit = "10" } = req.query;
        const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 10));

        const filters = { evento: evento._id, estado: "activa" };

        if (role === "ofertante" || role === "demandante") {
            filters.role = role;
        }

        const [stats, total, inscripciones] = await Promise.all([
            getInscripcionesStatsForEvento(evento._id),
            EventoInscripcion.countDocuments(filters),
            EventoInscripcion.find(filters)
                .populate("user", "nombreEmpresa sector logoEmpresa")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean()
        ]);

        res.json({
            stats,
            data: inscripciones,
            meta: {
                page: pageNum,
                pageSize: limitNum,
                total,
                totalPages: total === 0 ? 0 : Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("Error obteniendo inscripciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ========================
// Resumen de eventos para dashboard empresa
// ========================
exports.getEmpresaEventosResumen = async (req, res) => {
    try {
        if (!isEmpresaRole(req.user.role)) {
            return res.status(403).json({ message: "Acceso permitido solo para empresas" });
        }

        const inscripciones = await EventoInscripcion.find({
            user: req.user.id,
            estado: "activa"
        }).select("evento").lean();

        const eventoIds = inscripciones.map((inscripcion) => inscripcion.evento);
        const eventosInscritos = eventoIds.length;

        if (eventoIds.length === 0) {
            return res.json({
                eventosInscritos: 0,
                totalParticipantes: 0,
                proximoEvento: null
            });
        }

        const resumenMap = await getInscripcionesResumenMapByEventos(eventoIds);
        let totalParticipantes = 0;

        for (const resumen of resumenMap.values()) {
            totalParticipantes += resumen.total;
        }

        const now = new Date();
        const proximoEventoDoc = await Evento.findOne({
            _id: { $in: eventoIds },
            estadoEvento: "aprobado",
            startDate: { $gte: now }
        })
            .sort({ startDate: 1 })
            .select("title startDate endDate cupos inscritos")
            .lean();

        const proximoEvento = proximoEventoDoc
            ? {
                ...proximoEventoDoc,
                inscripcionesResumen: resumenMap.get(String(proximoEventoDoc._id)) ?? {
                    total: 0,
                    ofertantes: 0,
                    demandantes: 0
                }
            }
            : null;

        res.json({
            eventosInscritos,
            totalParticipantes,
            proximoEvento
        });
    } catch (error) {
        console.error("Error obteniendo resumen de eventos empresa:", error);
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
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const adminEventoIds = await Evento.find({ createdBy: userId }).select("_id").lean();
        const eventoIds = adminEventoIds.map((evento) => evento._id);

        const [eventosActivos, totalInscritosAgg, roleAgg, reunionesGeneradas, proximoEvento, recientes] = await Promise.all([
            Evento.countDocuments({
                createdBy: userId,
                estadoEvento: "aprobado",
                endDate: { $gte: now }
            }),
            Evento.aggregate([
                { $match: { createdBy: userObjectId } },
                { $group: { _id: null, total: { $sum: "$inscritos" } } }
            ]),
            eventoIds.length > 0
                ? EventoInscripcion.aggregate([
                    { $match: { evento: { $in: eventoIds }, estado: "activa" } },
                    { $group: { _id: "$role", count: { $sum: 1 } } }
                ])
                : Promise.resolve([]),
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

        const roleResumen = buildInscripcionesResumen(roleAgg);
        const recientesConResumen = await attachInscripcionesResumen(recientes);

        res.json({
            stats: {
                eventosActivos,
                totalInscritos: totalInscritosAgg[0]?.total ?? 0,
                totalOfertantes: roleResumen.ofertantes,
                totalDemandantes: roleResumen.demandantes,
                reunionesGeneradas,
                proximoEvento: proximoEvento ?? null
            },
            recientes: recientesConResumen
        });
    } catch (error) {
        console.error("Error obteniendo dashboard adminEvento:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
