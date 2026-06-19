const EventEmitter = require("events");
const Notification = require("../models/Notification");

class NotificationEventBus extends EventEmitter {}

const notificationBus = new NotificationEventBus();

notificationBus.setMaxListeners(50);

const createNotification = async ({ recipientUser, type, title, message, relatedEntityType, relatedEntityId }) => {
    const existing = await Notification.findOne({
        recipientUser,
        type,
        relatedEntityType: relatedEntityType ?? { $exists: false },
        relatedEntityId: relatedEntityId ?? { $exists: false },
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });

    if (existing) return existing;

    return Notification.create({
        recipientUser,
        type,
        title,
        message,
        relatedEntityType,
        relatedEntityId,
    });
};

const CHANNEL_REGISTRY = {
    meeting_created: ["in_app"],
    meeting_reminder: ["in_app"],
    meeting_cancelled: ["in_app"],
    meeting_rescheduled: ["in_app"],
    match_created: ["in_app"],
};

const getChannelsForType = (type) => CHANNEL_REGISTRY[type] ?? ["in_app"];

notificationBus.on("notification:created", async (payload) => {
    const channels = getChannelsForType(payload.type);

    for (const channel of channels) {
        try {
            switch (channel) {
                case "in_app":
                    break;
                case "email":
                    break;
                case "sms":
                    break;
                case "push":
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error(`Error delivering notification via ${channel}:`, error);
        }
    }
});

notificationBus.on("meeting:created", async ({ meeting, supplierId, buyerId }) => {
    try {
        const dateStr = new Date(meeting.startTime).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const timeStr = new Date(meeting.startTime).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const title = "Cita confirmada";
        const message = `Se ha programado una reunión para el día ${dateStr} a las ${timeStr}.`;

        const recipientIds = [supplierId, buyerId].filter(Boolean);

        for (const recipientId of recipientIds) {
            const notification = await createNotification({
                recipientUser: recipientId,
                type: "meeting_created",
                title,
                message,
                relatedEntityType: "Meeting",
                relatedEntityId: meeting._id,
            });

            notificationBus.emit("notification:created", notification);
        }
    } catch (error) {
        console.error("Error creating meeting_created notification:", error);
    }
});

notificationBus.on("meeting:reminder", async ({ meeting, supplierId, buyerId }) => {
    try {
        const timeStr = new Date(meeting.startTime).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const title = "Recordatorio de reunión";
        const message = `Tiene una reunión programada mañana a las ${timeStr}.`;

        const recipientIds = [supplierId, buyerId].filter(Boolean);

        for (const recipientId of recipientIds) {
            const notification = await createNotification({
                recipientUser: recipientId,
                type: "meeting_reminder",
                title,
                message,
                relatedEntityType: "Meeting",
                relatedEntityId: meeting._id,
            });

            notificationBus.emit("notification:created", notification);
        }
    } catch (error) {
        console.error("Error creating meeting_reminder notification:", error);
    }
});

notificationBus.on("meeting:cancelled", async ({ meeting, supplierId, buyerId }) => {
    try {
        const dateStr = new Date(meeting.startTime).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        const title = "Reunión cancelada";
        const message = `La reunión programada para el ${dateStr} ha sido cancelada.`;

        const recipientIds = [supplierId, buyerId].filter(Boolean);

        for (const recipientId of recipientIds) {
            const notification = await createNotification({
                recipientUser: recipientId,
                type: "meeting_cancelled",
                title,
                message,
                relatedEntityType: "Meeting",
                relatedEntityId: meeting._id,
            });

            notificationBus.emit("notification:created", notification);
        }
    } catch (error) {
        console.error("Error creating meeting_cancelled notification:", error);
    }
});

notificationBus.on("meeting:rescheduled", async ({ meeting, supplierId, buyerId }) => {
    try {
        const dateStr = new Date(meeting.startTime).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const timeStr = new Date(meeting.startTime).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const title = "Reunión reprogramada";
        const message = `La reunión fue reprogramada para el ${dateStr} a las ${timeStr}.`;

        const recipientIds = [supplierId, buyerId].filter(Boolean);

        for (const recipientId of recipientIds) {
            const notification = await createNotification({
                recipientUser: recipientId,
                type: "meeting_rescheduled",
                title,
                message,
                relatedEntityType: "Meeting",
                relatedEntityId: meeting._id,
            });

            notificationBus.emit("notification:created", notification);
        }
    } catch (error) {
        console.error("Error creating meeting_rescheduled notification:", error);
    }
});

notificationBus.on("match:created", async ({ match, supplierId, buyerId }) => {
    try {
        const title = "Nuevo match generado";
        const message = "Se ha encontrado una nueva oportunidad comercial compatible con su perfil.";

        const recipientIds = [supplierId, buyerId].filter(Boolean);

        for (const recipientId of recipientIds) {
            const notification = await createNotification({
                recipientUser: recipientId,
                type: "match_created",
                title,
                message,
                relatedEntityType: "Match",
                relatedEntityId: match._id,
            });

            notificationBus.emit("notification:created", notification);
        }
    } catch (error) {
        console.error("Error creating match_created notification:", error);
    }
});

module.exports = {
    notificationBus,
    createNotification,
};
