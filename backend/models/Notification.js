const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                "meeting_created",
                "meeting_reminder",
                "meeting_cancelled",
                "meeting_rescheduled",
                "match_created",
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        relatedEntityType: {
            type: String,
            enum: ["Meeting", "Match", "Evento"],
        },
        relatedEntityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipientUser: 1, isRead: 1 });
notificationSchema.index({ recipientUser: 1, type: 1 });
notificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
