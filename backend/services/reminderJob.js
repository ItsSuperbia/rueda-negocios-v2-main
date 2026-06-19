const Meeting = require("../models/Meeting");
const Notification = require("../models/Notification");
const { notificationBus } = require("./notificationService");

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

const runReminderCheck = async () => {
    try {
        const now = new Date();
        const windowStart = new Date(now.getTime() + REMINDER_WINDOW_MS - CHECK_INTERVAL_MS / 2);
        const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS + CHECK_INTERVAL_MS / 2);

        const upcomingMeetings = await Meeting.find({
            startTime: { $gte: windowStart, $lte: windowEnd },
            status: { $in: ["reserved", "scheduled"] },
        }).lean();

        for (const meeting of upcomingMeetings) {
            const existingReminder = await Notification.findOne({
                type: "meeting_reminder",
                relatedEntityType: "Meeting",
                relatedEntityId: meeting._id,
                recipientUser: { $in: [meeting.supplierId, meeting.buyerId].filter(Boolean) },
            });

            if (existingReminder) continue;

            notificationBus.emit("meeting:reminder", {
                meeting,
                supplierId: meeting.supplierId,
                buyerId: meeting.buyerId,
            });
        }
    } catch (error) {
        console.error("Error in reminder check:", error);
    }
};

let reminderInterval = null;

const startReminderJob = () => {
    if (reminderInterval) return;

    runReminderCheck();

    reminderInterval = setInterval(runReminderCheck, CHECK_INTERVAL_MS);

    console.log("Notification reminder job started (checks every hour)");
};

const stopReminderJob = () => {
    if (reminderInterval) {
        clearInterval(reminderInterval);
        reminderInterval = null;
    }
};

module.exports = {
    startReminderJob,
    stopReminderJob,
    runReminderCheck,
};
