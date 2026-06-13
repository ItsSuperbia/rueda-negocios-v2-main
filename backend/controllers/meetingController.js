const Meeting = require("../models/Meeting");
const Match = require("../models/Match");
const User = require("../models/User");
const {
    MeetingBusinessError,
    getMyRegisteredEvents,
    getSupplierWorkspace,
    reserveSupplierTable,
    getBuyerMarketplace,
    reserveBuyerSession
} = require("../services/meetingService");

const isAdminRole = (role) => role === "adminSistema" || role === "adminEvento";

// 📅 Agendar reunión
exports.scheduleMeeting = async (req, res) => {
    try {
        const { matchId, startTime, endTime, location } = req.body;

        if (!matchId || !startTime || !endTime || !location) {
            return res.status(400).json({ message: "matchId, startTime, endTime y location son obligatorios" });
        }

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match no encontrado" });

        const userId = req.user.id;
        const isAdmin = isAdminRole(req.user.role);
        const isParticipant = match.supplierId.toString() === userId || match.buyerId.toString() === userId;

        if (!isAdmin && !isParticipant) {
            return res.status(403).json({ message: "No tienes permiso para agendar esta reunión" });
        }

        // Validar que el match esté aceptado
        if (match.status !== "accepted") {
            return res.status(400).json({ message: "El match debe estar aceptado para agendar cita" });
        }

        // Crear reunión
        const meeting = await Meeting.create({
            matchId,
            startTime,
            endTime,
            location,
            status: "scheduled"
        });

        // Simulación de notificación
        await sendNotification(match.supplierId, match.buyerId, meeting);

        res.status(201).json({ message: "Reunión agendada exitosamente", meeting });

    } catch (error) {
        console.error("Error agendando reunión:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 📧 Simular envío de correo
const sendNotification = async (supplierId, buyerId, meeting) => {
    const supplier = await User.findById(supplierId);
    const buyer = await User.findById(buyerId);

    console.log(`📧 [EMAIL MOCK] Enviando correo a ${supplier.email} y ${buyer.email}`);
    console.log(`📅 Asunto: Nueva reunión agendada para el ${meeting.startTime}`);
    console.log(`📍 Lugar: ${meeting.location}`);
};

exports.sendNotification = sendNotification;

const handleMeetingError = (error, res) => {
    if (error instanceof MeetingBusinessError) {
        return res.status(error.status).json({ message: error.message });
    }

    console.error("Error en módulo de reuniones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
};

exports.getRegisteredMeetingEvents = async (req, res) => {
    try {
        const eventos = await getMyRegisteredEvents(req.user);
        res.json({ data: eventos });
    } catch (error) {
        handleMeetingError(error, res);
    }
};

exports.getSupplierEventWorkspace = async (req, res) => {
    try {
        const workspace = await getSupplierWorkspace({
            user: req.user,
            eventoId: req.params.eventoId
        });
        res.json(workspace);
    } catch (error) {
        handleMeetingError(error, res);
    }
};

exports.reserveTable = async (req, res) => {
    try {
        const reservations = await reserveSupplierTable({
            user: req.user,
            eventoId: req.params.eventoId,
            tableNumber: Number(req.body.tableNumber),
            dayKeys: req.body.dayKeys
        });

        res.status(201).json({
            message: "Mesa reservada correctamente",
            reservations
        });
    } catch (error) {
        handleMeetingError(error, res);
    }
};

exports.getBuyerEventMarketplace = async (req, res) => {
    try {
        const marketplace = await getBuyerMarketplace({
            user: req.user,
            eventoId: req.params.eventoId,
            search: req.query.search ?? "",
            sector: req.query.sector ?? "todos"
        });
        res.json(marketplace);
    } catch (error) {
        handleMeetingError(error, res);
    }
};

exports.reserveSession = async (req, res) => {
    try {
        const meeting = await reserveBuyerSession({
            user: req.user,
            meetingId: req.params.meetingId
        });

        res.status(201).json({
            message: "Sesión reservada correctamente",
            meeting
        });
    } catch (error) {
        handleMeetingError(error, res);
    }
};

// 🗓️ Obtener agenda
exports.getSchedule = async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar matches del usuario
        const matches = await Match.find({
            $or: [{ supplierId: userId }, { buyerId: userId }]
        }).select('_id');

        const matchIds = matches.map(m => m._id);

        // Buscar reuniones de esos matches
        const meetings = await Meeting.find({ matchId: { $in: matchIds } })
            .populate({
                path: 'matchId',
                populate: { path: 'supplierId buyerId', select: 'nombreEmpresa email' }
            })
            .sort({ startTime: 1 });

        res.json(meetings);

    } catch (error) {
        console.error("Error obteniendo agenda:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
