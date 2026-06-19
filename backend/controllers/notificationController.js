const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, isRead, page = "1", limit = "20" } = req.query;

        const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));

        const filters = { recipientUser: userId };

        if (type) {
            filters.type = type;
        }

        if (isRead === "true" || isRead === "false") {
            filters.isRead = isRead === "true";
        }

        const [total, notifications] = await Promise.all([
            Notification.countDocuments(filters),
            Notification.find(filters)
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
        ]);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);

        res.json({
            data: notifications,
            meta: {
                page: pageNum,
                pageSize: limitNum,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error("Error obteniendo notificaciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.countDocuments({
            recipientUser: userId,
            isRead: false,
        });

        res.json({ unreadCount: count });
    } catch (error) {
        console.error("Error obteniendo contador de notificaciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipientUser: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notificación no encontrada" });
        }

        res.json({ message: "Notificación marcada como leída", notification });
    } catch (error) {
        console.error("Error marcando notificación como leída:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { recipientUser: userId, isRead: false },
            { isRead: true }
        );

        res.json({
            message: "Todas las notificaciones marcadas como leídas",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error marcando todas las notificaciones como leídas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipientUser: userId,
        });

        if (!notification) {
            return res.status(404).json({ message: "Notificación no encontrada" });
        }

        res.json({ message: "Notificación eliminada" });
    } catch (error) {
        console.error("Error eliminando notificación:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
