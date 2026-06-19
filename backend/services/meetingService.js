const Evento = require("../models/Evento");
const EventoInscripcion = require("../models/EventoInscripcion");
const Match = require("../models/Match");
const Meeting = require("../models/Meeting");
const TableReservation = require("../models/TableReservation");

class MeetingBusinessError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = "MeetingBusinessError";
        this.status = status;
    }
}

const empresaRoles = ["ofertante", "demandante"];

const isEmpresaRole = (role) => empresaRoles.includes(role);

const toDateKey = (date) => {
    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const parseTime = (value) => {
    if (!value || typeof value !== "string") return null;
    const [hoursRaw, minutesRaw] = value.split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return { hours, minutes };
};

const buildDateAtTime = (dayKey, time) => {
    const [year, month, day] = dayKey.split("-").map(Number);
    return new Date(year, month - 1, day, time.hours, time.minutes, 0, 0);
};

const getEventDays = (evento) => {
    const start = new Date(evento.startDate);
    const end = new Date(evento.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const days = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        days.push({
            key: toDateKey(cursor),
            label: cursor.toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long"
            })
        });
        cursor.setDate(cursor.getDate() + 1);
    }

    return days;
};

const getSlotTimesForDay = (evento, dayKey) => {
    const startTime = parseTime(evento.horaInicio);
    const endTime = parseTime(evento.horaFin);
    const duration = Number(evento.duracionReunionMin || 30);

    if (!startTime || !endTime || !Number.isFinite(duration) || duration <= 0) {
        throw new MeetingBusinessError("El evento no tiene configuración de agenda válida", 400);
    }

    const eventStart = buildDateAtTime(dayKey, startTime);
    const eventEnd = buildDateAtTime(dayKey, endTime);

    if (eventEnd <= eventStart) {
        throw new MeetingBusinessError("La hora final debe ser posterior a la hora inicial", 400);
    }

    const slots = [];
    const cursor = new Date(eventStart);

    while (cursor.getTime() + duration * 60000 <= eventEnd.getTime()) {
        const startTimeDate = new Date(cursor);
        const endTimeDate = new Date(cursor.getTime() + duration * 60000);
        slots.push({ startTime: startTimeDate, endTime: endTimeDate });
        cursor.setMinutes(cursor.getMinutes() + duration);
    }

    return slots;
};

const formatTime = (date) =>
    new Date(date).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

const canCancelBeforeWindow = (startTime) => {
    const start = new Date(startTime);
    return !Number.isNaN(start.getTime()) && start.getTime() - Date.now() >= CANCELLATION_WINDOW_MS;
};

const isEventStarted = (evento) => {
    const start = new Date(evento.startDate);
    return !Number.isNaN(start.getTime()) && start.getTime() <= Date.now();
};

const assertEmpresaRole = (user) => {
    if (!isEmpresaRole(user.role)) {
        throw new MeetingBusinessError("Acceso permitido solo para empresas", 403);
    }
};

const assertRole = (user, role) => {
    if (user.role !== role) {
        throw new MeetingBusinessError(`Acceso permitido solo para empresas ${role}s`, 403);
    }
};

const getApprovedEvento = async (eventoId) => {
    const evento = await Evento.findById(eventoId).lean();

    if (!evento) {
        throw new MeetingBusinessError("Evento no encontrado", 404);
    }

    if (evento.estadoEvento !== "aprobado") {
        throw new MeetingBusinessError("El evento no está aprobado", 400);
    }

    return evento;
};

const assertActiveInscription = async (eventoId, userId, role) => {
    const inscripcion = await EventoInscripcion.findOne({
        evento: eventoId,
        user: userId,
        role,
        estado: "activa"
    }).lean();

    if (!inscripcion) {
        throw new MeetingBusinessError("Debes estar inscrito en el evento para gestionar reuniones", 403);
    }

    return inscripcion;
};

const getMeetingStatus = (meeting) => {
    if (!meeting) return "available";
    if (meeting.status === "completed") return "completed";
    if (meeting.status === "cancelled") return "cancelled";
    if (meeting.buyerId || meeting.status === "reserved") return "reserved";
    return "available";
};

const normalizeMeeting = (meeting) => {
    if (!meeting) return null;

    const supplier = meeting.supplierId;
    const buyer = meeting.buyerId;

    return {
        _id: String(meeting._id),
        evento: String(meeting.evento),
        tableReservation: meeting.tableReservation ? String(meeting.tableReservation) : null,
        supplierId: supplier?._id ? String(supplier._id) : String(supplier),
        buyerId: buyer?._id ? String(buyer._id) : buyer ? String(buyer) : null,
        tableNumber: meeting.tableNumber,
        dayKey: meeting.dayKey,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        location: meeting.location,
        status: getMeetingStatus(meeting),
        supplier: supplier?._id
            ? {
                _id: String(supplier._id),
                nombreEmpresa: supplier.nombreEmpresa,
                logoEmpresa: supplier.logoEmpresa,
                sector: supplier.sector
            }
            : null,
        buyer: buyer?._id
            ? {
                _id: String(buyer._id),
                nombreEmpresa: buyer.nombreEmpresa,
                logoEmpresa: buyer.logoEmpresa,
                sector: buyer.sector
            }
            : null
    };
};

const buildEventConfig = (evento) => {
    const days = getEventDays(evento);
    const tableCount = Number(evento.mesas || 0);
    const tables = Array.from({ length: Math.max(0, tableCount) }, (_, index) => index + 1);
    const slotsPerDay = days.reduce((acc, day) => {
        acc[day.key] = getSlotTimesForDay(evento, day.key).map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            label: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
        }));
        return acc;
    }, {});

    return {
        evento,
        days,
        tables,
        slotsPerDay
    };
};

const getMyRegisteredEvents = async (user) => {
    assertEmpresaRole(user);

    const inscripciones = await EventoInscripcion.find({
        user: user.id,
        role: user.role,
        estado: "activa"
    }).select("evento").lean();

    const eventoIds = inscripciones.map((inscripcion) => inscripcion.evento);

    if (!eventoIds.length) return [];

    return Evento.find({
        _id: { $in: eventoIds },
        estadoEvento: "aprobado"
    })
        .sort({ startDate: 1 })
        .lean();
};

const getSupplierWorkspace = async ({ user, eventoId }) => {
    assertRole(user, "ofertante");
    const evento = await getApprovedEvento(eventoId);
    await assertActiveInscription(evento._id, user.id, "ofertante");

    const config = buildEventConfig(evento);
    const reservations = await TableReservation.find({
        evento: evento._id,
        status: "reserved"
    })
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .lean();

    const meetings = await Meeting.find({
        evento: evento._id,
        status: { $in: ["available", "reserved", "completed", "cancelled"] }
    })
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .populate("buyerId", "nombreEmpresa logoEmpresa sector")
        .sort({ startTime: 1, tableNumber: 1 })
        .lean();

    const reservationsByDayTable = new Map(
        reservations.map((reservation) => [`${reservation.dayKey}:${reservation.tableNumber}`, reservation])
    );
    const meetingsByDayTableStart = new Map(
        meetings.map((meeting) => [`${meeting.dayKey}:${meeting.tableNumber}:${new Date(meeting.startTime).toISOString()}`, meeting])
    );

    const matrix = config.days.map((day) => ({
        ...day,
        rows: (config.slotsPerDay[day.key] ?? []).map((slot) => ({
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
            tables: config.tables.map((tableNumber) => {
                const reservation = reservationsByDayTable.get(`${day.key}:${tableNumber}`);
                const meeting = meetingsByDayTableStart.get(`${day.key}:${tableNumber}:${slot.startTime.toISOString()}`);
                const isMine = reservation && String(reservation.supplierId?._id ?? reservation.supplierId) === String(user.id);

                return {
                    tableNumber,
                    status: reservation ? "reserved" : "available",
                    reservedByMe: Boolean(isMine),
                    supplier: reservation?.supplierId?._id
                        ? {
                            _id: String(reservation.supplierId._id),
                            nombreEmpresa: reservation.supplierId.nombreEmpresa,
                            logoEmpresa: reservation.supplierId.logoEmpresa,
                            sector: reservation.supplierId.sector
                        }
                        : null,
                    meeting: normalizeMeeting(meeting)
                };
            })
        }))
    }));

    const myReservations = reservations
        .filter((reservation) => String(reservation.supplierId?._id ?? reservation.supplierId) === String(user.id))
        .map((reservation) => ({
            _id: String(reservation._id),
            evento: String(reservation.evento),
            tableNumber: reservation.tableNumber,
            dayKey: reservation.dayKey,
            status: reservation.status,
            supplier: reservation.supplierId?._id
                ? {
                    _id: String(reservation.supplierId._id),
                    nombreEmpresa: reservation.supplierId.nombreEmpresa,
                    logoEmpresa: reservation.supplierId.logoEmpresa,
                    sector: reservation.supplierId.sector
                }
                : null
        }))
        .sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.tableNumber - b.tableNumber);

    return {
        ...config,
        reservations: reservations.map((reservation) => ({
            _id: String(reservation._id),
            evento: String(reservation.evento),
            tableNumber: reservation.tableNumber,
            dayKey: reservation.dayKey,
            status: reservation.status,
            supplier: reservation.supplierId?._id
                ? {
                    _id: String(reservation.supplierId._id),
                    nombreEmpresa: reservation.supplierId.nombreEmpresa,
                    logoEmpresa: reservation.supplierId.logoEmpresa,
                    sector: reservation.supplierId.sector
                }
                : null
        })),
        myReservations,
        matrix
    };
};

const reserveSupplierTable = async ({ user, eventoId, tableNumber, dayKeys }) => {
    assertRole(user, "ofertante");
    const evento = await getApprovedEvento(eventoId);
    await assertActiveInscription(evento._id, user.id, "ofertante");

    const config = buildEventConfig(evento);
    const validDays = new Set(config.days.map((day) => day.key));
    const normalizedDays = [...new Set(dayKeys)].filter((dayKey) => validDays.has(dayKey));
    const tableCount = Number(evento.mesas || 0);

    if (!tableCount || tableNumber < 1 || tableNumber > tableCount) {
        throw new MeetingBusinessError("La mesa seleccionada no existe en el evento", 400);
    }

    if (!normalizedDays.length) {
        throw new MeetingBusinessError("Selecciona al menos un día válido del evento", 400);
    }

    const createdReservations = [];
    const createdReservationIds = [];

    try {
        const occupiedByOtherTable = await TableReservation.findOne({
            evento: evento._id,
            supplierId: user.id,
            dayKey: { $in: normalizedDays },
            tableNumber: { $ne: tableNumber },
            status: "reserved"
        });

        if (occupiedByOtherTable) {
            throw new MeetingBusinessError("No puedes ocupar más de una mesa el mismo día en este evento", 409);
        }

        for (const dayKey of normalizedDays) {
            const reservationDoc = await TableReservation.create({
                evento: evento._id,
                supplierId: user.id,
                tableNumber,
                dayKey,
                status: "reserved"
            });
            createdReservations.push(reservationDoc);
            createdReservationIds.push(reservationDoc._id);

            const slots = getSlotTimesForDay(evento, dayKey);
            const meetings = slots.map((slot) => ({
                evento: evento._id,
                tableReservation: reservationDoc._id,
                supplierId: user.id,
                tableNumber,
                dayKey,
                startTime: slot.startTime,
                endTime: slot.endTime,
                location: `${evento.modalidad === "virtual" ? "Sala" : "Mesa"} ${tableNumber}`,
                status: "available"
            }));

            if (meetings.length) {
                await Meeting.bulkWrite(
                    meetings.map((meeting) => ({
                        updateOne: {
                            filter: {
                                evento: meeting.evento,
                                dayKey: meeting.dayKey,
                                tableNumber: meeting.tableNumber,
                                startTime: meeting.startTime
                            },
                            update: {
                                $set: meeting,
                                $unset: { buyerId: "", feedback: "" }
                            },
                            upsert: true
                        }
                    })),
                    { ordered: true }
                );
            }
        }

        return createdReservations;
    } catch (error) {
        if (createdReservationIds.length) {
            await Promise.all([
                Meeting.deleteMany({ tableReservation: { $in: createdReservationIds }, buyerId: { $exists: false } }),
                TableReservation.deleteMany({ _id: { $in: createdReservationIds } })
            ]);
        }

        if (error.code === 11000) {
            throw new MeetingBusinessError("La mesa ya fue reservada para uno de los días seleccionados", 409);
        }

        throw error;
    }
};

const getBuyerMarketplace = async ({ user, eventoId, search = "", sector = "todos" }) => {
    assertRole(user, "demandante");
    const evento = await getApprovedEvento(eventoId);
    await assertActiveInscription(evento._id, user.id, "demandante");

    const reservations = await TableReservation.find({
        evento: evento._id,
        status: "reserved"
    })
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .sort({ dayKey: 1, tableNumber: 1 })
        .lean();

    const meetings = await Meeting.find({
        evento: evento._id,
        status: { $in: ["available", "reserved", "completed", "cancelled"] }
    })
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .populate("buyerId", "nombreEmpresa logoEmpresa sector")
        .sort({ startTime: 1 })
        .lean();

    const query = search.trim().toLowerCase();
    const cardsBySupplierDayTable = new Map();

    for (const reservation of reservations) {
        const supplier = reservation.supplierId;
        if (!supplier?._id) continue;

        const sectorMatches = !sector || sector === "todos" || supplier?.sector === sector;
        const searchMatches =
            !query ||
            supplier?.nombreEmpresa?.toLowerCase().includes(query) ||
            supplier?.sector?.toLowerCase().includes(query);

        if (!sectorMatches || !searchMatches) continue;

        cardsBySupplierDayTable.set(`${reservation.dayKey}:${reservation.tableNumber}:${supplier._id}`, {
            reservationId: String(reservation._id),
            dayKey: reservation.dayKey,
            tableNumber: reservation.tableNumber,
            supplier: {
                _id: String(supplier._id),
                nombreEmpresa: supplier.nombreEmpresa,
                logoEmpresa: supplier.logoEmpresa,
                sector: supplier.sector
            },
            sessions: []
        });
    }

    for (const meeting of meetings) {
        const supplierId = String(meeting.supplierId?._id ?? meeting.supplierId);
        const key = `${meeting.dayKey}:${meeting.tableNumber}:${supplierId}`;
        const card = cardsBySupplierDayTable.get(key);

        if (card) {
            card.sessions.push(normalizeMeeting(meeting));
        }
    }

    const supplierCards = Array.from(cardsBySupplierDayTable.values()).map((card) => ({
        ...card,
        availableSessions: card.sessions.filter((session) => session.status === "available").length
    }));

    const sectors = Array.from(
        new Set(reservations.map((reservation) => reservation.supplierId?.sector).filter(Boolean))
    ).sort();

    return {
        evento,
        days: getEventDays(evento),
        sectors,
        supplierCards
    };
};

const reserveBuyerSession = async ({ user, meetingId }) => {
    assertRole(user, "demandante");
    const meeting = await Meeting.findById(meetingId).lean();

    if (!meeting) {
        throw new MeetingBusinessError("Sesión no encontrada", 404);
    }

    await getApprovedEvento(meeting.evento);
    await assertActiveInscription(meeting.evento, user.id, "demandante");

    const overlap = await Meeting.findOne({
        evento: meeting.evento,
        buyerId: user.id,
        status: "reserved",
        startTime: { $lt: meeting.endTime },
        endTime: { $gt: meeting.startTime }
    }).lean();

    if (overlap) {
        throw new MeetingBusinessError("Ya tienes una reunión reservada en ese horario", 409);
    }

    const reserved = await Meeting.findOneAndUpdate(
        {
            _id: meetingId,
            status: "available",
            $or: [{ buyerId: { $exists: false } }, { buyerId: null }]
        },
        {
            $set: {
                buyerId: user.id,
                status: "reserved"
            }
        },
        { new: true }
    )
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .populate("buyerId", "nombreEmpresa logoEmpresa sector");

    if (!reserved) {
        throw new MeetingBusinessError("La sesión ya fue reservada por otra empresa", 409);
    }

    return normalizeMeeting(reserved);
};

const cancelBuyerSession = async ({ user, meetingId }) => {
    assertRole(user, "demandante");

    const meeting = await Meeting.findById(meetingId)
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .populate("buyerId", "nombreEmpresa logoEmpresa sector");

    if (!meeting) {
        throw new MeetingBusinessError("Reunión no encontrada", 404);
    }

    if (String(meeting.buyerId?._id ?? meeting.buyerId) !== String(user.id)) {
        throw new MeetingBusinessError("No tienes permiso para cancelar esta reunión", 403);
    }

    if (meeting.status !== "reserved") {
        throw new MeetingBusinessError("Solo puedes cancelar reuniones confirmadas", 400);
    }

    if (!canCancelBeforeWindow(meeting.startTime)) {
        throw new MeetingBusinessError("Solo puedes cancelar la reunión hasta 24 horas antes de la hora programada", 400);
    }

    const cancelledMeeting = normalizeMeeting(meeting);

    meeting.status = "available";
    meeting.buyerId = undefined;
    meeting.feedback = "";
    await meeting.save();

    // TODO: Enviar notificación al ofertante cuando se implemente el módulo de notificaciones

    return {
        cancelledMeeting,
        availableMeeting: normalizeMeeting(await meeting.populate("supplierId", "nombreEmpresa logoEmpresa sector"))
    };
};

const cancelDemandanteMeetingsForEvent = async ({ eventoId, userId }) => {
    const result = await Meeting.updateMany(
        {
            evento: eventoId,
            buyerId: userId,
            status: "reserved"
        },
        {
            $set: { status: "available", feedback: "" },
            $unset: { buyerId: "" }
        }
    );

    return result.modifiedCount ?? 0;
};

const cancelSupplierResourcesForEvent = async ({ eventoId, userId }) => {
    const [reservationResult, meetingResult] = await Promise.all([
        TableReservation.updateMany(
            {
                evento: eventoId,
                supplierId: userId,
                status: "reserved"
            },
            { $set: { status: "cancelled" } }
        ),
        Meeting.updateMany(
            {
                evento: eventoId,
                supplierId: userId,
                status: { $in: ["available", "reserved"] }
            },
            {
                $set: { status: "available", feedback: "" },
                $unset: { buyerId: "" }
            }
        )
    ]);

    // TODO: Notificar a demandantes afectados cuando exista módulo de notificaciones

    return {
        reservationsReleased: reservationResult.modifiedCount ?? 0,
        meetingsReleased: meetingResult.modifiedCount ?? 0
    };
};

const cancelRegistrationResources = async ({ user, eventoId }) => {
    assertEmpresaRole(user);

    const evento = await Evento.findById(eventoId).lean();

    if (!evento) {
        throw new MeetingBusinessError("Evento no encontrado", 404);
    }

    if (user.role === "ofertante") {
        if (isEventStarted(evento)) {
            throw new MeetingBusinessError("No puedes cancelar la inscripción porque el evento ya inició", 400);
        }

        return cancelSupplierResourcesForEvent({ eventoId: evento._id, userId: user.id });
    }

    const meetingsReleased = await cancelDemandanteMeetingsForEvent({ eventoId: evento._id, userId: user.id });
    return { meetingsReleased };
};

const getMeetingsForUser = async (user) => {
    let query = {};

    if (user.role === "ofertante") {
        const matches = await Match.find({ supplierId: user.id }).select("_id").lean();
        query = {
            $or: [
                { supplierId: user.id },
                { matchId: { $in: matches.map((match) => match._id) } }
            ],
            status: { $in: ["reserved", "scheduled", "completed", "cancelled", "no_show"] }
        };
    } else if (user.role === "demandante") {
        const matches = await Match.find({ buyerId: user.id }).select("_id").lean();
        query = {
            $or: [
                { buyerId: user.id },
                { matchId: { $in: matches.map((match) => match._id) } }
            ],
            status: { $in: ["reserved", "scheduled", "completed", "cancelled", "no_show"] }
        };
    } else if (user.role === "adminEvento") {
        const eventos = await Evento.find({ createdBy: user.id }).select("_id").lean();
        query = {
            evento: { $in: eventos.map((evento) => evento._id) },
            status: { $in: ["reserved", "scheduled", "completed", "cancelled", "no_show"] }
        };
    } else if (user.role === "adminSistema") {
        query = { status: { $in: ["reserved", "scheduled", "completed", "cancelled", "no_show"] } };
    } else {
        throw new MeetingBusinessError("No tienes permiso para consultar reuniones", 403);
    }

    const meetings = await Meeting.find(query)
        .populate("supplierId", "nombreEmpresa logoEmpresa sector")
        .populate("buyerId", "nombreEmpresa logoEmpresa sector")
        .populate("evento", "title startDate endDate")
        .populate({
            path: "matchId",
            populate: { path: "supplierId buyerId", select: "nombreEmpresa logoEmpresa sector" }
        })
        .sort({ startTime: 1, tableNumber: 1 })
        .lean();

    return meetings.map((meeting) => {
        const normalized = normalizeMeeting(meeting);
        const match = meeting.matchId;

        return {
            ...normalized,
            matchId: match?._id ? String(match._id) : normalized.matchId,
            evento: meeting.evento?._id ? String(meeting.evento._id) : normalized.evento,
            eventoInfo: meeting.evento?._id
                ? {
                    _id: String(meeting.evento._id),
                    title: meeting.evento.title,
                    startDate: meeting.evento.startDate,
                    endDate: meeting.evento.endDate
                }
                : null,
            supplier: normalized.supplier ?? (match?.supplierId?._id
                ? {
                    _id: String(match.supplierId._id),
                    nombreEmpresa: match.supplierId.nombreEmpresa,
                    logoEmpresa: match.supplierId.logoEmpresa,
                    sector: match.supplierId.sector
                }
                : null),
            buyer: normalized.buyer ?? (match?.buyerId?._id
                ? {
                    _id: String(match.buyerId._id),
                    nombreEmpresa: match.buyerId.nombreEmpresa,
                    logoEmpresa: match.buyerId.logoEmpresa,
                    sector: match.buyerId.sector
                }
                : null)
        };
    });
};

module.exports = {
    MeetingBusinessError,
    getMyRegisteredEvents,
    getSupplierWorkspace,
    reserveSupplierTable,
    getBuyerMarketplace,
    reserveBuyerSession,
    cancelBuyerSession,
    cancelRegistrationResources,
    getMeetingsForUser
};
