const logger = require('../utils/logger');
const config = require('../config');

module.exports = {
  config: {
    name: 'gc_leave',
    description: 'Send a farewell message when a member leaves the group chat'
  },

  async run(bot, data) {
    try {
      if (config.LOG_EVENTS.disableAll || !config.LOG_EVENTS.event) return;

      const { api } = bot;
      const { threadID, leftUserId } = data;

      if (!leftUserId) return;

      // Don't send a leave message if the bot itself left
      if (String(leftUserId) === String(bot.userID)) return;

      logger.info(`Member left thread ${threadID}: ${leftUserId}`);

      // Try to get user info for a personalised message
      let displayName = `User ${leftUserId}`;
      try {
        const info = await api.getUserInfo(leftUserId);
        if (info) {
          const userData = info[leftUserId] || Object.values(info)[0];
          if (userData) {
            displayName = userData.name || userData.fullName || displayName;
          }
        }
      } catch (_) {}

      const message = `👋 ${displayName} has left the group. We'll miss you!`;
      await api.sendMessage(message, threadID);
    } catch (error) {
      logger.error('Error in gc_leave event', { error: error.message });
    }
  }
};
