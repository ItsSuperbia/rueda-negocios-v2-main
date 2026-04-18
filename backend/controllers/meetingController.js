const Meeting = require("../models/Meeting");
const Match = require("../models/Match");
const User = require("../models/User");

// 📅 Agendar reunión
exports.scheduleMeeting = async (req, res) => {
    try {
        const { matchId, startTime, endTime, location } = req.body;

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match no encontrado" });

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
        await this.sendNotification(match.supplierId, match.buyerId, meeting);

        res.status(201).json({ message: "Reunión agendada exitosamente", meeting });

    } catch (error) {
        console.error("Error agendando reunión:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 📧 Simular envío de correo
exports.sendNotification = async (supplierId, buyerId, meeting) => {
    const supplier = await User.findById(supplierId);
    const buyer = await User.findById(buyerId);

    console.log(`📧 [EMAIL MOCK] Enviando correo a ${supplier.email} y ${buyer.email}`);
    console.log(`📅 Asunto: Nueva reunión agendada para el ${meeting.startTime}`);
    console.log(`📍 Lugar: ${meeting.location}`);
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
