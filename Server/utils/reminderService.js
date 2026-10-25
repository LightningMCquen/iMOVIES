const Booking = require("../models/bookingModel");

const startReminderService = () => {
  // Routine reminder checker (can run periodically)
  setInterval(async () => {
    try {
      // Logic for reminding upcoming shows within 2 hours
      const now = new Date();
      // Example placeholder logic
    } catch (err) {
      console.error("[Reminder Service] Error checking show reminders:", err.message);
    }
  }, 10 * 60 * 1000);
};

module.exports = { startReminderService };
