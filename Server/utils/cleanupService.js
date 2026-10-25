const Show = require("../models/showModel");

// Cleanup expired seat locks every minute
const startCleanupService = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      const shows = await Show.find({ "lockedSeats.expiresAt": { $lt: now } });

      for (const show of shows) {
        show.lockedSeats = show.lockedSeats.filter((lock) => lock.expiresAt > now);
        await show.save();
      }
    } catch (err) {
      // Quietly log error
      console.error("[Cleanup Service] Error clearing expired locks:", err.message);
    }
  }, 60 * 1000);
};

module.exports = { startCleanupService };
